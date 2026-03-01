// Find where review is saved and add rating update

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { updateMenuItemRating } = require('../utils/ratingService');
const Review = require('../models/Review'); // your existing Review model
const Order = require('../models/Order');

// ── POST /api/reviews - Submit a review ───────────────────────────────────────
// Find your existing POST route and ADD the rating update call:

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { menuItemId, orderId, rating, comment } = req.body;

    // ── Your existing review creation logic ───────────────────────────────
    const review = new Review({
      user: req.user._id,
      menuItem: menuItemId,
      order: orderId,
      rating,
      comment,
    });
    await review.save();

    // ── ADD THIS: Update Bayesian rating ──────────────────────────────────
    await updateMenuItemRating(menuItemId, rating);
    // This automatically:
    // 1. Updates MenuItem.rating.average
    // 2. Updates MenuItem.rating.bayesianScore
    // 3. Updates Chef's rating (Bayesian weighted)

    res.status(201).json({ success: true, message: 'Review submitted!', data: review });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
});

module.exports = router; 