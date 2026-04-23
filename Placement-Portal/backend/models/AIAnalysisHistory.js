const mongoose = require('mongoose');

const AIAnalysisHistorySchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeFileName: {
      type: String,
      default: 'Unknown File',
    },
    jobDescription: {
      type: String,
      default: '',
    },
    analysisResult: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIAnalysisHistory', AIAnalysisHistorySchema);
