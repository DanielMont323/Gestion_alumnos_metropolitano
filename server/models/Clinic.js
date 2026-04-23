const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  groups: [{
    name: {
      type: String,
      required: true
    },
    days: {
      type: [String],
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    activities: {
      type: Number,
      required: true
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Clinic', clinicSchema);
