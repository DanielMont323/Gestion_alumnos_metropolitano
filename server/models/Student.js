const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  clinic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true
  },
  group: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  attendancePercentage: {
    type: Number,
    default: 0
  },
  performance: {
    type: Number,
    default: 0
  },
  presentation: {
    type: Number,
    default: 0
  },
  workbookProgress: {
    type: Number,
    default: 0
  },
  trainingHours: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
