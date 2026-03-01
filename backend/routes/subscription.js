// backend/routes/subscription.js
const express = require("express");
const router = express.Router();
const Subscription = require("../models/Subscription");
const TiffinPlan = require("../models/TiffinPlan");
// ✅ YOUR auth middleware names
const { authenticateToken, authorizeRole } = require("../middleware/auth");

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: GET all active tiffin plans
// GET /api/subscriptions/plans
// ─────────────────────────────────────────────────────────────────────────────
router.get("/plans", async (req, res) => {
  try {
    const plans = await TiffinPlan.find({ isActive: true }).sort({ pricePerWeek: 1 });
    res.json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH: GET my active subscription
// GET /api/subscriptions/my
// ─────────────────────────────────────────────────────────────────────────────
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const sub = await Subscription.findOne({
      user: req.user._id,
      status: { $in: ["active", "paused"] },
    }).populate("plan");

    // Auto-check expiry
    if (sub) await sub.checkExpiry();

    res.json({ success: true, data: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH: GET my subscription history
// GET /api/subscriptions/history
// ─────────────────────────────────────────────────────────────────────────────
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const subs = await Subscription.find({ user: req.user._id })
      .populate("plan")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: subs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH: CREATE new subscription (Subscribe Now)
// POST /api/subscriptions
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { planId, preferences, deliveryAddress } = req.body;

    // Check if user already has active subscription
    const existing = await Subscription.findOne({
      user: req.user._id,
      status: { $in: ["active", "paused"] },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already have an active subscription. Cancel it first.",
      });
    }

    // Get plan
    const plan = await TiffinPlan.findById(planId);
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    // Calculate total
    const weeks = plan.durationDays / 7;
    const total = plan.pricePerWeek * weeks * (1 - plan.discountPercent / 100);

    const sub = await Subscription.create({
      user: req.user._id,
      plan: plan._id,
      planName: plan.name,
      planSlug: plan.slug,
      preferences: preferences || {},
      deliveryAddress: deliveryAddress || {},
      startDate,
      endDate,
      totalAmount: Math.round(total),
      paymentStatus: "pending",
      paymentMethod: req.body.paymentMethod || "cod",
    });

    const populated = await sub.populate("plan");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH: PAUSE subscription
// PUT /api/subscriptions/:id/pause
// ─────────────────────────────────────────────────────────────────────────────
router.put("/:id/pause", authenticateToken, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, user: req.user._id });
    if (!sub) return res.status(404).json({ success: false, message: "Subscription not found" });
    if (sub.status !== "active") return res.status(400).json({ success: false, message: "Only active subscriptions can be paused" });

    sub.status = "paused";
    sub.pausedAt = new Date();
    await sub.save();
    res.json({ success: true, data: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH: RESUME subscription
// PUT /api/subscriptions/:id/resume
// ─────────────────────────────────────────────────────────────────────────────
router.put("/:id/resume", authenticateToken, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, user: req.user._id });
    if (!sub) return res.status(404).json({ success: false, message: "Subscription not found" });
    if (sub.status !== "paused") return res.status(400).json({ success: false, message: "Subscription is not paused" });

    sub.status = "active";
    sub.pausedAt = undefined;
    await sub.save();
    res.json({ success: true, data: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH: CANCEL subscription
// PUT /api/subscriptions/:id/cancel
// ─────────────────────────────────────────────────────────────────────────────
router.put("/:id/cancel", authenticateToken, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, user: req.user._id });
    if (!sub) return res.status(404).json({ success: false, message: "Subscription not found" });
    if (sub.status === "cancelled") return res.status(400).json({ success: false, message: "Already cancelled" });

    sub.status = "cancelled";
    sub.cancelledAt = new Date();
    sub.cancelReason = req.body.reason || "User cancelled";
    await sub.save();
    res.json({ success: true, data: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: GET all subscriptions
// GET /api/subscriptions/admin/all
// ─────────────────────────────────────────────────────────────────────────────
router.get("/admin/all", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};

    const subs = await Subscription.find(filter)
      .populate("user", "firstName lastName email phone")
      .populate("plan")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Subscription.countDocuments(filter);
    res.json({ success: true, data: subs, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: SEED default tiffin plans (run once)
// POST /api/subscriptions/admin/seed-plans
// ─────────────────────────────────────────────────────────────────────────────
router.post("/admin/seed-plans", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    await TiffinPlan.deleteMany({});
    const plans = await TiffinPlan.insertMany([
      {
        name: "Weekly Meal Plan",
        slug: "weekly",
        badge: "Popular",
        description: "Get 7 days of curated home-cooked meals. Perfect for busy professionals.",
        pricePerWeek: 1500,
        durationDays: 7,
        mealsPerDay: 1,
        features: ["7 lunches or dinners", "Chef selection", "Dietary customization", "Free delivery"],
        discountPercent: 0,
      },
      {
        name: "Monthly Subscription",
        slug: "monthly",
        badge: "Best Value",
        description: "Best value! Enjoy 30 days of fresh home-cooked meals with extra savings.",
        pricePerWeek: 5000,
        durationDays: 30,
        mealsPerDay: 1,
        features: ["30 days of meals", "Priority chef access", "Full dietary customization", "Free delivery", "10% savings"],
        discountPercent: 10,
      },
      {
        name: "Special Diet Plan",
        slug: "special-diet",
        badge: "Health",
        description: "Health-focused meal plans for diabetic patients, elderly, and health-conscious eaters.",
        pricePerWeek: 2000,
        durationDays: 7,
        mealsPerDay: 1,
        features: ["Nutritionist-guided menus", "Diabetic-friendly options", "Soft food options", "Low oil & low sugar"],
        discountPercent: 0,
      },
    ]);
    res.json({ success: true, message: "Plans seeded!", data: plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router; 