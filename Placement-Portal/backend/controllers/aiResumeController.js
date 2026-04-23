const fs = require('fs');
const pdfParse = require('pdf-parse');
const Groq = require('groq-sdk');
const { StatusCodes } = require('http-status-codes');
const CustomAPIError = require('../errors');
const AIAnalysisHistory = require('../models/AIAnalysisHistory');

// Initialize Groq AI
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Parse resume file (PDF or text-based DOC)
 * Extracts raw text from uploaded file buffer
 */
async function parseResumeText(file) {
  const buffer = file.tempFilePath ? fs.readFileSync(file.tempFilePath) : file.data;
  const mimeType = file.mimetype || '';

  if (!buffer || buffer.length === 0) {
    throw new Error('File buffer is empty. File size: ' + file.size);
  }

  if (mimeType.includes('pdf') || file.name?.toLowerCase().endsWith('.pdf')) {
    const parsed = await pdfParse(buffer);
    return parsed.text;
  }

  // Fallback: treat as plain text (for .txt or .doc text dumps)
  return buffer.toString('utf-8');
}

/**
 * Trim resume text to a safe token limit (~4000 words max)
 */
function trimText(text, maxWords = 4000) {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '\n[...trimmed for length]';
}

/**
 * POST /api/v1/student/ai-resume/analyze
 * Body: multipart with `resume` (file) and `jobDescription` (text)
 */
const analyzeResume = async (req, res) => {
  const resumeFile = req.files?.resume;
  const jobDescription = req.body?.jobDescription?.trim() || '';

  // Validation
  if (!resumeFile) {
    throw new CustomAPIError.BadRequestError(
      'Please upload a resume file (PDF or DOC).'
    );
  }

  // Step 1: Parse resume text
  let resumeText;
  try {
    resumeText = await parseResumeText(resumeFile);
  } catch (err) {
    console.error('Resume parse error:', err);
    throw new CustomAPIError.BadRequestError(
      'Could not parse the resume file. Please upload a valid PDF or text file.'
    );
  }

  if (!resumeText || resumeText.trim().length < 50) {
    throw new CustomAPIError.BadRequestError(
      'The uploaded resume appears to be empty or could not be read. Please upload a text-based PDF.'
    );
  }

  // Trim to safe size
  const trimmedResume = trimText(resumeText, 3000);

  // Step 2: Build AI prompt
  const hasJD = jobDescription.length > 10;
  const prompt = buildAnalysisPrompt(trimmedResume, jobDescription, hasJD);

  // Step 3: Call Groq AI
  let aiResult;
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });
    const rawText = chatCompletion.choices[0]?.message?.content || "";
    aiResult = extractJSON(rawText);
  } catch (err) {
    console.error('Groq AI error:', err);
    throw new CustomAPIError.BadRequestError(
      'AI analysis failed. Details: ' + (err?.message || 'Unknown error')
    );
  }

  // Save history to DB
  try {
    await AIAnalysisHistory.create({
      student: req.user.userId,
      resumeFileName: req.files?.resume?.name || 'Unknown',
      jobDescription: jobDescription || '',
      analysisResult: aiResult,
    });
  } catch (err) {
    console.error('Failed to save AI analysis history:', err);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Analysis complete',
    resumeText: trimmedResume,
    analysis: aiResult,
  });
};

/**
 * Build the structured prompt for Gemini
 */
function buildAnalysisPrompt(resumeText, jobDescription, hasJD) {
  const jdSection = hasJD
    ? `JOB DESCRIPTION:\n${jobDescription}\n\n`
    : 'No job description provided — perform a general resume quality analysis.\n\n';

  return `You are an expert ATS resume analyst and career coach. Analyze the resume below ${hasJD ? 'against the provided job description' : 'for general quality'}.

${jdSection}RESUME CONTENT:
${resumeText}

Respond ONLY with valid JSON (no markdown, no backticks, no extra text). Use exactly this structure:

{
  "matchScore": <number 0-100${hasJD ? ' based on JD alignment' : ' based on overall resume quality'}>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "missingSkills": [${hasJD ? '"<skill missing from JD>"' : '"<important skill to add>"'}, ...],
  "weakAreas": ["<weak area 1>", "<weak area 2>"],
  "improvements": [
    "<specific actionable improvement 1>",
    "<specific actionable improvement 2>",
    "<specific actionable improvement 3>",
    "<specific actionable improvement 4>"
  ],
  "rewrittenPoints": [
    "<improved bullet point using action verb and quantification 1>",
    "<improved bullet point 2>",
    "<improved bullet point 3>"
  ],
  "atsKeywords": ["<keyword 1>", "<keyword 2>", ...],
  "atsBadges": {
    "formattingScore": <0-100>,
    "keywordScore": <0-100>,
    "quantificationScore": <0-100>,
    "actionVerbScore": <0-100>
  },
  "improvedResumeSections": {
    "summary": "<professional summary for resume, 2-3 sentences, tailored to JD>",
    "skills": "<comma-separated enhanced skills list>",
    "keyImprovements": ["<key change 1>", "<key change 2>", "<key change 3>"]
  }
}

RULES:
- Do NOT invent fake experience or education
- Only improve wording of EXISTING experience
- Use strong action verbs (Built, Designed, Optimized, Led, Implemented, etc.)
- Keep suggestions concise and professional
- rewrittenPoints should be based ONLY on content visible in the resume
- Respond with ONLY the JSON object, nothing else`;
}

/**
 * Extract JSON from AI response (handles edge cases)
 */
function extractJSON(text) {
  // Try direct parse first
  try {
    return JSON.parse(text.trim());
  } catch (_) {}

  // Try extracting JSON block from markdown response
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1].trim());
    } catch (_) {}
  }

  // Try finding raw {} block
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch (_) {}
  }

  throw new Error('Could not parse AI response as JSON');
}

/**
 * Get AI Analysis History
 */
const getHistory = async (req, res) => {
  const history = await AIAnalysisHistory.find({ student: req.user.userId })
    .sort({ createdAt: -1 })
    .limit(10); // get last 10
  
  res.status(StatusCodes.OK).json({
    success: true,
    history,
  });
};

module.exports = { analyzeResume, getHistory };
