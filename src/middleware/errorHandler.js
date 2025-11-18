import { logger } from '../utils/logger.js';

/**
 * Global error handling middleware
 * Handles all errors and returns appropriate responses
 */
export const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  // Azure AI errors
  if (err.name === 'AzureAIError') {
    statusCode = 502;
    message = 'Azure AI service error: ' + err.message;
  }

  // Send error response
  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

