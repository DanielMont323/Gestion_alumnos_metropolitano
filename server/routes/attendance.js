const express = require('express');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const EvaluationCriteria = require('../models/EvaluationCriteria');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get attendance records
router.get('/', async (req, res) => {
  try {
    const { studentId, clinicId, date, month, year } = req.query;
    
    let query = {};
    
    if (studentId) query.student = studentId;
    if (clinicId) query.clinic = clinicId;
    if (date) {
      // Fix timezone issue by creating date at noon in local timezone
      const startDate = new Date(date);
      startDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
      const endDate = new Date(date);
      endDate.setHours(13, 0, 0, 0); // 1 PM to avoid timezone issues
      query.date = { $gte: startDate, $lt: endDate };
    }
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'name group')
      .populate('clinic', 'name')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get attendance for a specific student in a month
router.get('/student/:studentId/month/:month/:year', async (req, res) => {
  try {
    const { studentId, month, year } = req.params;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = await Attendance.find({
      student: studentId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create/update attendance record
router.post('/', [
  body('student').notEmpty().withMessage('Student is required'),
  body('clinic').notEmpty().withMessage('Clinic is required'),
  body('date').notEmpty().withMessage('Date is required'),
  body('attended').isBoolean().withMessage('Attended must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { student, clinic, date, attended } = req.body;

    // Fix timezone issue by creating date at noon in local timezone
    const attendanceDate = new Date(date);
    attendanceDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

    // Check if attendance record already exists
    const existingAttendance = await Attendance.findOne({ student, date: attendanceDate });
    
    if (existingAttendance) {
      // Update existing record
      existingAttendance.attended = attended;
      await existingAttendance.save();
      
      // Update student attendance percentage
      await updateStudentAttendancePercentage(student, clinic);
      
      const populatedAttendance = await Attendance.findById(existingAttendance._id)
        .populate('student', 'name group')
        .populate('clinic', 'name');
      
      return res.json(populatedAttendance);
    } else {
      // Create new record
      const attendance = new Attendance({ student, clinic, date: attendanceDate, attended });
      await attendance.save();

      // Update student attendance percentage
      await updateStudentAttendancePercentage(student, clinic);

      const populatedAttendance = await Attendance.findById(attendance._id)
        .populate('student', 'name group')
        .populate('clinic', 'name');

      res.status(201).json(populatedAttendance);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Bulk create attendance records for a date
router.post('/bulk', async (req, res) => {
  try {
    const { clinicId, date, attendanceRecords } = req.body;

    // Fix timezone issue by creating date at noon in local timezone
    const attendanceDate = new Date(date);
    attendanceDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

    const results = [];
    
    for (const record of attendanceRecords) {
      const { studentId, attended } = record;
      
      const existingAttendance = await Attendance.findOne({ 
        student: studentId, 
        date: attendanceDate
      });
      
      if (existingAttendance) {
        existingAttendance.attended = attended;
        await existingAttendance.save();
        results.push(existingAttendance);
      } else {
        const attendance = new Attendance({
          student: studentId,
          clinic: clinicId,
          date: attendanceDate,
          attended
        });
        await attendance.save();
        results.push(attendance);
      }
    }

    // Update student attendance percentages
    for (const record of attendanceRecords) {
      await updateStudentAttendancePercentage(record.studentId, clinicId);
    }

    const populatedResults = await Attendance.find({
      _id: { $in: results.map(r => r._id) }
    }).populate('student', 'name group')
      .populate('clinic', 'name');

    res.json(populatedResults);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to update student attendance percentage
async function updateStudentAttendancePercentage(studentId, clinicId) {
  try {
    // Count attended sessions for this specific clinic only
    const attendedSessions = await Attendance.countDocuments({ 
      student: studentId, 
      clinic: clinicId,
      attended: true 
    });
    
    // Get clinic's evaluation criteria for attendance days
    const criteria = await EvaluationCriteria.findOne({ clinic: clinicId });
    const totalGroupDays = criteria ? criteria.attendanceDaysMax : 25; // Default to 25 if no criteria found
    
    const attendancePercentage = Math.round((attendedSessions / totalGroupDays) * 100);
    
    console.log(`Updating attendance for student ${studentId} in clinic ${clinicId}: ${attendedSessions}/${totalGroupDays} = ${attendancePercentage}%`);
    
    await Student.findByIdAndUpdate(studentId, { 
      attendancePercentage,
      attendanceDays: attendedSessions,
      totalGroupDays: totalGroupDays
    });
  } catch (error) {
    console.error('Error updating student attendance percentage:', error);
  }
}

module.exports = router;
