const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', required: true },
    date: { type: Date, default: Date.now }
}, { collection: 'Favorites' });

module.exports = mongoose.model('Favorite', favoriteSchema);
