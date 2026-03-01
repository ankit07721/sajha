// backend/models/Subscription.js
const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TiffinPlan",
      required: true,
    },
    // Snapshot of plan name at time of subscription
    planName: { type: String, required: true },
    planSlug: { type: String, required: true },

    // Preferences collected during subscribe flow
    preferences: {
      mealType: {
        type: String,
        enum: ["veg", "non-veg", "both"],
        default: "both",
      },
      mealTime: {
        type: String,
        enum: ["lunch", "dinner", "both"],
        default: "both",
      },
      spiceLevel: {
        type: String,
        enum: ["mild", "medium", "hot"],
        default: "medium",
      },
      specialRequests: { type: String, maxlength: 300 },
    },

    // Delivery info
    deliveryAddress: {
      street: String,
      city: String,
      landmark: String,
      phone: String,
    },

    // Dates
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    // Status
    status: {
      type: String,
      enum: ["active", "paused", "cancelled", "expired"],
      default: "active",
    },

    // Pricing
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["khalti", "esewa", "cod"],
      default: "cod",
    },

    assignedChef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedChefName: { type: String, default: null },

    pausedAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
  },
  { timestamps: true }
);

// Auto-expire subscriptions past end date
subscriptionSchema.methods.checkExpiry = function () {
  if (this.status === "active" && new Date() > this.endDate) {
    this.status = "expired";
    return this.save();
  }
};

subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });

module.exports = mongoose.model("Subscription", subscriptionSchema);