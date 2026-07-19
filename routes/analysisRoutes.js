const express = require('express');
const { body } = require('express-validator');
const { analyzeResume, getAnalysisById } = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const validateObjectId = require('../utils/validateObjectId');

const router = express.Router();

router.use(protect);

router.post(
  '/analyze',
  [
    body('resumeId').isMongoId().withMessage('A valid resumeId is required'),
    body('jobDescription').optional().isString().isLength({ max: 10000 }),
  ],
  validate,
  analyzeResume
);

router.get('/:id', validateObjectId('id'), getAnalysisById);

module.exports = router;
