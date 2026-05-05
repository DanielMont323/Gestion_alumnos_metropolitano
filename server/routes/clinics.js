const express = require('express');
const Clinic = require('../models/Clinic');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get all clinics
router.get('/', async (req, res) => {
  try {
    const clinics = await Clinic.find().populate('totalStudents');
    res.json(clinics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get clinic by ID
router.get('/:id', async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }
    res.json(clinic);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new clinic
router.post('/', [
  body('name').notEmpty().withMessage('Clinic name is required'),
  body('address').notEmpty().withMessage('Address is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const clinic = new Clinic(req.body);
    await clinic.save();
    res.status(201).json(clinic);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update clinic
router.put('/:id', async (req, res) => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }
    
    res.json(clinic);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add group to clinic
router.post('/:id/groups', [
  body('name').notEmpty().withMessage('Group name is required'),
  body('days').isArray({ min: 1 }).withMessage('At least one day is required'),
  body('duration').notEmpty().withMessage('Duration is required'),
  body('activities').isInt({ min: 1 }).withMessage('Activities must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    clinic.groups.push(req.body);
    await clinic.save();
    
    res.status(201).json(clinic);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update group in clinic
router.put('/:id/groups/:groupId', [
  body('name').optional().notEmpty().withMessage('Group name cannot be empty'),
  body('days').optional().isArray({ min: 1 }).withMessage('At least one day is required'),
  body('duration').optional().notEmpty().withMessage('Duration cannot be empty'),
  body('activities').optional().isInt({ min: 1 }).withMessage('Activities must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    const group = clinic.groups.id(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    Object.assign(group, req.body);
    await clinic.save();
    
    res.json(clinic);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete group from clinic
router.delete('/:id/groups/:groupId', async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    clinic.groups.pull(req.params.groupId);
    await clinic.save();
    
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete clinic
router.delete('/:id', async (req, res) => {
  try {
    const clinic = await Clinic.findByIdAndDelete(req.params.id);
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }
    res.json({ message: 'Clinic deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
