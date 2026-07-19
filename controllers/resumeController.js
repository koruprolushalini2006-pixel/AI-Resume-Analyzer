const fs = require('fs/promises');
const Resume = require('../models/Resume');
const Analysis = require('../models/Analysis');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const sendResponse = require('../utils/ApiResponse');
const { ALLOWED_MIME_TYPES } = require('../middleware/uploadMiddleware');
const fileParserService = require('../services/fileParserService');

// @desc    Upload a resume (PDF/DOCX), extract its text
// @route   POST /api/resume/upload
// @access  Private
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded. Field name must be "resume"');
  }

  const fileType = ALLOWED_MIME_TYPES[req.file.mimetype];

  let extractedText;
  try {
    extractedText = await fileParserService.extractText(req.file.path, fileType);
  } catch (err) {
    await fs.unlink(req.file.path).catch(() => {});
    throw err;
  }

  const resume = await Resume.create({
    user: req.user._id,
    originalName: req.file.originalname,
    storedFileName: req.file.filename,
    filePath: req.file.path,
    fileType,
    fileSize: req.file.size,
    extractedText,
  });

  sendResponse(
    res,
    201,
    {
      resume: {
        id: resume._id,
        originalName: resume.originalName,
        fileType: resume.fileType,
        fileSize: resume.fileSize,
        createdAt: resume.createdAt,
      },
    },
    'Resume uploaded and parsed successfully'
  );
});

// @desc    Get current user's resume upload history
// @route   GET /api/resume/history
// @access  Private
const getResumeHistory = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ user: req.user._id })
    .select('-extractedText -filePath')
    .sort({ createdAt: -1 });

  sendResponse(res, 200, { resumes }, 'Resume history fetched successfully');
});

// @desc    Get a single resume by id
// @route   GET /api/resume/:id
// @access  Private
const getResumeById = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

  if (!resume) {
    throw new ApiError(404, 'Resume not found');
  }

  sendResponse(res, 200, { resume }, 'Resume fetched successfully');
});

// @desc    Delete a resume and its analyses
// @route   DELETE /api/resume/:id
// @access  Private
const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

  if (!resume) {
    throw new ApiError(404, 'Resume not found');
  }

  await Analysis.deleteMany({ resume: resume._id });
  await fs.unlink(resume.filePath).catch(() => {});
  await resume.deleteOne();

  sendResponse(res, 200, null, 'Resume deleted successfully');
});

module.exports = { uploadResume, getResumeHistory, getResumeById, deleteResume };
