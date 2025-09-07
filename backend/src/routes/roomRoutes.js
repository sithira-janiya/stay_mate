import express from 'express';
import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomStats
} from '../controllers/roomController.js';
import { validateRoom } from '../middleware/roomValidation.js';

const router = express.Router();

router.get('/', getAllRooms);
router.get('/stats', getRoomStats);
router.get('/:id', getRoomById);
router.post('/', validateRoom, createRoom);
router.put('/:id', validateRoom, updateRoom);
router.delete('/:id', deleteRoom);

export default router;