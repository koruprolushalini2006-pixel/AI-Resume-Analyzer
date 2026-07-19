const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  logoutUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later' },
});

const strongPassword = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/[a-z]/)
  .withMessage('Password must contain a lowercase letter')
  .matches(/[A-Z]/)
  .withMessage('Password must contain an uppercase letter')
  .matches(/\d/)
  .withMessage('Password must contain a number')
  .matches(/[^A-Za-z0-9]/)
  .withMessage('Password must contain a special character');

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    strongPassword,
  ],
  validate,
  registerUser
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  loginUser
);

router.get('/profile', protect, getProfile);

router.put(
  '/profile',
  protect,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().trim(),
    body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be under 500 characters'),
    body('password')
      .optional()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/[a-z]/)
      .withMessage('Password must contain a lowercase letter')
      .matches(/[A-Z]/)
      .withMessage('Password must contain an uppercase letter')
      .matches(/\d/)
      .withMessage('Password must contain a number')
      .matches(/[^A-Za-z0-9]/)
      .withMessage('Password must contain a special character'),
  ],
  validate,
  updateProfile
);

router.post('/logout', protect, logoutUser);

module.exports = router;
