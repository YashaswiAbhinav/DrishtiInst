import { auth } from '@/lib/firebase';

export const liveClassService = {
  async getLiveClassUrl(clas: string): Promise<string | null> {
    try {
      const baseUrl = (import.meta as any).env.VITE_LIVE_CLASS_SERVER_URL || 'https://stream.drishtinstitute.com';
      const endpoint = `${baseUrl}/api/live-class/${clas}`;
      
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get live class URL: ${response.status}`);
      }
      
      const data = await response.json();
      return data.liveUrl;
    } catch (error) {
      console.error('Error getting live class URL:', error);
      return null;
    }
  },

  async checkLiveClassStatus(clas: string): Promise<boolean> {
    try {
      const baseUrl = (import.meta as any).env.VITE_LIVE_CLASS_SERVER_URL || 'https://stream.drishtinstitute.com';
      const endpoint = `${baseUrl}/api/live-class/${clas}/status`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.isLive || false;
    } catch (error) {
      console.error('Error checking live class status:', error);
      return false;
    }
  }
};