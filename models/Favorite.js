
<<<<<<< HEAD
const { ObjectId } = require('mongodb');

const COLLECTION_NAME = 'favorites';

async function createFavorite(db, data) {
  data.userEmail = String(data.userEmail).toLowerCase().trim();
  data.review = new ObjectId(data.review);
  const result = await db.collection(COLLECTION_NAME).insertOne(data);
  return result.ops ? result.ops[0] : result;
}

async function getFavorites(db, filter = {}) {
  if (filter.userEmail) filter.userEmail = String(filter.userEmail).toLowerCase().trim();
  if (filter.review) filter.review = new ObjectId(filter.review);
  return db.collection(COLLECTION_NAME).find(filter).toArray();
}

async function deleteFavorite(db, filter = {}) {
  if (filter.userEmail) filter.userEmail = String(filter.userEmail).toLowerCase().trim();
  if (filter.review) filter.review = new ObjectId(filter.review);
  return db.collection(COLLECTION_NAME).deleteOne(filter);
}

module.exports = {
  createFavorite,
  getFavorites,
  deleteFavorite
};
=======
// Helper to get the favorites collection from app.locals
function getFavoritesCollection(app) {
  return app.locals.favorites;
}

module.exports = { getFavoritesCollection };
>>>>>>> e43baf49644f1ba8644ad1ce26729bc6f034d74e
