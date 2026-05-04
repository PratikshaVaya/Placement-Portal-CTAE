const ResumeModel = require('../models/Resume');
const UserModel = require('../models/User');
const CustomAPIError = require('../errors');
const { StatusCodes } = require('http-status-codes');
const PDFDocument = require('pdfkit');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Get or create resume for student
const getResume = async (req, res) => {
  const userId = req.user.userId;

  let resume = await ResumeModel.findOne({ studentId: userId });

  if (!resume) {
    // Create empty resume if not exists
    resume = await ResumeModel.create({
      studentId: userId,
      header: {},
      education: [],
      experience: [],
      leadership: [],
      skills: {},
    });
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Resume retrieved successfully',
    resume,
  });
};

// Update resume
const updateResume = async (req, res) => {
  const userId = req.user.userId;
  const resumeData = req.body;

  let resume = await ResumeModel.findOne({ studentId: userId });

  if (!resume) {
    resume = await ResumeModel.create({
      studentId: userId,
      ...resumeData,
    });
  } else {
    Object.assign(resume, resumeData);
    await resume.save();
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Resume updated successfully',
    resume,
  });
};

// Generate PDF resume
const generatePDF = async (req, res) => {
  const userId = req.user.userId;

  const resume = await ResumeModel.findOne({ studentId: userId });

  if (!resume) {
    throw new CustomAPIError.NotFoundError('Resume not found');
  }

  const doc = new PDFDocument({
    size: 'LETTER',
    margins: {
      top: 36,
      bottom: 36,
      left: 36,
      right: 36,
    },
  });

  const fullName = `${resume.header.firstName || ''} ${resume.header.lastName || ''}`.trim();
  const fileName = `resume-${fullName.replace(/\s+/g, '-') || 'Student'}-${Date.now()}.pdf`;

  // Set response headers for PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${fileName}"`
  );

  // Prepare for saving to Cloudinary
  const tmpFolder = path.resolve(__dirname, '../tmp');
  if (!fs.existsSync(tmpFolder)) {
    fs.mkdirSync(tmpFolder, { recursive: true });
  }
  const tmpPath = path.join(tmpFolder, `${crypto.randomUUID()}.pdf`);
  const writeStream = fs.createWriteStream(tmpPath);

  doc.pipe(writeStream); // Save to tmp file for Cloudinary
  doc.pipe(res); // Send to user for download

  const pageHeight = doc.page.height - 72; // 72 points = 1 inch (top and bottom margins)
  let currentY = 36;

  const addText = (text, x = 36, fontSize = 10, bold = false, align = 'left') => {
    if (currentY > pageHeight) {
      doc.addPage().moveTo(36, 36);
      currentY = 36;
    }
    doc.fontSize(fontSize);
    if (bold) doc.font('Helvetica-Bold');
    doc.text(text, x, currentY, { width: doc.page.width - 72, align });
    if (bold) doc.font('Helvetica');
    currentY = doc.y + 2;
    return currentY;
  };

  const addLine = () => {
    if (currentY > pageHeight - 10) {
      doc.addPage().moveTo(36, 36);
      currentY = 36;
    }
    doc.moveTo(36, currentY).lineTo(doc.page.width - 36, currentY).stroke();
    currentY += 6;
  };



  // Header
  addText(fullName, 36, 16, true, 'center');
  currentY -= 2;

  const address = [
    resume.header.address,
    resume.header.city,
    resume.header.state,
    resume.header.zipCode,
  ]
    .filter(Boolean)
    .join(', ');
  
  const contactParts = [];
  if (address) contactParts.push(address);
  if (resume.header.email) contactParts.push(resume.header.email);
  if (resume.header.phone) contactParts.push(resume.header.phone);
  
  const contactInfo = contactParts.join(' • ');
  addText(contactInfo, 36, 9, false, 'center');
  
  // Profile links - make them clickable and centered
  const profileLinksList = [
    resume.header.linkedIn && { name: 'LinkedIn', url: resume.header.linkedIn },
    resume.header.github && { name: 'GitHub', url: resume.header.github },
    resume.header.leetcode && { name: 'LeetCode', url: resume.header.leetcode },
  ].filter(Boolean);
  
  if (profileLinksList.length > 0) {
    const linkFontSize = 9;
    doc.fontSize(linkFontSize).fillColor('0066cc');
    
    // Calculate total width to center the links line
    let totalWidth = 0;
    profileLinksList.forEach((link, idx) => {
      totalWidth += doc.widthOfString(link.name);
      if (idx < profileLinksList.length - 1) {
        totalWidth += doc.widthOfString(' • ');
      }
    });
    
    let startX = (doc.page.width - totalWidth) / 2;
    let currentX = startX;
    
    profileLinksList.forEach((link, idx) => {
      // Draw link text
      doc.text(link.name, currentX, currentY, {
        link: link.url,
        underline: true,
        continued: idx < profileLinksList.length - 1
      });
      
      currentX += doc.widthOfString(link.name);
      
      if (idx < profileLinksList.length - 1) {
        doc.fillColor('black').text(' • ', { continued: true, underline: false });
        doc.fillColor('0066cc');
        currentX += doc.widthOfString(' • ');
      }
    });
    
    // Reset for next lines
    doc.fillColor('black').text('', { continued: false }); 
    currentY = doc.y + 4;
  }
  
  // Horizontal line below header
  doc.moveTo(36, currentY).lineTo(doc.page.width - 36, currentY).stroke();
  currentY += 8;

  // Education Section
  if (resume.education && resume.education.length > 0) {
    currentY += 4;
    addText('EDUCATION', 36, 11, true);
    doc.moveTo(36, currentY - 2).lineTo(doc.page.width - 36, currentY - 2).lineWidth(0.5).stroke();
    currentY += 4;

    resume.education.forEach((edu, idx) => {
      if (currentY > pageHeight - 40) {
        doc.addPage().moveTo(36, 36);
        currentY = 36;
      }

      const eduHeader = `${edu.institution}`;
      const eduLocation = `${edu.city || ''}${edu.state ? ', ' + edu.state : ''}`.trim();
      
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(eduHeader, 36, currentY);
      
      // Right-aligned location
      if (eduLocation) {
        doc.text(eduLocation, 36, currentY, { align: 'right', width: doc.page.width - 72 });
      }
      currentY = doc.y;

      const degreeInfo = `${edu.degree}${edu.concentration ? ', ' + edu.concentration : ''}`;
      const graduationDate = `${edu.graduationMonth || ''} ${edu.graduationYear || ''}`.trim();
      
      doc.fontSize(9).font('Helvetica-Oblique');
      doc.text(degreeInfo, 36, currentY);
      
      // Right-aligned graduation date
      if (graduationDate) {
        doc.text(graduationDate, 36, currentY, { align: 'right', width: doc.page.width - 72 });
      }
      currentY = doc.y;

      if (edu.gpa) {
        doc.fontSize(9).font('Helvetica');
        doc.text(`GPA: ${edu.gpa}`, 36, currentY);
        currentY = doc.y;
      }

      if (edu.relevantCoursework) {
        doc.fontSize(9);
        doc.text(`Relevant Coursework: ${edu.relevantCoursework}`, 36, currentY);
        currentY = doc.y;
      }

      currentY += 3;
    });
  }

  // Experience Section
  if (resume.experience && resume.experience.length > 0) {
    currentY += 2;
    addText('Experience', 36, 11, true);
    currentY -= 2;

    resume.experience.slice(0, 3).forEach((exp) => {
      if (currentY > pageHeight - 50) {
        doc.addPage().moveTo(36, 36);
        currentY = 36;
      }

      const expHeader = `${exp.organization}`;
      const expLocation = `${exp.city || ''}${exp.location ? ', ' + exp.location : ''}`.trim();
      
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(expHeader, 36, currentY);
      
      if (expLocation) {
        doc.text(expLocation, 36, currentY, { align: 'right', width: doc.page.width - 72 });
      }
      currentY = doc.y;

      const roleInfo = exp.positionTitle || '';
      const dateRange = `${exp.startMonth || ''} ${exp.startYear || ''} – ${
        exp.isCurrent ? 'Present' : (exp.endMonth || '') + ' ' + (exp.endYear || '')
      }`.trim();
      
      doc.fontSize(9).font('Helvetica-Oblique');
      doc.text(roleInfo, 36, currentY);
      
      if (dateRange) {
        doc.text(dateRange, 36, currentY, { align: 'right', width: doc.page.width - 72 });
      }
      currentY = doc.y;

      if (exp.bulletPoints && exp.bulletPoints.length > 0) {
        exp.bulletPoints.slice(0, 4).forEach((bullet) => {
          if (currentY > pageHeight - 15) {
            doc.addPage().moveTo(36, 36);
            currentY = 36;
          }
          doc.fontSize(9);
          doc.text(`• ${bullet.text}`, 50, currentY, { width: doc.page.width - 150 });
          currentY = doc.y + 2;
        });
      }

      currentY += 2;
    });
  }

  // Leadership & Activities Section
  if (resume.leadership && resume.leadership.length > 0) {
    currentY += 4;
    addText('LEADERSHIP & ACTIVITIES', 36, 11, true);
    doc.moveTo(36, currentY - 2).lineTo(doc.page.width - 36, currentY - 2).lineWidth(0.5).stroke();
    currentY += 4;

    resume.leadership.slice(0, 2).forEach((lead) => {
      if (currentY > pageHeight - 50) {
        doc.addPage().moveTo(36, 36);
        currentY = 36;
      }

      const leadHeader = `${lead.organization}`;
      const leadLocation = `${lead.city || ''}${lead.state ? ', ' + lead.state : ''}`.trim();
      
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(leadHeader, 36, currentY);
      
      if (leadLocation) {
        doc.text(leadLocation, 36, currentY, { align: 'right', width: doc.page.width - 72 });
      }
      currentY = doc.y;

      const roleInfo = lead.role || '';
      const dateRange = `${lead.startMonth || ''} ${lead.startYear || ''} – ${
        lead.isCurrent ? 'Present' : (lead.endMonth || '') + ' ' + (lead.endYear || '')
      }`.trim();
      
      doc.fontSize(9).font('Helvetica-Oblique');
      doc.text(roleInfo, 36, currentY);
      
      if (dateRange) {
        doc.text(dateRange, 36, currentY, { align: 'right', width: doc.page.width - 72 });
      }
      currentY = doc.y;

      if (lead.bulletPoints && lead.bulletPoints.length > 0) {
        lead.bulletPoints.slice(0, 3).forEach((bullet) => {
          if (currentY > pageHeight - 15) {
            doc.addPage().moveTo(36, 36);
            currentY = 36;
          }
          doc.fontSize(9).font('Helvetica');
          doc.text(`• ${bullet.text}`, 50, currentY, { width: doc.page.width - 150 });
          currentY = doc.y + 2;
        });
      }

      currentY += 2;
    });
  }

  // Skills & Interests Section
  if (
    resume.skills?.technical ||
    resume.skills?.languages ||
    resume.skills?.laboratory ||
    resume.interests
  ) {
    currentY += 4;
    addText('SKILLS & INTERESTS', 36, 11, true);
    doc.moveTo(36, currentY - 2).lineTo(doc.page.width - 36, currentY - 2).lineWidth(0.5).stroke();
    currentY += 4;

    if (resume.skills?.technical) {
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Technical: ', 36, currentY);
      currentY = doc.y - 2;
      doc.font('Helvetica');
      doc.text(resume.skills.technical, 120, currentY - 2, {
        width: doc.page.width - 156,
      });
      currentY = doc.y + 2;
    }

    if (resume.skills?.languages) {
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Languages: ', 36, currentY);
      currentY = doc.y - 2;
      doc.font('Helvetica');
      doc.text(resume.skills.languages, 120, currentY - 2, {
        width: doc.page.width - 156,
      });
      currentY = doc.y + 2;
    }

    if (resume.skills?.laboratory) {
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Laboratory: ', 36, currentY);
      currentY = doc.y - 2;
      doc.font('Helvetica');
      doc.text(resume.skills.laboratory, 120, currentY - 2, {
        width: doc.page.width - 156,
      });
      currentY = doc.y + 2;
    }

    if (resume.interests) {
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Interests: ', 36, currentY);
      currentY = doc.y - 2;
      doc.font('Helvetica');
      doc.text(resume.interests, 120, currentY - 2, {
        width: doc.page.width - 156,
      });
      currentY = doc.y + 2;
    }
  }

  doc.end();

  // After PDF generation is done, upload to Cloudinary and save to User Profile
  writeStream.on('finish', async () => {
    console.log(`Starting background resume upload for user: ${userId}`);
    try {
      const uploadedFile = await cloudinary.uploader.upload(tmpPath, {
        folder: 'Placement-Portal/resumes',
        resource_type: 'raw',
        public_id: fileName,
      });

      if (uploadedFile) {
        await UserModel.findByIdAndUpdate(userId, {
          resume: uploadedFile.secure_url,
        });
        console.log(`Successfully saved resume URL to profile for user: ${userId}`);
      }
    } catch (error) {
      console.error(`CRITICAL: Error saving resume to profile for user ${userId}:`, error);
    } finally {
      // Cleanup
      if (fs.existsSync(tmpPath)) {
        fs.unlinkSync(tmpPath);
        console.log(`Cleaned up temporary resume file: ${tmpPath}`);
      }
    }
  });
};

module.exports = {
  getResume,
  updateResume,
  generatePDF,
};
