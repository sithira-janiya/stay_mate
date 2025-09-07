import Room from '../models/Room.js';

// Get all rooms
export const getAllRooms = async (req, res) => {
  try {
    const { propertyId, status, roomType } = req.query;
    let filter = { isActive: true };
    
    if (propertyId) filter.propertyId = propertyId;
    if (status) filter.status = status;
    if (roomType) filter.roomType = roomType;

    const rooms = await Room.find(filter)
      .populate('occupants', 'fullName email phone')
      .populate('propertyId', 'name address');
    
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get room by ID
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('occupants', 'fullName email phone')
      .populate('propertyId', 'name address');
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new room
export const createRoom = async (req, res) => {
  try {
    // Check if room number already exists in the same property
    const existingRoom = await Room.findOne({
      roomNumber: req.body.roomNumber,
      propertyId: req.body.propertyId
    });
    
    if (existingRoom) {
      return res.status(400).json({ 
        message: 'Room number already exists in this property' 
      });
    }

    const room = new Room(req.body);
    const newRoom = await room.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('roomUpdated', newRoom);
    
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update room
export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('occupants', 'fullName email phone');
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('roomUpdated', room);
    
    res.json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete room (soft delete)
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('roomDeleted', req.params.id);
    
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get room statistics
export const getRoomStats = async (req, res) => {
  try {
    const { propertyId } = req.query;
    let filter = { isActive: true };
    if (propertyId) filter.propertyId = propertyId;

    const stats = await Room.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRooms: { $sum: 1 },
          totalCapacity: { $sum: '$capacity' },
          totalOccupants: { $sum: { $size: '$occupants' } },
          fullRooms: {
            $sum: {
              $cond: [{ $eq: ['$status', 'full'] }, 1, 0]
            }
          },
          availableRooms: {
            $sum: {
              $cond: [{ $eq: ['$status', 'available'] }, 1, 0]
            }
          },
          vacantRooms: {
            $sum: {
              $cond: [{ $eq: ['$status', 'vacant'] }, 1, 0]
            }
          }
        }
      }
    ]);
    
    res.json(stats[0] || {
      totalRooms: 0,
      totalCapacity: 0,
      totalOccupants: 0,
      fullRooms: 0,
      availableRooms: 0,
      vacantRooms: 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

