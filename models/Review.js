
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({

    foodName: {
        type: String,
        required: [true, 'Food name is required'],
        trim: true,
    },


    foodImage: {
        type: String,
        required: [true, 'Food image is required'],
        trim: true,
    },
    photo: {
        type: String,
        trim: true,
    },

    restaurantName: {
        type: String,
        required: [true, 'Restaurant name is required'],
        trim: true,
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
    },
    restaurantLocation: {
        type: String,
        trim: true,
    },


    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
    },


    reviewText: {
        type: String,
        required: [true, 'Review text is required'],
        trim: true,
    },


    userEmail: {
        type: String,
        required: [true, 'User email is required'],
        trim: true,
        lowercase: true,
    },
    userName: {
        type: String,
        trim: true,
    },
    reviewerName: {
        type: String,
        trim: true,
    },
    userPhoto: {
        type: String,
        trim: true,
    },


    postedDate: {
        type: Date,
        required: [true, 'Posted date is required'],
        default: Date.now,
    },
    date: {
        type: Date,
    },
});


reviewSchema.virtual('imageUrl').get(function () {
    return this.foodImage || this.photo || 'https://i.ibb.co/0j3PQZb/banner1.jpg';
});


reviewSchema.virtual('displayLocation').get(function () {
    return this.location || this.restaurantLocation || 'Unknown Location';
});

reviewSchema.virtual('displayName').get(function () {
    return this.userName || this.reviewerName || 'Anonymous';
});


reviewSchema.virtual('formattedRating').get(function () {
    return Number(this.rating).toFixed(1);
});

reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Review', reviewSchema);