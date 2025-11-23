
const admin = require('firebase-admin');
if (!admin.apps.length) {
    let credentials;
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        credentials = admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
    } else {
        // লোকাল ডেভেলপমেন্টের জন্য fallback
        credentials = admin.credential.applicationDefault();
        console.log('FIREBASE_SERVICE_ACCOUNT env variable not found, using applicationDefault credential.');
    }
    admin.initializeApp({ credential: credentials });
}

async function verifyFirebaseToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No token provided');
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    console.log('Received Firebase ID Token:', idToken);
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        console.log('Decoded user:', decodedToken);
        next();
    } catch (err) {
        console.log('Token verification failed:', err);
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
}

module.exports = { verifyFirebaseToken };
