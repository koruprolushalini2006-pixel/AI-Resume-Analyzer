const mongoose = require('mongoose');
const ApiError = require('./ApiError');

const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const value = req.params[paramName];
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return next(new ApiError(400, `Invalid ${paramName}: ${value}`));
  }
  next();
};

module.exports = validateObjectId;
