module.exports = function notFound(message, errorCode) {
  Error.captureStackTrace(this, this.constructor);

  this.name = this.constructor.name;
  this.message = message || 'You do not have permission to perform this action.';
  this.statusCode = 401;
  this.errorCode = errorCode || 401;
};

require('util').inherits(module.exports, Error);