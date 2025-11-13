const Favorite = require('../models/Favorite');
const Review = require('../models/Review');


exports.addFavorite = async (req, res) => {
    try {
        const { userEmail, reviewId } = req.body;

      
        const existing = await Favorite.findOne({ userEmail, reviewId });
        if (existing) return res.status(400).json({ message: "Already in favorites" });

        const favorite = new Favorite({ userEmail, reviewId });
        await favorite.save();
        res.status(201).json(favorite);
    } catch (err) {
        res.status(500).json({ message: "Error adding favorite", error: err.message });
    }
};


exports.getFavoritesByUser = async (req, res) => {
    try {
        const { email } = req.params;
        const favorites = await Favorite.find({ userEmail: email }).populate('reviewId');
        res.status(200).json(favorites);
    } catch (err) {
        res.status(500).json({ message: "Error fetching favorites", error: err.message });
    }
};


exports.removeFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        await Favorite.findByIdAndDelete(id);
        res.status(200).json({ message: "Favorite removed" });
    } catch (err) {
        res.status(500).json({ message: "Error removing favorite", error: err.message });
    }
};
