const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  clinic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  performance: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  presentation: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  workbookActivities: {
    type: Number,
    default: 0
  },
  trainingHours: {
    type: Number,
    default: 0
  },
  attendance: {
    type: Number,
    default: 0
  },
  workbook: {
    type: Number,
    default: 0
  },
  constantTraining: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Evaluation', evaluationSchema);
