import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBDqQN8Oi_o9kwCX-p-KsukI9FgpWKIGqo",
  authDomain: "drishtimukesh-fd807.firebaseapp.com",
  databaseURL: "https://drishtimukesh-fd807-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "drishtimukesh-fd807",
  storageBucket: "drishtimukesh-fd807.firebasestorage.app",
  messagingSenderId: "750496390361",
  appId: "1:750496390361:web:31e0cb7375e99ece59f2c8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

export default app;