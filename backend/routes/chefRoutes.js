// backend/routes/chef.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: Apply to become a chef
// POST /api/chef/apply
// ─────────────────────────────────────────────────────────────────────────────
router.post('/apply', async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone, password,
      address, bio, specialty, experience,
      kitchenImages, idProofImage,
      location
    } = req.body;

    // Check if email exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const chef = new User({
      firstName, lastName, email, phone, password,
      address,
      role: 'chef',
      chefProfile: {
        bio,
        specialty,
        experience,
        kitchenImages: kitchenImages || [],
        idProofImage: idProofImage || '',
        applicationStatus: 'pending',
      },
      location: location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || address,
      }
    : undefined,
      
    });

    await chef.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted! Admin will review and approve your account.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH (Chef): GET my dashboard data
// GET /api/chef/dashboard
// ─────────────────────────────────────────────────────────────────────────────
router.get('/dashboard', authenticateToken, authorizeRole('chef'), async (req, res) => {
  try {
    const chef = await User.findById(req.user._id).select('-password');

    // Get chef's menu items
    const myItems = await MenuItem.find({ createdBy: req.user._id });

    res.json({
      success: true,
      data: {
        chef,
        totalItems: myItems.length,
        myItems,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH (Chef): GET my profile
// GET /api/chef/profile
// ─────────────────────────────────────────────────────────────────────────────
router.get('/profile', authenticateToken, authorizeRole('chef'), async (req, res) => {
  try {
    const chef = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: chef });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH (Chef): UPDATE my profile
// PUT /api/chef/profile
// ─────────────────────────────────────────────────────────────────────────────
router.put('/profile', authenticateToken, authorizeRole('chef'), async (req, res) => {
  try {
    const { bio, specialty, experience } = req.body;
    const chef = await User.findByIdAndUpdate(
      req.user._id,
      { 'chefProfile.bio': bio, 'chefProfile.specialty': specialty, 'chefProfile.experience': experience },
      { new: true }
    ).select('-password');
    res.json({ success: true, data: chef });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: GET all chef applications
// GET /api/chef/admin/applications
// ─────────────────────────────────────────────────────────────────────────────
router.get('/admin/applications', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const chefs = await User.find({ role: 'chef', 'chefProfile.applicationStatus': status })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: chefs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: APPROVE chef application
// PUT /api/chef/admin/:id/approve
// ─────────────────────────────────────────────────────────────────────────────
router.put('/admin/:id/approve', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const chef = await User.findByIdAndUpdate(
      req.params.id,
      {
        'chefProfile.applicationStatus': 'approved',
        'chefProfile.approvedAt': new Date(),
        isActive: true,
      },
      { new: true }
    ).select('-password');

    if (!chef) return res.status(404).json({ success: false, message: 'Chef not found' });
    res.json({ success: true, message: 'Chef approved!', data: chef });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: REJECT chef application
// PUT /api/chef/admin/:id/reject
// ─────────────────────────────────────────────────────────────────────────────
router.put('/admin/:id/reject', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const chef = await User.findByIdAndUpdate(
      req.params.id,
      {
        'chefProfile.applicationStatus': 'rejected',
        'chefProfile.rejectedAt': new Date(),
        'chefProfile.applicationNote': req.body.reason || 'Application rejected by admin.',
        isActive: false,
      },
      { new: true }
    ).select('-password');

    if (!chef) return res.status(404).json({ success: false, message: 'Chef not found' });
    res.json({ success: true, message: 'Chef rejected.', data: chef });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: GET all approved chefs
// GET /api/chef/admin/all
// ─────────────────────────────────────────────────────────────────────────────
router.get('/admin/all', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const chefs = await User.find({ role: 'chef' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: chefs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
