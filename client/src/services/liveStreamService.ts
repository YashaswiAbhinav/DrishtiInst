import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const liveStreamService = {
  // Get live stream URL from Firestore
  async getLiveStreamUrl(courseId: string): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be logged in to access live streams');
    }

    try {
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      if (courseDoc.exists()) {
        const courseData = courseDoc.data();
        return courseData.liveUrl || null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching live URL:', error);
      return null;
    }
  },

  // Check if course has live streaming
  async hasLiveStream(courseId: string): Promise<boolean> {
    try {
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      if (courseDoc.exists()) {
        const courseData = courseDoc.data();
        return !!courseData.liveUrl;
      }
      return false;
    } catch (error) {
      console.error('Error checking live stream:', error);
      return false;
    }
  },

  // Synchronous check for UI (returns true to show button, actual check happens on click)
  hasLiveStreamSync(courseId: string): boolean {
    return true; // Always show button, check on click
  }
};