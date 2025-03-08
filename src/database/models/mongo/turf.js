const mongoose = require("mongoose");

const turfSchema = new mongoose.Schema({
  academy_id: { type: mongoose.Schema.Types.ObjectId, ref: "Academy", required: false },
  name: { type: String, required: true },
  location: { type: String, required: true },
  sports_supported: [{ type: String, required: true }],
  hourly_rate: { type: Number, required: true },
  availability: { type: Map, of: Boolean },
  facilities: [{ type: String }],
  images: [{ type: String }]
});

module.exports = mongoose.model("Turf", turfSchema);
