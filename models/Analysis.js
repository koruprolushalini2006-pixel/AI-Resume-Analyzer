const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      index: true,
    },
    jobDescription: {
      type: String,
      default: '',
    },
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    jobMatchScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    summary: {
      type: String,
      default: '',
    },
    technicalSkills: {
      type: [String],
      default: [],
    },
    softSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    suggestions: {
      type: [String],
      default: [],
    },
    grammarIssues: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analysis', analysisSchema);
