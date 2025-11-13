const Favorite = require("../models/Favorite");
const Review = require("../models/Review");


exports.addFavorite = async (req, res) => {
    try {
        const { userEmail, reviewId } = req.body;
        if (!userEmail || !reviewId)
            return res.status(400).json({ message: "Missing userEmail or reviewId" });

        const exists = await Favorite.findOne({ userEmail, review: reviewId });
        if (exists) return res.status(409).json({ message: "Already in favorites" });

        const favorite = new Favorite({ userEmail, review: reviewId });
        await favorite.save();

        res.status(201).json(favorite);
    } catch (error) {
        console.error("Error adding favorite:", error);
        res.status(500).json({ message: "Server error" });
    }
};


exports.getFavorites = async (req, res) => {
    try {
        const { email } = req.query;
        const favorites = await Favorite.find({ userEmail: email }).populate("review");
        res.json(favorites);
    } catch (error) {
        console.error("Error fetching favorites:", error);
        res.status(500).json({ message: "Server error" });
    }
};


exports.deleteFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        await Favorite.findByIdAndDelete(id);
        res.json({ message: "Removed from favorites" });
    } catch (error) {
        console.error("Error deleting favorite:", error);
        res.status(500).json({ message: "Server error" });
    }
};
