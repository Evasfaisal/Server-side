const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(' MongoDB connected successfully');
    } catch (err) {
        console.error(' MongoDB connection error:', err);
        process.exit(1); 
    }
}
connectDB();


const reviewRoutes = require('./routes/reviewRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes'); 


app.use('/api/reviews', reviewRoutes);
app.use('/api/restaurants', restaurantRoutes); 


app.get('/', (req, res) => {
    res.send(' Local Food Lovers Server is Running Successfully!');
});


app.listen(port, () => {
    console.log(` Server is running on port ${port}`);
});
