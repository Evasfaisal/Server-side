const express = require('express');
const router = express.Router();
const { addFavorite, getFavoritesByUser, removeFavorite } = require('../controllers/favoriteController');


router.post('/', addFavorite);


router.get('/:email', getFavoritesByUser);


router.delete('/:id', removeFavorite);

module.exports = router;
