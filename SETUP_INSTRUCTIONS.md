# Dynamic LMS Content System - Setup Instructions

## Overview
This system automatically fetches course content from Google Drive and displays it in a hierarchical structure: **Courses → Subjects → Chapters → Lectures**. No code changes needed when adding new content.

## Google Cloud Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Note your project ID

### 2. Enable Google Drive API
1. Go to "APIs & Services" → "Library"
2. Search for "Google Drive API"
3. Click "Enable"

### 3. Create Service Account
1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Fill details:
   - Name: `lms-drive-service`
   - Description: `Service account for LMS Google Drive access`
4. Click "Create and Continue"
5. Skip role assignment (click "Continue")
6. Click "Done"

### 4. Generate Service Account Key
1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Select "JSON" format
5. Download the key file
6. Save as `drive-api-file.json` in your project root

### 5. Share Google Drive Folders
1. Open Google Drive
2. Create your course structure:
   ```
   📂 LMS_ROOT_FOLDER
   ├── 📂 Class 9th
   │   ├── 📂 Physics
   │   │   ├── 📂 Units and Measurements
   │   │   │   ├── 🎥 Lecture 1.mp4
   │   │   │   └── 🎥 Lecture 2.mp4
   │   │   └── 📂 Motion
   │   ├── 📂 Chemistry
   │   └── 📂 Mathematics
   ├── 📂 Class 10th
   └── 📂 Class 12th
   ```
3. Right-click on LMS_ROOT_FOLDER → "Share"
4. Add the service account email (from the JSON file: `client_email`)
5. Give "Viewer" permission
6. Copy the folder ID from URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`

## Environment Configuration

### 1. Update .env file
```env
# Google Drive API Configuration
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=d:\WORK\Drishti_Institute_V3\DrishtiInst\drive-api-file.json
GOOGLE_DRIVE_ROOT_FOLDER_ID=YOUR_ROOT_FOLDER_ID_HERE

# Server Configuration
PORT=5000
HOST=localhost
NODE_ENV=development
```

### 2. Replace placeholders:
- `YOUR_ROOT_FOLDER_ID_HERE` with your actual folder ID
- Update the key file path if different

## Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Application
```bash
npm run build
```

### 3. Start the Server
```bash
npm start
```

### 4. Access the Application
- Open browser: `http://localhost:5000`
- Login with any credentials (mock authentication)
- Click "Course Content" in the sidebar

## API Endpoints

### Get Complete Course Structure
```
GET /api/courses
```
Returns complete hierarchical structure with all courses, subjects, chapters, and lectures.

### Get Specific Folder Contents
```
GET /api/folder/:folderId
```
Returns contents of a specific folder.

### Clear Cache
```
POST /api/cache/clear
```
Clears the cache to force fresh data from Google Drive.

## Features

### ✅ Dynamic Content Discovery
- Automatically detects new courses, subjects, chapters
- No code changes needed for new content
- Real-time updates when cache is cleared

### ✅ Hierarchical Display
- Expandable folder structure
- Visual icons for different content types
- File modification dates
- Direct links to Google Drive files

### ✅ Performance Optimization
- 5-minute cache for API responses
- Pagination support for large folders
- Efficient recursive folder traversal

### ✅ Error Handling
- Graceful error messages
- Retry functionality
- Cache clearing option

## Folder Structure Best Practices

### Recommended Naming Convention:
```
📂 Class 9th
├── 📂 Physics
│   ├── 📂 01 - Units and Measurements
│   │   ├── 🎥 Units and Measurements - L1 Introduction.mp4
│   │   ├── 🎥 Units and Measurements - L2 SI Units.mp4
│   │   └── 🎥 Units and Measurements - L3 Dimensional Analysis.mp4
│   ├── 📂 02 - Motion
│   │   ├── 🎥 Motion - L1 Types of Motion.mp4
│   │   └── 🎥 Motion - L2 Uniform Motion.mp4
│   └── 📂 03 - Force and Laws of Motion
├── 📂 Chemistry
│   ├── 📂 01 - Matter in Our Surroundings
│   └── 📂 02 - Is Matter Around Us Pure
└── 📂 Mathematics
    ├── 📂 01 - Number Systems
    └── 📂 02 - Polynomials
```

### Tips:
- Use consistent naming patterns
- Include lecture numbers (L1, L2, etc.)
- Add dates in folder/file names if needed
- Keep folder names descriptive but concise

## Troubleshooting

### Common Issues:

1. **"Root folder ID not configured"**
   - Check `.env` file has correct `GOOGLE_DRIVE_ROOT_FOLDER_ID`

2. **"Failed to fetch courses"**
   - Verify service account has access to the folder
   - Check service account key file path
   - Ensure Google Drive API is enabled

3. **Empty course list**
   - Verify folder sharing permissions
   - Check folder structure matches expected hierarchy
   - Try clearing cache with refresh button

4. **Authentication errors**
   - Regenerate service account key
   - Verify JSON key file is valid
   - Check file path in `.env`

### Debug Steps:
1. Check server logs for detailed error messages
2. Verify Google Drive folder permissions
3. Test API endpoints directly: `http://localhost:5000/api/courses`
4. Clear cache and retry

## Security Notes

- Service account key file contains sensitive credentials
- Add `drive-api-file.json` to `.gitignore`
- Use environment variables for production deployment
- Regularly rotate service account keys
- Limit folder sharing to specific service accounts only