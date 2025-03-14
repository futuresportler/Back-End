const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  reviewer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  entity_type: { type: String, enum: ["Coach", "Academy", "Turf"], required: true },
  entity_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  created_at: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model("Review", reviewSchema);
