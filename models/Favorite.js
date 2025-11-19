const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, lowercase: true, trim: true },
    review: { type: mongoose.Schema.Types.ObjectId, ref: "Review", required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ userEmail: 1, review: 1 }, { unique: true });

module.exports = mongoose.models.Favorite || mongoose.model("Favorite", favoriteSchema);
