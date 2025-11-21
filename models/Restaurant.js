
// Helper to get the restaurants collection from app.locals
function getRestaurantsCollection(app) {
    return app.locals.restaurants;
}

module.exports = { getRestaurantsCollection };
