import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  roomName: {
    type: String,
    trim: true,
    default: function() {
      return 'Room ${this.roomNumber}';
    }
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  occupants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['full', 'vacant', 'available'],
    default: 'vacant'
  },
  roomType: {
    type: String,
    enum: ['single', 'double'],
    required: true
  },
  facilities: [{
    type: String
  }],
  roomPic: {
    type: String,
    default: ''
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  baseRent: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Update status based on occupants
roomSchema.methods.updateStatus = function() {
  if (this.occupants.length >= this.capacity) {
    this.status = 'full';
  } else if (this.occupants.length > 0) {
    this.status = 'available';
  } else {
    this.status = 'vacant';
  }
  return this.status;
};

// Virtual for available beds
roomSchema.virtual('availableBeds').get(function() {
  return this.capacity - this.occupants.length;
});

// Pre-save middleware to update status
roomSchema.pre('save', function(next) {
  this.updateStatus();
  next();
});

export default mongoose.model('Room', roomSchema);