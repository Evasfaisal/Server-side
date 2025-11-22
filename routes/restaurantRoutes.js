const express = require("express");
const router = express.Router();
const { getRestaurantsCollection } = require("../models/Restaurant");


router.get("/", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;
        const sortOrder = req.query.sort === "rating_desc" ? -1 : 1;
        const restaurantsCol = getRestaurantsCollection(req.app);
        const restaurants = await restaurantsCol.find().sort({ rating: sortOrder }).limit(limit).toArray();
        res.json(restaurants);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching restaurants" });
    }
});

module.exports = router;
