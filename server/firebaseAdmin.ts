import fs from 'fs';
import admin from 'firebase-admin';
import { resolve } from 'path';

// Prefer explicit service account path via env var, fallback to repository path
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || resolve(__dirname, '../serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin initialized with', serviceAccountPath);
  } catch (err) {
    console.error('Failed to initialize Firebase Admin using', serviceAccountPath, err);
    // allow process to continue - other environments may use ADC
    try {
      admin.initializeApp();
      console.log('Firebase Admin initialized with default credentials');
    } catch (e) {
      console.error('Default Firebase Admin initialization failed', e);
    }
  }
} else {
  try {
    admin.initializeApp();
    console.log('Firebase Admin initialized with default credentials (no serviceAccount file found)');
  } catch (e) {
    console.error('Firebase Admin initialization failed and no serviceAccount file found at', serviceAccountPath, e);
  }
}

export { admin };
