import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

export class GoogleDriveService {
  private drive: any;
  private isConfigured: boolean;
  private rootFolderId: string;

  constructor() {
    this.isConfigured = !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE;
    this.rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || '';
    
    if (this.isConfigured) {
      const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
        scopes: SCOPES,
      });
      this.drive = google.drive({ version: 'v3', auth });
    }
  }

  async getAllCourses() {
    if (!this.isConfigured || !this.rootFolderId) {
      return ['Class 9th', 'Class 10th', 'Class 11th', 'Class 12th'];
    }

    try {
      const response = await this.drive.files.list({
        q: `'${this.rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id,name)',
        orderBy: 'name',
      });

      return response.data.files.map((file: any) => file.name);
    } catch (error) {
      console.error('Error fetching courses:', error);
      return ['Class 9th', 'Class 10th', 'Class 11th', 'Class 12th'];
    }
  }

  async getCourseFolder(courseName: string) {
    if (!this.isConfigured || !this.rootFolderId) {
      return null;
    }

    try {
      const response = await this.drive.files.list({
        q: `'${this.rootFolderId}' in parents and name='${courseName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id,name)',
      });

      return response.data.files[0]?.id || null;
    } catch (error) {
      console.error('Error finding course folder:', error);
      return null;
    }
  }

  async getFolderContents(folderId: string) {
    if (!this.isConfigured) {
      return this.getMockFolderContents(folderId);
    }

    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id,name,mimeType,modifiedTime,webViewLink)',
        orderBy: 'name',
      });

      return response.data.files.map((file: any) => ({
        id: file.id,
        name: file.name,
        type: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
        modifiedTime: file.modifiedTime,
        webViewLink: file.webViewLink,
      }));
    } catch (error) {
      console.error('Error fetching folder contents:', error);
      throw error;
    }
  }

  private getMockFolderContents(folderId: string) {
    // Mock data for development/testing
    const mockData: Record<string, any[]> = {
      '1e2UM_a7mh3STK7m7YLZf1a41-ZnLMdY1': [
        { id: 'physics_9', name: 'Physics', type: 'folder', modifiedTime: '2024-01-15T10:00:00Z', webViewLink: '#' },
        { id: 'chemistry_9', name: 'Chemistry', type: 'folder', modifiedTime: '2024-01-14T10:00:00Z', webViewLink: '#' },
        { id: 'maths_9', name: 'Mathematics', type: 'folder', modifiedTime: '2024-01-13T10:00:00Z', webViewLink: '#' }
      ],
      '1iZEndLh05fMcInwWJOEZk_-opunjYgHc': [
        { id: 'physics_10', name: 'Physics', type: 'folder', modifiedTime: '2024-01-15T10:00:00Z', webViewLink: '#' },
        { id: 'chemistry_10', name: 'Chemistry', type: 'folder', modifiedTime: '2024-01-14T10:00:00Z', webViewLink: '#' },
        { id: 'maths_10', name: 'Mathematics', type: 'folder', modifiedTime: '2024-01-13T10:00:00Z', webViewLink: '#' }
      ],
      '19RH8vB3Xr2Bc0QgoaYN5tjo1qdXnlV33': [
        { id: 'physics_12', name: 'Physics', type: 'folder', modifiedTime: '2024-01-15T10:00:00Z', webViewLink: '#' },
        { id: 'chemistry_12', name: 'Chemistry', type: 'folder', modifiedTime: '2024-01-14T10:00:00Z', webViewLink: '#' },
        { id: 'maths_12', name: 'Mathematics', type: 'folder', modifiedTime: '2024-01-13T10:00:00Z', webViewLink: '#' }
      ],
      'physics_9': [
        { id: 'motion_9', name: 'Motion', type: 'folder', modifiedTime: '2024-01-15T10:00:00Z', webViewLink: '#' },
        { id: 'force_9', name: 'Force and Laws of Motion', type: 'folder', modifiedTime: '2024-01-14T10:00:00Z', webViewLink: '#' }
      ],
      'motion_9': [
        { id: 'motion_l1', name: 'Motion - L1 Introduction', type: 'file', modifiedTime: '2024-01-15T10:00:00Z', webViewLink: 'https://drive.google.com/file/d/example1' },
        { id: 'motion_l2', name: 'Motion - L2 Types of Motion', type: 'file', modifiedTime: '2024-01-14T10:00:00Z', webViewLink: 'https://drive.google.com/file/d/example2' }
      ]
    };
    
    return mockData[folderId] || [];
  }

  async searchFiles(query: string, folderId?: string) {
    if (!this.isConfigured) {
      return [];
    }

    try {
      let searchQuery = `name contains '${query}' and trashed=false`;
      if (folderId) {
        searchQuery += ` and '${folderId}' in parents`;
      }

      const response = await this.drive.files.list({
        q: searchQuery,
        fields: 'files(id,name,mimeType,modifiedTime,webViewLink)',
        orderBy: 'name',
      });

      return response.data.files;
    } catch (error) {
      console.error('Error searching files:', error);
      throw error;
    }
  }
}

export const driveService = new GoogleDriveService();