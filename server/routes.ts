import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { driveService } from "./driveService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Complete LMS structure endpoint
  app.get('/api/courses', async (req, res) => {
    try {
      const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
      if (!rootFolderId) {
        return res.status(500).json({ error: 'Root folder ID not configured' });
      }
      
      const structure = await driveService.getCompleteStructure(rootFolderId);
      res.json({ courses: structure });
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  });

  // Get specific folder contents
  app.get('/api/folder/:folderId', async (req, res) => {
    try {
      const { folderId } = req.params;
      const contents = await driveService.getFolderContents(folderId);
      res.json({ contents });
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Failed to fetch folder contents' });
    }
  });

  // Clear cache endpoint
  app.post('/api/cache/clear', (req, res) => {
    driveService.clearCache();
    res.json({ message: 'Cache cleared successfully' });
  });

  const httpServer = createServer(app);
  return httpServer;
}
