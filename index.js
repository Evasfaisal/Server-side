const express = require('express');
const cors = require('cors');

const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
<<<<<<< HEAD
const { MongoClient } = require('mongodb');
=======

>>>>>>> e43baf49644f1ba8644ad1ce26729bc6f034d74e

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
const allowAll = String(process.env.CORS_ALLOW_ALL || 'true').toLowerCase() === 'true';
const rawOrigins = process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:5174';
const allowedOrigins = rawOrigins.split(',').map(o => o.trim()).filter(Boolean);
const allowLocalhostAll = String(process.env.ALLOW_LOCALHOST_ALL || 'true').toLowerCase() === 'true';
const corsOptions = {
  origin: function (origin, callback) {
    if (allowAll) return callback(null, true);
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (allowLocalhostAll && /^https?:\/\/(localhost|127\.0\.0\.1)(:\\d+)?$/.test(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
    res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
    return res.status(403).json({ message: 'CORS Preflight check failed. Your origin is likely not allowed.' });
  }
  next();
});

let optionalAuth;
try {
  ({ optionalAuth } = require('./middleware/auth'));
} catch (e) {
  optionalAuth = (req, _res, next) => {
    const header = req.headers['x-user-email'];
    if (typeof header === 'string') req.userEmail = header;
    else if (Array.isArray(header)) req.userEmail = header[0];
    next();
  };
}

app.use(optionalAuth);

<<<<<<< HEAD

const client = new MongoClient(process.env.MONGO_URI);
client.connect()
  .then(() => {
    console.log("✅ MongoDB Connected");
    const dbName = process.env.DB_NAME || client.db().databaseName;
    app.locals.db = client.db(dbName);
  })
  .catch(err => { console.error(err); process.exit(1); });
=======
// MongoDB connection
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri, { useUnifiedTopology: true });

async function startServer() {
  try {
    await client.connect();
    const db = client.db();
    app.locals.db = db;
    app.locals.reviews = db.collection('reviews');
    app.locals.restaurants = db.collection('restaurants');
    app.locals.favorites = db.collection('favorites');
    console.log('MongoDB Connected');
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

startServer();


>>>>>>> e43baf49644f1ba8644ad1ce26729bc6f034d74e

const reviewRoutes = require('./routes/reviewRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');

app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/restaurants', restaurantRoutes);

app.get('/', (req, res) => {
  res.send('Server running...');
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Origin not allowed by CORS' });
  }
  return res.status(500).json({ message: 'Internal Server Error' });
});


