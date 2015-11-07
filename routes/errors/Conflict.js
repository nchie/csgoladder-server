module.exports = function notFound(message, errorCode) {
  Error.captureStackTrace(this, this.constructor);

  this.name = this.constructor.name;
  this.message = message || 'The request could not be completed.';
  this.statusCode = 409;
  this.errorCode = errorCode || 409;
};

require('util').inherits(module.exports, Error);