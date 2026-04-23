const express = require('express');
const Student = require('../models/Student');
const Clinic = require('../models/Clinic');
const Attendance = require('../models/Attendance');
const Evaluation = require('../models/Evaluation');

const router = express.Router();

// Get general summary for all clinics
router.get('/general-summary', async (req, res) => {
  try {
    const clinics = await Clinic.find();
    const students = await Student.find().populate('clinic', 'name');
    
    const summary = {
      totalClinics: clinics.length,
      totalStudents: students.length,
      clinics: []
    };

    for (const clinic of clinics) {
      const clinicStudents = students.filter(s => s.clinic._id.toString() === clinic._id.toString());
      
      const avgAttendance = clinicStudents.length > 0 
        ? Math.round(clinicStudents.reduce((sum, s) => sum + s.attendancePercentage, 0) / clinicStudents.length)
        : 0;
      
      const avgPerformance = clinicStudents.length > 0
        ? Math.round(clinicStudents.reduce((sum, s) => sum + s.performance, 0) / clinicStudents.length)
        : 0;

      summary.clinics.push({
        id: clinic._id,
        name: clinic.name,
        address: clinic.address,
        totalStudents: clinicStudents.length,
        avgAttendance,
        avgPerformance,
        groups: clinic.groups
      });
    }

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get detailed report for a specific clinic
router.get('/clinic/:clinicId', async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.clinicId);
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    const students = await Student.find({ clinic: req.params.clinicId });
    
    const report = {
      clinic: {
        id: clinic._id,
        name: clinic.name,
        address: clinic.address,
        groups: clinic.groups
      },
      totalStudents: students.length,
      students: students.map(student => ({
        id: student._id,
        name: student.name,
        group: student.group,
        startDate: student.startDate,
        attendancePercentage: student.attendancePercentage,
        performance: student.performance,
        presentation: student.presentation,
        workbookProgress: student.workbookProgress,
        trainingHours: student.trainingHours
      }))
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student progress report
router.get('/student/:studentId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId).populate('clinic');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get attendance history
    const attendance = await Attendance.find({ student: req.params.studentId })
      .sort({ date: -1 });

    // Get evaluation history
    const evaluations = await Evaluation.find({ student: req.params.studentId })
      .sort({ date: -1 });

    // Calculate attendance statistics
    const totalSessions = attendance.length;
    const attendedSessions = attendance.filter(a => a.attended).length;
    const attendanceRate = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;

    // Get group information
    const groupInfo = student.clinic.groups.find(g => g.name === student.group);

    const report = {
      student: {
        id: student._id,
        name: student.name,
        group: student.group,
        startDate: student.startDate,
        clinic: student.clinic.name
      },
      groupInfo: groupInfo || null,
      progress: {
        attendance: {
          percentage: student.attendancePercentage,
          totalSessions,
          attendedSessions
        },
        performance: student.performance,
        presentation: student.presentation,
        workbookProgress: student.workbookProgress,
        trainingHours: student.trainingHours
      },
      attendanceHistory: attendance,
      evaluationHistory: evaluations
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get monthly attendance report for a clinic
router.get('/clinic/:clinicId/attendance/:month/:year', async (req, res) => {
  try {
    const { clinicId, month, year } = req.params;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const students = await Student.find({ clinic: clinicId });
    const attendance = await Attendance.find({
      clinic: clinicId,
      date: { $gte: startDate, $lte: endDate }
    }).populate('student', 'name group');

    const report = {
      clinic: clinicId,
      month,
      year,
      students: students.map(student => {
        const studentAttendance = attendance.filter(a => a.student._id.toString() === student._id.toString());
        const attended = studentAttendance.filter(a => a.attended).length;
        const total = studentAttendance.length;
        
        return {
          id: student._id,
          name: student.name,
          group: student.group,
          attended,
          total,
          percentage: total > 0 ? Math.round((attended / total) * 100) : 0
        };
      })
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
