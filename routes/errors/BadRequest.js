module.exports = function notFound(message, errorCode) {
  Error.captureStackTrace(this, this.constructor);

  this.name = this.constructor.name;
  this.message = message || 'The server could not process your request.';
  this.statusCode = 400;
  this.errorCode = errorCode || 400;
};

require('util').inherits(module.exports, Error);