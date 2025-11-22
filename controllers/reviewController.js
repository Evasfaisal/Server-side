const { ObjectId } = require('mongodb');
const Review = require('../models/Review');
const Favorite = require('../models/Favorite');

function t(v) { return typeof v === 'string' ? v.trim() : v; }
function isValidUrl(u) { try { const x = new URL(u); return x.protocol === 'http:' || x.protocol === 'https:'; } catch { return false; } }
function normalize(body = {}) {
  const ratingNum = Number(body.rating);
  const posted = body.postedDate || body.date || new Date();
  return {
    foodName: t(body.foodName),
    restaurantName: t(body.restaurantName),
    location: t(body.location || body.restaurantLocation),
    restaurantLocation: t(body.restaurantLocation || body.location),
    rating: isNaN(ratingNum) ? undefined : ratingNum,
    reviewText: t(body.reviewText || body.review),
    review: t(body.review),
    foodImage: t(body.foodImage || body.photo || body.image),
    photo: t(body.photo || body.foodImage),
    userName: t(body.userName || body.reviewerName),
    userPhoto: t(body.userPhoto),
    postedDate: posted,
    date: posted,
  };
}
function validateCreate(n) {
  if (!n.foodName || n.foodName.length < 2 || n.foodName.length > 100) return 'Invalid foodName';
  if (!n.restaurantName || n.restaurantName.length < 2 || n.restaurantName.length > 120) return 'Invalid restaurantName';
  if (!n.location || n.location.length < 2 || n.location.length > 140) return 'Invalid location';
  if (!n.foodImage || !isValidUrl(n.foodImage)) return 'Invalid foodImage URL';
  if (!n.reviewText || n.reviewText.length < 3 || n.reviewText.length > 5000) return 'Invalid reviewText';
  if (typeof n.rating !== 'number' || n.rating < 1 || n.rating > 5) return 'Rating must be between 1 and 5';
  return null;
}
function validateUpdate(n) {
  if (n.foodName !== undefined && (n.foodName.length < 2 || n.foodName.length > 100)) return 'Invalid foodName';
  if (n.restaurantName !== undefined && (n.restaurantName.length < 2 || n.restaurantName.length > 120)) return 'Invalid restaurantName';
  if (n.location !== undefined && (n.location.length < 2 || n.location.length > 140)) return 'Invalid location';
  if (n.foodImage !== undefined && !isValidUrl(n.foodImage)) return 'Invalid foodImage URL';
  if (n.reviewText !== undefined && (n.reviewText.length < 3 || n.reviewText.length > 5000)) return 'Invalid reviewText';
  if (n.rating !== undefined && (typeof n.rating !== 'number' || n.rating < 1 || n.rating > 5)) return 'Rating must be between 1 and 5';
  return null;
}

async function createReview(req, res) {
  try {
    const db = req.app.locals.db;
    const tokenEmail = (req.userEmail || '').toLowerCase();
    const bodyEmail = (req.body.userEmail || req.body.email || '').toLowerCase();
    if (!tokenEmail) return res.status(401).json({ message: 'Unauthorized' });
    if (bodyEmail && bodyEmail !== tokenEmail) return res.status(403).json({ message: 'Forbidden: email mismatch' });

    const n = normalize(req.body);
    const errMsg = validateCreate(n);
    if (errMsg) return res.status(400).json({ message: errMsg });
    const saved = await Review.createReview(db, { ...n, userEmail: tokenEmail });
    return res.status(201).json(saved);
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Failed to add review' });
  }
}

async function updateReview(req, res) {
  try {
    const db = req.app.locals.db;
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid review ID' });
    const existing = await Review.getReviewById(db, req.params.id);
    if (!existing) return res.status(404).json({ message: 'Review not found' });

    const tokenEmail = (req.userEmail || '').toLowerCase();
    if (!tokenEmail || existing.userEmail.toLowerCase() !== tokenEmail) return res.status(403).json({ message: 'Forbidden: not the owner' });

    const n = normalize(req.body);
    const errMsg = validateUpdate(n);
    if (errMsg) return res.status(400).json({ message: errMsg });
    const { userEmail, email, ...rest } = n;
    const updated = await Review.updateReview(db, req.params.id, rest);
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Failed to update review' });
  }
}

async function deleteReview(req, res) {
  try {
    const db = req.app.locals.db;
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid review ID' });
    const existing = await Review.getReviewById(db, req.params.id);
    if (!existing) return res.status(404).json({ message: 'Review not found' });
    const tokenEmail = (req.userEmail || '').toLowerCase();
    if (!tokenEmail || existing.userEmail.toLowerCase() !== tokenEmail) return res.status(403).json({ message: 'Forbidden: not the owner' });
    await Review.deleteReview(db, req.params.id);
    try { await Favorite.deleteFavorite(db, { review: req.params.id }); } catch { }
    return res.json({ message: 'Deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to delete review' });
  }
}

module.exports = { createReview, updateReview, deleteReview };
