
const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');


router.get('/', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        const favorites = await Favorite.find({ userEmail: email }).populate('reviewId');
        res.json(favorites);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching favorites' });
    }
});


router.post('/', async (req, res) => {
    const { userEmail, reviewId } = req.body;
    if (!userEmail || !reviewId)
        return res.status(400).json({ message: 'userEmail and reviewId are required' });

    try {
    
        const exists = await Favorite.findOne({ userEmail, reviewId });
        if (exists) return res.status(400).json({ message: 'Already in favorites' });

        const newFav = new Favorite({ userEmail, reviewId });
        await newFav.save();
        res.status(201).json(newFav);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding favorite' });
    }
});


router.delete('/:reviewId', async (req, res) => {
    const { reviewId } = req.params;
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        await Favorite.findOneAndDelete({ userEmail: email, reviewId });
        res.json({ message: 'Removed from favorites' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error removing favorite' });
    }
});

module.exports = router;
