const express = require('express');
const Evaluation = require('../models/Evaluation');
const Student = require('../models/Student');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get evaluations
router.get('/', async (req, res) => {
  try {
    const { studentId, clinicId } = req.query;
    
    let query = {};
    
    if (studentId) query.student = studentId;
    if (clinicId) query.clinic = clinicId;

    const evaluations = await Evaluation.find(query)
      .populate('student', 'name group')
      .populate('clinic', 'name')
      .sort({ date: -1 });

    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get latest evaluation for a student
router.get('/student/:studentId/latest', async (req, res) => {
  try {
    const evaluation = await Evaluation.findOne({ 
      student: req.params.studentId 
    })
    .populate('student', 'name group')
    .populate('clinic', 'name')
    .sort({ date: -1 });

    if (!evaluation) {
      return res.status(404).json({ message: 'No evaluation found for this student' });
    }

    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new evaluation
router.post('/', [
  body('student').notEmpty().withMessage('Student is required'),
  body('clinic').notEmpty().withMessage('Clinic is required'),
  body('performance').isInt({ min: 0, max: 100 }).withMessage('Performance must be between 0 and 100'),
  body('presentation').isInt({ min: 0, max: 100 }).withMessage('Presentation must be between 0 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { student, clinic, performance, presentation, workbookActivities, trainingHours } = req.body;

    // Get student data to calculate attendance
    const studentData = await Student.findById(student);
    if (!studentData) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Calculate derived metrics
    const attendance = studentData.attendancePercentage || 0;
    const workbook = Math.min(100, (workbookActivities || 0) * 10); // Assuming 10 activities = 100%
    const constantTraining = Math.min(100, (trainingHours || 0) * 2); // Assuming 50 hours = 100%

    const evaluation = new Evaluation({
      student,
      clinic,
      performance,
      presentation,
      workbookActivities: workbookActivities || 0,
      trainingHours: trainingHours || 0,
      attendance,
      workbook,
      constantTraining
    });

    await evaluation.save();

    // Update student's performance metrics
    await Student.findByIdAndUpdate(student, {
      performance,
      presentation,
      workbookProgress: workbook,
      trainingHours: trainingHours || 0
    });

    const populatedEvaluation = await Evaluation.findById(evaluation._id)
      .populate('student', 'name group')
      .populate('clinic', 'name');

    res.status(201).json(populatedEvaluation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update evaluation
router.put('/:id', async (req, res) => {
  try {
    const evaluation = await Evaluation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('student').populate('clinic');
    
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    
    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete evaluation
router.delete('/:id', async (req, res) => {
  try {
    const evaluation = await Evaluation.findByIdAndDelete(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    res.json({ message: 'Evaluation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
