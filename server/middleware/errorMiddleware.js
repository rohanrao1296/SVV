export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource endpoint '${req.originalUrl}' not found.`);
  res.status(404);
  next(error);
};

export const globalErrorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let userFriendlyMessage = err.message || 'An unexpected error occurred. Please try again.';

  if (userFriendlyMessage.includes('buffering timed out') || userFriendlyMessage.includes('TopologyDescription')) {
    userFriendlyMessage = 'Database connection is taking longer than expected. Please check network connection and try again.';
  } else if (userFriendlyMessage.includes('E11000 duplicate key')) {
    userFriendlyMessage = 'A record with this phone number or ID already exists.';
  }

  console.error(`❌ Server Error [${statusCode}]: ${err.message}`);
  
  res.status(statusCode).json({
    success: false,
    message: userFriendlyMessage
  });
};

export default { notFoundHandler, globalErrorHandler };
