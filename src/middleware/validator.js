import { body, validationResult } from 'express-validator';

/**
 * Validation middleware for message endpoint
 */
export const validateMessage = [
  body('contents')
    .isArray()
    .withMessage('contents must be an array')
    .notEmpty()
    .withMessage('contents array cannot be empty'),
  
  body('contents.*.role')
    .isIn(['user', 'model', 'system'])
    .withMessage('role must be one of: user, model, system'),
  
  body('contents.*.parts')
    .isArray()
    .withMessage('parts must be an array')
    .notEmpty()
    .withMessage('parts array cannot be empty'),
  
  body('contents.*.parts.*.text')
    .isString()
    .withMessage('text must be a string')
    .notEmpty()
    .withMessage('text cannot be empty'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];

