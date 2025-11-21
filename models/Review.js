

// Helper to get the reviews collection from app.locals
function getReviewsCollection(app) {
    return app.locals.reviews;
}

module.exports = { getReviewsCollection };