import { body, validationResult } from 'express-validator';

export const validateRoom = [
  body('roomNumber')
    .notEmpty()
    .withMessage('Room number is required')
    .isLength({ min: 2, max: 10 })
    .withMessage('Room number must be between 2-10 characters')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('Room number can only contain letters, numbers, and hyphens'),

  body('capacity')
    .isInt({ min: 1, max: 4 })
    .withMessage('Capacity must be between 1-4'),

  body('roomType')
    .isIn(['single', 'double', 'shared', 'suite'])
    .withMessage('Invalid room type'),

  body('baseRent')
    .isFloat({ min: 0 })
    .withMessage('Base rent must be a positive number'),

  body('propertyId')
    .notEmpty()
    .withMessage('Property ID is required')
    .isMongoId()
    .withMessage('Invalid property ID'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];