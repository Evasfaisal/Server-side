const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const Review = require('../models/Review');
const { isValidObjectId } = require('mongoose'); 

router.get('/', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        const allFavorites = await Favorite.find({ userEmail: email });

 
        const reviewIds = allFavorites.map(fav => {
          
            return fav.review || fav.reviewId;
        }).filter(id => id && isValidObjectId(id));

      
        const reviewsData = await Review.find({ _id: { $in: reviewIds } });

      
        const reviewMap = reviewsData.reduce((map, review) => {
            map[review._id.toString()] = review;
            return map;
        }, {});

        
        const finalOutput = allFavorites.map(fav => {
            const reviewId = fav.review || fav.reviewId;
            return {
                ...fav.toObject(),
              
                review: reviewMap[reviewId]
            };
        });

        res.json(finalOutput);

    } catch (err) {
        console.error("Error in GET /favorites:", err);
        res.status(500).json({ message: 'Server error' });
    }
});



router.post('/', async (req, res) => {
 
    const { userEmail, review } = req.body;
    if (!userEmail || !review) return res.status(400).json({ message: 'Missing data' });

  
    if (!isValidObjectId(review)) {
        return res.status(400).json({ message: 'Invalid review ID format.' });
    }

    try {
      
        const exists = await Favorite.findOne({
            userEmail: userEmail,
            $or: [
                { review: review },    
                { reviewId: review }   
            ]
        });

        if (exists) return res.status(400).json({ message: 'Already in favorites' });

       
        const favorite = new Favorite({ userEmail, review: review });
        await favorite.save();

        const populated = await favorite.populate('review');
        res.status(201).json(populated);
    } catch (err) {
        console.error("Error in POST /favorites:", err);
        res.status(500).json({ message: 'Server error' });
    }
});


router.delete('/remove', async (req, res) => {
  
    const data = req.body.data || req.body;
    const { userEmail, review } = data;

    if (!userEmail || !review) {
        return res.status(400).json({ message: 'Missing userEmail or review' });
    }


    if (!isValidObjectId(review)) {
        console.error(`Invalid ObjectId received for removal: ${review}`);
        return res.status(400).json({ message: 'Invalid review ID format.' });
    }

    try {
      
        let result = await Favorite.findOneAndDelete({
            userEmail: userEmail,
            review: review
        });

        if (!result) {
         
            result = await Favorite.findOneAndDelete({
                userEmail: userEmail,
                reviewId: review
            });
        }

        if (!result) {
            return res.status(400).json({ message: 'Favorite not found or already removed.' });
        }

        res.json({ message: 'Favorite removed successfully' });
    } catch (err) {
        console.error("Error in DELETE /favorites/remove:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;