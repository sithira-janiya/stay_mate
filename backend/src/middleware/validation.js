const { body, validationResult } = require('express-validator');

// Validation rules for registration
const validateRegistration = [
  body('tenantId')
    .isLength({ min: 3 })
    .withMessage('Tenant ID must be at least 3 characters')
    .matches(/^T\d+$/)
    .withMessage('Tenant ID must start with T followed by numbers'),
  
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim()
    .escape(),
  
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
  
  body('property')
    .isIn(['Property A', 'Property B', 'Property C'])
    .withMessage('Please select a valid property'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validate QR code data
const validateQRCode = (req, res, next) => {
  const { qrData } = req.body;
  
  if (!qrData) {
    return res.status(400).json({
      success: false,
      message: 'QR code data is required'
    });
  }

  try {
    const qrInfo = JSON.parse(qrData);
    
    if (!qrInfo.tenantId || !qrInfo.property) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code format'
      });
    }
    
    req.qrInfo = qrInfo;
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid QR code data'
    });
  }
};

module.exports = {
  validateRegistration,
  validateQRCode
};