const express = require('express');
const { ObjectId } = require('mongodb');
const Review = require('../models/Review');
const Favorite = require('../models/Favorite');
let requireAuth = (req, res, next) => next();
try {
    ({ requireAuth } = require('../middleware/auth'));
} catch (e) {
}
const { createReview, updateReview, deleteReview } = require('../controllers/reviewController');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { email, sort, search, limit } = req.query;
        const filter = {};
        if (email) filter.userEmail = email;
        if (search) filter.foodName = { $regex: search, $options: 'i' };
        const options = {};
        if (sort === 'date_desc') options.sort = { postedDate: -1 };
        else if (sort === 'date_asc') options.sort = { postedDate: 1 };
        else if (sort === 'rating_desc') options.sort = { rating: -1 };
        if (limit) options.limit = parseInt(limit, 10);
        const result = await Review.getReviews(db, filter, options);
        res.json(result);
    } catch (err) {
        console.error('GET /api/reviews error:', err);
        res.status(500).json({ message: err.message || 'Server error while fetching reviews' });
    }
});

router.get('/top', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const reviews = await Review.getReviews(db, {}, { sort: { rating: -1 }, limit: 6 });
        res.json(reviews);
    } catch (err) {
        console.error('GET /api/reviews/top error:', err);
        res.status(500).json({ message: err.message || 'Server error while fetching top reviews' });
    }
});

router.get('/recent', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const reviews = await Review.getReviews(db, {}, { sort: { postedDate: -1 }, limit: 6 });
        res.json(reviews);
    } catch (err) {
        console.error('GET /api/reviews/recent error:', err);
        res.status(500).json({ message: err.message || 'Server error while fetching recent reviews' });
    }
});

router.get('/mine', requireAuth, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const email = (req.userEmail || '').toLowerCase();
        if (!email) return res.status(401).json({ message: 'Unauthorized' });
        const { sort, search } = req.query;
        const filter = { userEmail: email };
        if (search) filter.foodName = { $regex: search, $options: 'i' };
        const options = {};
        if (sort === 'date_desc') options.sort = { postedDate: -1 };
        else if (sort === 'date_asc') options.sort = { postedDate: 1 };
        else if (sort === 'rating_desc') options.sort = { rating: -1 };
        const result = await Review.getReviews(db, filter, options);
        res.json(result);
    } catch (err) {
        console.error('GET /api/reviews/mine error:', err);
        res.status(500).json({ message: err.message || 'Server error while fetching your reviews' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const db = req.app.locals.db;
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid review ID' });
        }
        const review = await Review.getReviewById(db, req.params.id);
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