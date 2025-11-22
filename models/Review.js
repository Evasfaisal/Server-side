
const { ObjectId } = require('mongodb');

const COLLECTION_NAME = 'reviews';

async function createReview(db, data) {
    data.userEmail = String(data.userEmail).toLowerCase().trim();
    data.postedDate = data.postedDate ? new Date(data.postedDate) : new Date();
    if (data.date) data.date = new Date(data.date);
    const result = await db.collection(COLLECTION_NAME).insertOne(data);
    return result.ops ? result.ops[0] : result;
}

async function getReviews(db, filter = {}, options = {}) {
    let cursor = db.collection(COLLECTION_NAME).find(filter);
    if (options.sort) cursor = cursor.sort(options.sort);
    if (options.limit) cursor = cursor.limit(options.limit);
    return cursor.toArray();
}

async function getReviewById(db, id) {
    return db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
}

async function updateReview(db, id, data) {
    const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: data },
        { returnDocument: 'after' }
    );
    return result.value;
}

async function deleteReview(db, id) {
    return db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
}

module.exports = {
    createReview,
    getReviews,
    getReviewById,
    updateReview,
    deleteReview
};
