const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const tenantSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^T\d{3,}$/.test(v); // Tenant ID must start with T followed by numbers
      },
      message: 'Tenant ID must start with T followed by numbers'
    }
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  property: {
    type: String,
    required: true,
    enum: ['Property A', 'Property B', 'Property C']
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    default: 'Absent'
  },
  qrCode: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

tenantSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  // Generate QR code data when tenant is created
  if (this.isNew) {
    this.qrCode = JSON.stringify({
      tenantId: this.tenantId,
      property: this.property,
      createdAt: new Date()
    });
  }
});

tenantSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Tenant', tenantSchema);