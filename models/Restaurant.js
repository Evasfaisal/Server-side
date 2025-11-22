const { ObjectId } = require('mongodb');

const COLLECTION_NAME = 'restaurants';

async function createRestaurant(db, data) {
    const result = await db.collection(COLLECTION_NAME).insertOne(data);
    return result.ops ? result.ops[0] : result;
}

async function getRestaurants(db, filter = {}) {
    return db.collection(COLLECTION_NAME).find(filter).toArray();
}

async function getRestaurantById(db, id) {
    return db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
}

async function updateRestaurant(db, id, data) {
    const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: data },
        { returnDocument: 'after' }
    );
    return result.value;
}

async function deleteRestaurant(db, id) {
    return db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
}

module.exports = {
    createRestaurant,
    getRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant
};
