const express = require("express");
const router = express.Router();
const {
    getFavorites,
    addFavorite,
    deleteFavorite,
} = require("../controllers/favoriteController");

router.get("/", getFavorites);
router.post("/", addFavorite);
router.delete("/:id", deleteFavorite);

module.exports = router;
