import { auth } from '../lib/firebase';

interface StreamToken {
  token: string;
  expiresAt: number;
  courseId: string;
  userId: string;
}

class SecureStreamService {
  private tokenCache = new Map<string, StreamToken>();

  // Generate a secure token for stream access
  async generateStreamToken(courseId: string): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Create a time-limited token (valid for 2 hours)
    const expiresAt = Date.now() + (2 * 60 * 60 * 1000);
    const tokenData = {
      userId: user.uid,
      courseId,
      timestamp: Date.now(),
      expiresAt
    };

    // Simple token generation (in production, use JWT or similar)
    const token = btoa(JSON.stringify(tokenData));
    
    // Cache the token
    this.tokenCache.set(`${user.uid}-${courseId}`, {
      token,
      expiresAt,
      courseId,
      userId: user.uid
    });

    return token;
  }

  // Get authenticated stream URL with token
  async getSecureStreamUrl(courseId: string): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Return simple URL without complex tokens for now
    // TODO: Implement server-side token validation
    const baseUrl = `https://stream.drishtinstitute.com/hls/${courseId}/index.m3u8`;
    return baseUrl;
  }

  // Validate stream access
  isValidAccess(courseId: string): boolean {
    const user = auth.currentUser;
    if (!user) return false;

    const cacheKey = `${user.uid}-${courseId}`;
    const streamToken = this.tokenCache.get(cacheKey);
    
    return streamToken ? streamToken.expiresAt > Date.now() : false;
  }

  // Clear expired tokens
  clearExpiredTokens(): void {
    const now = Date.now();
    for (const [key, token] of this.tokenCache.entries()) {
      if (token.expiresAt < now) {
        this.tokenCache.delete(key);
      }
    }
  }
}

export const secureStreamService = new SecureStreamService();

// Clear expired tokens every 30 minutes
setInterval(() => {
  secureStreamService.clearExpiredTokens();
}, 30 * 60 * 1000);