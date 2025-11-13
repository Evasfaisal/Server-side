const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        photo: {
            type: String,
            required: [true, 'Photo URL is required'],
        },
        foodName: {
            type: String,
            required: [true, 'Food name is required'],
            trim: true,
        },
        restaurantName: {
            type: String,
            required: [true, 'Restaurant name is required'],
            trim: true,
        },
        restaurantLocation: {
            type: String,
            required: [true, 'Restaurant location is required'],
            trim: true,
        },
        reviewerName: {
            type: String,
            required: [true, 'Reviewer name is required'],
            trim: true,
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: 0,
            max: 5,
        },
        userEmail: {
            type: String,
            trim: true,
            lowercase: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        collection: 'Food', 
    }
);

module.exports = mongoose.model('Review', reviewSchema);
