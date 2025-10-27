import { auth } from '../lib/firebase';

class SecureStreamService {
  // Get simple stream URL without tokens
  async getSecureStreamUrl(courseId: string): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Return simple URL without tokens
    const baseUrl = `https://stream.drishtinstitute.com/hls/${courseId}/index.m3u8`;
    return baseUrl;
  }

  // Validate stream access
  isValidAccess(courseId: string): boolean {
    const user = auth.currentUser;
    return user !== null;
  }
}

export const secureStreamService = new SecureStreamService();