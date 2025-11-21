const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Favorite = require("../models/Favorite");
const { verifyFirebaseToken } = require("../middleware/firebaseAuth");

router.get("/", async (req, res) => {
    const { email: emailQuery, idsOnly, mode } = req.query;
    try {
        const headerEmail = (req.userEmail || '').toLowerCase();
        const queryEmail = (emailQuery || '').toLowerCase().trim();
        const effectiveEmail = queryEmail || headerEmail;
        console.log('[favorites] GET /api/favorites', { headerEmail, queryEmail, effectiveEmail, idsOnly, mode });
        if (!effectiveEmail) return res.status(401).json({ message: 'Unauthorized' });
        if (headerEmail && queryEmail && headerEmail !== queryEmail) {
            return res.status(403).json({ message: 'Forbidden: email mismatch' });
        }

        const modeStr = String(mode || '').toLowerCase();
        const wantIds = String(idsOnly || '').toLowerCase() === 'true' || modeStr === 'ids';
        const wantReviews = modeStr === 'reviews';

        const favorites = await Favorite.find({ userEmail: effectiveEmail })
            .populate({ path: 'review', select: wantIds ? '_id' : undefined })
            .sort({ createdAt: -1 })
            .lean();

        const valid = favorites.filter(f => f.review !== null);
        console.log('[favorites] GET /api/favorites results', { total: favorites.length, valid: valid.length, wantIds, wantReviews });
        if (wantIds) {
            return res.json(valid.map(f => String(f.review._id)));
        }
        if (wantReviews) {
            return res.json(valid.map(f => f.review));
        }
        return res.json(valid);
    } catch (err) {
        console.error('[favorites] GET /api/favorites error', err);
        return res.status(500).json({ message: err.message || 'Server error' });
    }
});

router.get("/reviews", async (req, res) => {
    const { email: emailQuery } = req.query;
    try {
        const headerEmail = (req.userEmail || '').toLowerCase();
        const queryEmail = (emailQuery || '').toLowerCase().trim();
        const effectiveEmail = queryEmail || headerEmail;
        console.log('[favorites] GET /api/favorites/reviews', { headerEmail, queryEmail, effectiveEmail });
        if (!effectiveEmail) return res.status(401).json({ message: 'Unauthorized' });
        if (headerEmail && queryEmail && headerEmail !== queryEmail) {
            return res.status(403).json({ message: 'Forbidden: email mismatch' });
        }

        const favorites = await Favorite.find({ userEmail: effectiveEmail })
            .populate('review')
            .sort({ createdAt: -1 })
            .lean();

        console.log('[favorites] GET /api/favorites/reviews results', { favCount: favorites.length });
        return res.json(favorites);
    } catch (err) {
        console.error('[favorites] GET /api/favorites/reviews error', err);
        return res.status(500).json({ message: err.message || 'Server error' });
    }
});

router.post("/", verifyFirebaseToken, async (req, res) => {
    const { userEmail, review, reviewId: bodyReviewId } = req.body;

    const reviewId = bodyReviewId || (typeof review === 'object' && review !== null ? (review._id || review.id) : review);
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        return res.status(400).json({ message: "Invalid review ID" });
    }

    try {
        const tokenEmail = String(req.userEmail || '').toLowerCase();
        const bodyEmail = userEmail ? String(userEmail || '').toLowerCase().trim() : '';
        const allowBody = (process.env.ALLOW_DEV_EMAIL_BODY || 'false').toLowerCase() === 'true';
        const effectiveEmail = tokenEmail || (allowBody ? bodyEmail : '');
        console.log('[favorites] POST /api/favorites', { tokenEmail, bodyEmail, effectiveEmail, reviewId });
        if (!effectiveEmail) return res.status(401).json({ message: 'Unauthorized' });
        if (tokenEmail && bodyEmail && tokenEmail !== bodyEmail) return res.status(403).json({ message: "Forbidden: email mismatch" });
        const reviewObjId = new mongoose.Types.ObjectId(reviewId);

        const exists = await Favorite.findOne({
            userEmail: effectiveEmail,
            review: reviewObjId,
        });

        if (exists) {
            await exists.populate("review");
            console.log('[favorites] POST existed -> returning 200');
            return res.status(200).json(exists);
        }

        const favorite = new Favorite({
            userEmail: effectiveEmail,
            review: reviewObjId,
        });

        await favorite.save();
        await favorite.populate("review");
        console.log('[favorites] POST created favorite');
        res.status(201).json(favorite);
    } catch (err) {
        console.error('[favorites] POST /api/favorites error', err);
        res.status(500).json({ message: "Server error" });
    }
});

router.delete("/", verifyFirebaseToken, async (req, res) => {
    const { userEmail, review } = req.body;

    const reviewId = typeof review === 'object' && review !== null ? (review._id || review.id) : review;
    if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
        return res.status(400).json({ message: "Invalid data" });
    }

    try {
        const tokenEmail = String(req.userEmail || '').toLowerCase();
        const bodyEmail = userEmail ? String(userEmail || '').toLowerCase().trim() : '';
        const allowBody = (process.env.ALLOW_DEV_EMAIL_BODY || 'false').toLowerCase() === 'true';
        const effectiveEmail = tokenEmail || (allowBody ? bodyEmail : '');
        console.log('[favorites] DELETE /api/favorites (body)', { tokenEmail, bodyEmail, effectiveEmail, reviewId });
        if (!effectiveEmail) return res.status(401).json({ message: 'Unauthorized' });
        if (tokenEmail && bodyEmail && tokenEmail !== bodyEmail) return res.status(403).json({ message: "Forbidden: email mismatch" });
        const deleted = await Favorite.findOneAndDelete({
            userEmail: effectiveEmail,
            review: new mongoose.Types.ObjectId(reviewId),
        });

        if (!deleted) return res.status(404).json({ message: "Not found" });
        console.log('[favorites] DELETE (body) removed');
        res.json({ message: "Removed from favorites" });
    } catch (err) {
        console.error('[favorites] DELETE /api/favorites error', err);
        res.status(500).json({ message: "Server error" });
    }
});

router.delete("/:id", verifyFirebaseToken, async (req, res) => {
    const tokenEmail = String(req.userEmail || '').toLowerCase();
    const allowBody = (process.env.ALLOW_DEV_EMAIL_BODY || 'false').toLowerCase() === 'true';
    const queryEmail = req.query && req.query.email ? String(req.query.email).toLowerCase().trim() : '';
    const effectiveEmail = tokenEmail || (allowBody ? queryEmail : '');
    if (!effectiveEmail) return res.status(401).json({ message: 'Unauthorized' });
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    try {
        console.log('[favorites] DELETE /api/favorites/:id', { effectiveEmail, id });
        let deleted = await Favorite.findOneAndDelete({ _id: id, userEmail: effectiveEmail });
        if (!deleted) {
            deleted = await Favorite.findOneAndDelete({ review: new mongoose.Types.ObjectId(id), userEmail: effectiveEmail });
        }
        if (!deleted) return res.status(404).json({ message: 'Not found' });
        console.log('[favorites] DELETE /:id removed');
        return res.json({ message: 'Removed from favorites' });
    } catch (err) {
        console.error('[favorites] DELETE /api/favorites/:id error', err);
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;