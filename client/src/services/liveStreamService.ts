import { auth } from '../lib/firebase';
import { secureStreamService } from './secureStreamService';

export const liveStreamService = {
  // Stream key mapping for courses
  streamKeys: {
    'Class 9th': 'class_9',
    'Class 10th': 'class_10',
    'Class 11th Physics': 'class_11_physics',
    'Class 11th Chemistry': 'class_11_chemistry',
    'Class 11th Maths': 'class_11_maths',
    'Class 12th Physics': 'class_12_physics',
    'Class 12th Chemistry': 'class_12_chemistry',
    'Class 12th Maths': 'class_12_maths',
  },

  // Get secure live stream URL for a course
  async getLiveStreamUrl(courseName: string): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be logged in to access live streams');
    }

    const streamKey = this.streamKeys[courseName as keyof typeof this.streamKeys];
    if (!streamKey) return null;
    
    // Use secure stream service for authenticated URLs
    return await secureStreamService.getSecureStreamUrl(streamKey);
  },

  // Check if course has live streaming
  hasLiveStream(courseName: string): boolean {
    return courseName in this.streamKeys;
  },

  // Get all available live courses
  getLiveCourses(): string[] {
    return Object.keys(this.streamKeys);
  }
};