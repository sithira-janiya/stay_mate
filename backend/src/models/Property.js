import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  propertyId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['girls-hostel', 'boys-hostel']
  },
  location: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\s,.-]+$/.test(v);
      },
      message: 'Location should only contain letters, spaces, and basic punctuation'
    }
  },
  address: {
    type: String,
    required: true
  },
  numberOfRooms: {
    type: Number,
    required: true,
    min: 1,
    validate: {
      validator: Number.isInteger,
      message: 'Number of rooms must be a positive integer'
    }
  },
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  occupants: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate a human-readable property ID before saving
propertySchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Property').countDocuments();
    const prefix = this.type === 'girls-hostel' ? 'GH' : 'BH';
    this.propertyId = `${prefix}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model('property', propertySchema);