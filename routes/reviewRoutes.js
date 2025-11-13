const express = require('express');
const router = express.Router();
const { getAllReviews, addReview, deleteReview, updateReview } = require('../controllers/reviewController');

router.get('/', getAllReviews);
router.post('/', addReview);
router.delete('/:id', deleteReview);
router.put('/:id', updateReview);

module.exports = router;
