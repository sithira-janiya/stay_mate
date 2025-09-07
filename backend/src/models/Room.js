const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNo: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]-\d{3}$/.test(v); // Format: A-101, B-205, etc.
      },
      message: 'Room number must be in format A-101'
    }
  },
  property: {
    type: String,
    required: true,
    enum: ['Property A', 'Property B', 'Property C']
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  currentOccupancy: {
    type: Number,
    default: 0,
    validate: {
      validator: function(v) {
        return v <= this.capacity;
      },
      message: 'Occupancy cannot exceed capacity'
    }
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Update occupancy when tenants are added/removed
roomSchema.methods.updateOccupancy = async function() {
  const Tenant = mongoose.model('Tenant');
  const count = await Tenant.countDocuments({ roomId: this._id });
  this.currentOccupancy = count;
  await this.save();
};

module.exports = mongoose.model('Room', roomSchema);