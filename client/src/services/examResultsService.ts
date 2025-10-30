import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const examResultsService = {
  async getToppers() {
    try {
      const querySnapshot = await getDocs(collection(db, 'exam_results'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching exam results:', error);
      return [];
    }
  }
};