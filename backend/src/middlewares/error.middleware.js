const errorHandler = (err, req, res, next) => {
  // Log the error stack for debugging (server-side only)
  console.error(err.stack);

  // Use the status code set in the error, or default to 500
  const statusCode = err.statusCode || 500;
  
  // Use the message set in the error, or default to 'Server Error'
  const message = err.message || 'Server Error';

  res.status(statusCode).json({
    success: false,
    message: message,
    // in production, we might want to hide the stack trace
    stack: process.env.NODE_ENV === 'production' ? null : err.stack, 
  });
};

module.exports = errorHandler;