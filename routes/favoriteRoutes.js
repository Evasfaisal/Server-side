const express = require("express");
const router = express.Router();
const { ObjectId } = require('mongodb');
const Favorite = require("../models/Favorite");
let requireAuth = (req, res, next) => next();
let optionalAuth = (req, _res, next) => {
    const header = req.headers['x-user-email'];
    if (typeof header === 'string') req.userEmail = header;
    else if (Array.isArray(header)) req.userEmail = header[0];
    next();
};
try {
    ({ requireAuth, optionalAuth } = require("../middleware/auth"));
} catch (e) {
}

router.get("/", async (req, res) => {
    const { email: emailQuery, idsOnly, mode } = req.query;
    try {
        const db = req.app.locals.db;
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


        const favorites = await Favorite.getFavorites(db, { userEmail: effectiveEmail });

        if (wantIds) {
            return res.json(favorites.map(f => String(f.review)));
        }
        return res.json(favorites);
    } catch (err) {
        console.error('[favorites] GET /api/favorites error', err);
        return res.status(500).json({ message: err.message || 'Server error' });
    }
});

router.get("/reviews", async (req, res) => {
    const { email: emailQuery } = req.query;
    try {
        const db = req.app.locals.db;
        const headerEmail = (req.userEmail || '').toLowerCase();
        const queryEmail = (emailQuery || '').toLowerCase().trim();
        const effectiveEmail = queryEmail || headerEmail;
        console.log('[favorites] GET /api/favorites/reviews', { headerEmail, queryEmail, effectiveEmail });
        if (!effectiveEmail) return res.status(401).json({ message: 'Unauthorized' });
        if (headerEmail && queryEmail && headerEmail !== queryEmail) {
            return res.status(403).json({ message: 'Forbidden: email mismatch' });
        }

        const favorites = await Favorite.getFavorites(db, { userEmail: effectiveEmail });

        console.log('[favorites] GET /api/favorites/reviews results', { favCount: favorites.length });
        return res.json(favorites);
    } catch (err) {
        console.error('[favorites] GET /api/favorites/reviews error', err);
        return res.status(500).json({ message: err.message || 'Server error' });
    }
});

router.post("/", async (req, res) => {
    const { userEmail, review, reviewId: bodyReviewId } = req.body;
    const reviewId = bodyReviewId || (typeof review === 'object' && review !== null ? (review._id || review.id) : review);
    if (!ObjectId.isValid(reviewId)) {
        return res.status(400).json({ message: "Invalid review ID" });
    }
    // userEmail validation
    if (!userEmail || typeof userEmail !== 'string' || !userEmail.includes('@') || userEmail.length < 5) {
        return res.status(400).json({ message: "Invalid or missing userEmail" });
    }
    try {
        const db = req.app.locals.db;
        const tokenEmail = String(req.userEmail || '').toLowerCase();
        const bodyEmail = userEmail ? String(userEmail || '').toLowerCase().trim() : '';
        const allowBody = (process.env.ALLOW_DEV_EMAIL_BODY || 'false').toLowerCase() === 'true';
        const effectiveEmail = tokenEmail || (allowBody ? bodyEmail : '');
        console.log('[favorites] POST /api/favorites', { tokenEmail, bodyEmail, effectiveEmail, reviewId });
        if (!effectiveEmail) return res.status(401).json({ message: 'Unauthorized' });
        if (tokenEmail && bodyEmail && tokenEmail !== bodyEmail) return res.status(403).json({ message: "Forbidden: email mismatch" });

        const existsArr = await Favorite.getFavorites(db, { userEmail: effectiveEmail, review: reviewId });
        if (existsArr.length > 0) {
            console.log('[favorites] POST existed -> returning 200');
            return res.status(200).json(existsArr[0]);
        }

        const favorite = await Favorite.createFavorite(db, {
            userEmail: effectiveEmail,
            review: reviewId,
        });
        console.log('[favorites] POST created favorite');
        res.status(201).json(favorite);
    } catch (err) {
        console.error('[favorites] POST /api/favorites error', err);
        res.status(500).json({ message: "Server error" });
    }
});

router.delete("/", async (req, res) => {
    const { userEmail, review } = req.body;
    const reviewId = typeof review === 'object' && review !== null ? (review._id || review.id) : review;
    if (!reviewId || !ObjectId.isValid(reviewId)) {
        return res.status(400).json({ message: "Invalid data" });
    }
    // userEmail validation
    if (!userEmail || typeof userEmail !== 'string' || !userEmail.includes('@') || userEmail.length < 5) {
        return res.status(400).json({ message: "Invalid or missing userEmail" });
    }
    try {
        const db = req.app.locals.db;
        const tokenEmail = String(req.userEmail || '').toLowerCase();
        const bodyEmail = userEmail ? String(userEmail || '').toLowerCase().trim() : '';
        const allowBody = (process.env.ALLOW_DEV_EMAIL_BODY || 'false').toLowerCase() === 'true';
        const effectiveEmail = tokenEmail || (allowBody ? bodyEmail : '');
        console.log('[favorites] DELETE /api/favorites (body)', { tokenEmail, bodyEmail, effectiveEmail, reviewId });
        if (!effectiveEmail) return res.status(401).json({ message: 'Unauthorized' });
        if (tokenEmail && bodyEmail && tokenEmail !== bodyEmail) return res.status(403).json({ message: "Forbidden: email mismatch" });
        const result = await Favorite.deleteFavorite(db, {
            userEmail: effectiveEmail,
            review: reviewId,
        });

        if (!result.deletedCount) return res.status(404).json({ message: "Not found" });
        console.log('[favorites] DELETE (body) removed');
        res.json({ message: "Removed from favorites" });
    } catch (err) {
        console.error('[favorites] DELETE /api/favorites error', err);
        res.status(500).json({ message: "Server error" });
    }
});

router.delete("/:id", async (req, res) => {
    const tokenEmail = String(req.userEmail || '').toLowerCase();
    const allowBody = (process.env.ALLOW_DEV_EMAIL_BODY || 'false').toLowerCase() === 'true';
    const queryEmail = req.query && req.query.email ? String(req.query.email).toLowerCase().trim() : '';
    // userEmail validation
    if (!tokenEmail && (!queryEmail || typeof queryEmail !== 'string' || !queryEmail.includes('@') || queryEmail.length < 5)) {
        return res.status(400).json({ message: "Invalid or missing userEmail" });
    }
    const effectiveEmail = tokenEmail || (allowBody ? queryEmail : '');
    if (!effectiveEmail) return res.status(401).json({ message: 'Unauthorized' });
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    try {
        const db = req.app.locals.db;
        console.log('[favorites] DELETE /api/favorites/:id', { effectiveEmail, id });

        let result = await Favorite.deleteFavorite(db, { _id: new ObjectId(id), userEmail: effectiveEmail });
        if (!result.deletedCount) {
            result = await Favorite.deleteFavorite(db, { review: id, userEmail: effectiveEmail });
        }
        if (!result.deletedCount) return res.status(404).json({ message: 'Not found' });
        console.log('[favorites] DELETE /:id removed');
        return res.json({ message: 'Removed from favorites' });
    } catch (err) {
        console.error('[favorites] DELETE /api/favorites/:id error', err);
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;