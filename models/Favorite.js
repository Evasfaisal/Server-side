
// Helper to get the favorites collection from app.locals
function getFavoritesCollection(app) {
  return app.locals.favorites;
}

module.exports = { getFavoritesCollection };
