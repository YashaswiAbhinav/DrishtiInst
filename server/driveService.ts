import { google } from 'googleapis';

interface DriveItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  createdTime?: string;
  modifiedTime?: string;
  link?: string;
  embedUrl?: string;
  children?: DriveItem[];
}

export class DriveService {
  private drive: any;
  private cache = new Map<string, { data: DriveItem[], timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    this.drive = google.drive({ version: 'v3', auth });
  }

  async getCompleteStructure(rootFolderId: string): Promise<DriveItem[]> {
    const cacheKey = `structure_${rootFolderId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const structure = await this.traverseFolder(rootFolderId);
      this.cache.set(cacheKey, { data: structure, timestamp: Date.now() });
      return structure;
    } catch (error) {
      console.error('Error getting complete structure:', error);
      throw error;
    }
  }

  private async traverseFolder(folderId: string): Promise<DriveItem[]> {
    const items: DriveItem[] = [];
    let pageToken: string | undefined;

    do {
      try {
        const response = await this.drive.files.list({
          q: `'${folderId}' in parents and trashed=false`,
          fields: 'nextPageToken, files(id, name, mimeType, createdTime, modifiedTime, webViewLink)',
          orderBy: 'name',
          pageSize: 100,
          pageToken,
        });

        for (const file of response.data.files) {
          const item: DriveItem = {
            id: file.id,
            name: file.name,
            type: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
            createdTime: file.createdTime,
            modifiedTime: file.modifiedTime,
            link: file.webViewLink,
          };

          if (item.type === 'file' && file.mimeType.startsWith('video/')) {
            item.embedUrl = this.getEmbedUrl(file.id);
          }

          // Recursively get children for folders
          if (item.type === 'folder') {
            item.children = await this.traverseFolder(file.id);
          }

          items.push(item);
        }

        pageToken = response.data.nextPageToken;
      } catch (error) {
        console.error(`Error traversing folder ${folderId}:`, error);
        break;
      }
    } while (pageToken);

    return items;
  }

  async getFolderContents(folderId: string): Promise<DriveItem[]> {
    const cacheKey = `folder_${folderId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, createdTime, modifiedTime, webViewLink)',
        orderBy: 'name',
      });

      const items = response.data.files.map((file: any) => ({
        id: file.id,
        name: file.name,
        type: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime,
        link: file.webViewLink,
        embedUrl: file.mimeType.startsWith('video/') ? this.getEmbedUrl(file.id) : undefined,
      }));

      this.cache.set(cacheKey, { data: items, timestamp: Date.now() });
      return items;
    } catch (error) {
      console.error('Error getting folder contents:', error);
      throw error;
    }
  }

  private getEmbedUrl(fileId: string): string {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  clearCache() {
    this.cache.clear();
  }
}

export const driveService = new DriveService();