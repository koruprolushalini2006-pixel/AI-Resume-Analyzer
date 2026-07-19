const Resume = require('../models/Resume');
const Analysis = require('../models/Analysis');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const sendResponse = require('../utils/ApiResponse');
const geminiService = require('../services/geminiService');

// @desc    Analyze a resume with Gemini AI, optionally against a job description
// @route   POST /api/analysis/analyze
// @access  Private
const analyzeResume = asyncHandler(async (req, res) => {
  const { resumeId, jobDescription } = req.body;

  const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
  if (!resume) {
    throw new ApiError(404, 'Resume not found');
  }

  const result = await geminiService.analyzeResume(resume.extractedText, jobDescription || '');

  const analysis = await Analysis.create({
    user: req.user._id,
    resume: resume._id,
    jobDescription: jobDescription || '',
    ...result,
  });

  sendResponse(res, 201, { analysis }, 'Resume analyzed successfully');
});

// @desc    Get a single analysis result by id
// @route   GET /api/analysis/:id
// @access  Private
const getAnalysisById = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findOne({ _id: req.params.id, user: req.user._id }).populate(
    'resume',
    'originalName fileType createdAt'
  );

  if (!analysis) {
    throw new ApiError(404, 'Analysis not found');
  }

  sendResponse(res, 200, { analysis }, 'Analysis fetched successfully');
});

module.exports = { analyzeResume, getAnalysisById };
