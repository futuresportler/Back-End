const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  service_type: { type: String, enum: ["Coach", "Academy", "Turf"], required: true },
  service_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
  payment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", bookingSchema);
