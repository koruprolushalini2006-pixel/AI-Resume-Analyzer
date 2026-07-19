const express = require('express');
const {
  uploadResume,
  getResumeHistory,
  getResumeById,
  deleteResume,
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const validateObjectId = require('../utils/validateObjectId');

const router = express.Router();

router.use(protect);

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/history', getResumeHistory);
router.get('/:id', validateObjectId('id'), getResumeById);
router.delete('/:id', validateObjectId('id'), deleteResume);

module.exports = router;
