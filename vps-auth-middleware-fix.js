// Replace your VPS middleware/auth.js with this:
const admin = require('firebase-admin');

// Initialize Firebase Admin with service account
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert('/root/payment-server/serviceAccountKey.json'),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
  }
}

exports.verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No auth header found, proceeding without user verification');
      req.user = null; // Allow request to proceed without user
      return next();
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error.message);
    // Don't block the request, just log the error
    req.user = null;
    next();
  }
};