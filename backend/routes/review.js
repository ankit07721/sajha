const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.js');
const Review = require('../models/Review.js');
const Order = require('../models/Order.js');

const router = express.Router();

// Create a new review for an item in an order
router.post('/', [authenticateToken, [
    body('orderId', 'Order ID is required').isMongoId(),
    body('menuItemId', 'Menu Item ID is required').isMongoId(),
    body('rating', 'Rating must be a number between 1 and 5').isInt({ min: 1, max: 5 }),
    body('comment', 'Comment cannot exceed 500 characters').optional().isLength({ max: 500 }),
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { orderId, menuItemId, rating, comment } = req.body;

    try {
        // 1. Verify the user actually ordered this item
        const order = await Order.findOne({
            _id: orderId,
            customer: req.user.id,
            'items.menuItem': menuItemId
        });

        if (!order) {
            return res.status(403).json({ success: false, message: 'You can only review items you have purchased.' });
        }

        // 2. Check if a review already exists for this item in this order
        const existingReview = await Review.findOne({ user: req.user.id, order: orderId, menuItem: menuItemId });
        if (existingReview) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this item for this order.' });
        }

        // 3. Create and save the new review
        const newReview = new Review({
            user: req.user.id,
            order: orderId,
            menuItem: menuItemId,
            rating,
            comment,
        });

        const review = await newReview.save();
        res.status(201).json({ success: true, data: review });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// Get all reviews for a specific menu item
router.get('/:menuItemId', async (req, res) => {
    try {
        const reviews = await Review.find({ menuItem: req.params.menuItemId })
            .populate('user', 'firstName lastName') 
            .sort({ createdAt: -1 });

        res.json({ success: true, data: reviews });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
