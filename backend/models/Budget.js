const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    monthlyLimit: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      // format: "2026-07"
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// One budget per category per month per user
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);
