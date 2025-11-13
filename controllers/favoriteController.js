const { ObjectId } = require("mongodb");
const client = require("../db/mongoClient"); 


const getFavorites = async (req, res) => {
    const email = req.query.email;
    try {
        const favorites = await client
            .db("foodLover")
            .collection("favorites")
            .aggregate([
                { $match: { userEmail: email } },
                {
                    $lookup: {
                        from: "reviews",
                        localField: "reviewId",
                        foreignField: "_id",
                        as: "review",
                    },
                },
                { $unwind: "$review" },
            ])
            .toArray();
        res.json(favorites);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const addFavorite = async (req, res) => {
    const { userEmail, reviewId } = req.body;
    try {
        const result = await client.db("foodLover").collection("favorites").insertOne({
            userEmail,
            reviewId: ObjectId(reviewId),
            addedAt: new Date(),
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const deleteFavorite = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await client
            .db("foodLover")
            .collection("favorites")
            .deleteOne({ _id: ObjectId(id) });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getFavorites, addFavorite, deleteFavorite };
