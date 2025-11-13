const Review = require('../models/Review');


const getAllReviews = async (req, res) => {
    try {
       
        const limit = parseInt(req.query.limit) || 0;
        const sortOrder = req.query.sort === 'rating_desc' ? -1 : 1;descending

        
        const reviews = await Review.find()
            .sort({ rating: sortOrder })
            .limit(limit);

        res.json(reviews);
    } catch (error) {
        console.error(' Error fetching reviews:', error);
        res.status(500).json({ message: 'Failed to fetch reviews' });
    }
};


const addReview = async (req, res) => {
    try {
        const newReview = new Review(req.body);
        const savedReview = await newReview.save();
        res.status(201).json(savedReview);
    } catch (error) {
        console.error(' Error adding review:', error);
        res.status(500).json({ message: 'Failed to add review' });
    }
};


const deleteReview = async (req, res) => {
    try {
        const deleted = await Review.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json({ message: 'Review deleted successfully', deleted });
    } catch (error) {
        console.error(' Error deleting review:', error);
        res.status(500).json({ message: 'Failed to delete review' });
    }
};


const updateReview = async (req, res) => {
    try {
        const updated = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json({ message: 'Review updated successfully', updated });
    } catch (error) {
        console.error(' Error updating review:', error);
        res.status(500).json({ message: 'Failed to update review' });
    }
};

module.exports = {
    getAllReviews,
    addReview,
    deleteReview,
    updateReview,
};
