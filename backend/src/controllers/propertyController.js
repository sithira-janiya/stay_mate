import Property from '../models/Property.js';

// Get all properties with summary
const getProperties = async (req, res) => {
  try {
    const { search, type } = req.query;
    let filter = {};
    
    if (search) {
      filter.$or = [
        { propertyId: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) {
      filter.type = type;
    }
    
    const properties = await Property.find(filter).populate('landlordId', 'fullName email');
    
    // Calculate summary
    const totalProperties = await Property.countDocuments();
    const totalOccupants = await Property.aggregate([
      { $group: { _id: null, total: { $sum: '$occupants' } } }
    ]);
    
    res.json({
      properties,
      summary: {
        totalProperties,
        totalOccupants: totalOccupants[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single property
const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create property
const createProperty = async (req, res) => {
  try {
    const property = new Property(req.body);
    const savedProperty = await property.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('property-added', savedProperty);
    
    res.status(201).json(savedProperty);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(500).json({ message: error.message });
  }
};

// Update property
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('property-updated', property);
    
    res.json(property);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete property
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if property has rooms or occupants
    const rooms = await Room.find({ propertyId: req.params.id });
    if (rooms.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete property with existing rooms. Delete rooms first.' 
      });
    }
    
    await Property.findByIdAndDelete(req.params.id);
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('property-deleted', req.params.id);
    
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export all functions as named exports
export {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty
};