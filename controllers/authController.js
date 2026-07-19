const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const sendResponse = require('../utils/ApiResponse');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  sendResponse(res, 201, { user: user.toSafeObject(), token }, 'User registered successfully');
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user._id);

  sendResponse(res, 200, { user: user.toSafeObject(), token }, 'Login successful');
});

// @desc    Get current user's profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  sendResponse(res, 200, { user: req.user.toSafeObject() }, 'Profile fetched successfully');
});

// @desc    Update current user's profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, bio, password } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (bio !== undefined) user.bio = bio;
  if (password) user.password = password;

  await user.save();

  sendResponse(res, 200, { user: user.toSafeObject() }, 'Profile updated successfully');
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  // JWTs are stateless; logout is handled client-side by discarding the token.
  sendResponse(res, 200, null, 'Logged out successfully');
});

module.exports = { registerUser, loginUser, getProfile, updateProfile, logoutUser };
