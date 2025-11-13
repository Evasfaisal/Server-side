const express = require("express");
const router = express.Router();
const Restaurant = require("../models/Restaurant");


router.get("/", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;
        const sortOrder = req.query.sort === "rating_desc" ? -1 : 1;

        const restaurants = await Restaurant.find().sort({ rating: sortOrder }).limit(limit);
        res.json(restaurants);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching restaurants" });
    }
});

module.exports = router;
