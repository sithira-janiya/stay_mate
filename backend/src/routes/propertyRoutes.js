import express from 'express';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty
} from '../controllers/propertyController.js';

const router = express.Router();

router.get('/', getProperties);
router.get('/:id', getProperty);
router.post('/', createProperty);
router.put('/:id', updateProperty);
router.delete('/:id', deleteProperty);

// Use default export instead of named export
export default router;