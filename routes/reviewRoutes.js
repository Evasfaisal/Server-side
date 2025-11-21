const express = require('express');
const { ObjectId } = require('mongodb');
const { getReviewsCollection } = require('../models/Review');
let requireAuth = (req, res, next) => next();
try {
    ({ requireAuth } = require('../middleware/auth'));
} catch (e) {
}
const { createReview, updateReview, deleteReview } = require('../controllers/reviewController');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { email, sort, search, limit } = req.query;
        const query = {};
        if (email) query.userEmail = email;
        if (search) query.foodName = { $regex: search, $options: 'i' };
        const reviewsCol = getReviewsCollection(req.app);
        let cursor = reviewsCol.find(query);
        if (sort === 'date_desc') cursor = cursor.sort({ postedDate: -1 });
        else if (sort === 'date_asc') cursor = cursor.sort({ postedDate: 1 });
        else if (sort === 'rating_desc') cursor = cursor.sort({ rating: -1 });
        if (limit) cursor = cursor.limit(parseInt(limit, 10));
        const result = await cursor.toArray();
        res.json(result);
    } catch (err) {
        console.error('GET /api/reviews error:', err);
        res.status(500).json({ message: err.message || 'Server error while fetching reviews' });
    }
});

router.get('/top', async (req, res) => {
    try {
        const reviewsCol = getReviewsCollection(req.app);
        const reviews = await reviewsCol.find().sort({ rating: -1 }).limit(6).toArray();
        res.json(reviews);
    } catch (err) {
        console.error('GET /api/reviews/top error:', err);
        res.status(500).json({ message: err.message || 'Server error while fetching top reviews' });
    }
});

router.get('/recent', async (req, res) => {
    try {
        const reviewsCol = getReviewsCollection(req.app);
        const reviews = await reviewsCol.find().sort({ postedDate: -1 }).limit(6).toArray();
        res.json(reviews);
    } catch (err) {
        console.error('GET /api/reviews/recent error:', err);
        res.status(500).json({ message: err.message || 'Server error while fetching recent reviews' });
    }
});

router.get('/mine', requireAuth, async (req, res) => {
    try {
        const email = (req.userEmail || '').toLowerCase();
        if (!email) return res.status(401).json({ message: 'Unauthorized' });
        const { sort, search } = req.query;
        const query = { userEmail: email };
        if (search) query.foodName = { $regex: search, $options: 'i' };
        const reviewsCol = getReviewsCollection(req.app);
        let cursor = reviewsCol.find(query);
        if (sort === 'date_desc') cursor = cursor.sort({ postedDate: -1 });
        else if (sort === 'date_asc') cursor = cursor.sort({ postedDate: 1 });
        else if (sort === 'rating_desc') cursor = cursor.sort({ rating: -1 });
        const result = await cursor.toArray();
        res.json(result);
    } catch (err) {
        console.error('GET /api/reviews/mine error:', err);
        res.status(500).json({ message: err.message || 'Server error while fetching your reviews' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid review ID' });
        }
        const reviewsCol = getReviewsCollection(req.app);
        const review = await reviewsCol.findOne({ _id: new ObjectId(id) });
        if (!review) return res.status(404).json({ message: 'Review not found' });
        res.json(review);
    } catch (err) {
        console.error('GET /api/reviews/:id error:', err);
        res.status(500).json({ message: err.message || `Server error while fetching review ${req.params.id}` });
    }
});

router.post('/', requireAuth, createReview);

router.put('/:id', requireAuth, updateReview);

router.delete('/:id', requireAuth, deleteReview);

module.exports = router;