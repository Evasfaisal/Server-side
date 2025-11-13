
const express = require("express");
const router = express.Router();
const Favorite = require("../models/Favorite");


router.get("/", async (req, res) => {
    try {
        const { email } = req.query;
        const favorites = await Favorite.find({ userEmail: email }).populate("review");
        res.json(favorites);
    } catch (err) {
        res.status(500).json({ message: "Error fetching favorites" });
    }
});


router.post("/", async (req, res) => {
    try {
        const { userEmail, reviewId } = req.body;
        const favorite = new Favorite({ userEmail, review: reviewId });
        await favorite.save();
        res.json(favorite);
    } catch (err) {
        res.status(500).json({ message: "Error adding favorite" });
    }
});


router.delete("/:id", async (req, res) => {
    try {
        await Favorite.findByIdAndDelete(req.params.id);
        res.json({ message: "Favorite removed" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting favorite" });
    }
});

module.exports = router;
