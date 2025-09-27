import { auth, db } from '@/lib/firebase';

export const testFirebaseConnection = () => {
  console.log('Testing Firebase connection...');
  console.log('Auth instance:', auth);
  console.log('Firestore instance:', db);
  console.log('Firebase config loaded:', {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? 'Present' : 'Missing',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'Present' : 'Missing',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Present' : 'Missing',
  });
};