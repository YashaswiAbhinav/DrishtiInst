# Google Drive Integration Setup

## Overview
The "My Courses" feature integrates with Google Drive to automatically display course content organized in a hierarchical structure:
- Course → Subjects → Chapters → Lectures

## Google Drive Folder Structure
Organize your Google Drive folders as follows:
```
Root Folder/
├── Class 9th/
│   ├── Physics/
│   │   ├── Motion/
│   │   │   ├── Motion - L1 Introduction.mp4
│   │   │   └── Motion - L2 Types of Motion.mp4
│   │   └── Force and Laws of Motion/
│   │       └── Force - L1 Newton's Laws.mp4
│   ├── Chemistry/
│   └── Mathematics/
├── Class 10th/
└── Class 12th/
```

## Setup Instructions

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Drive API

### 2. Create Service Account
1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Fill in the details and create
4. Generate a JSON key file and download it

### 3. Share Drive Folders
1. Share your course folders with the service account email
2. Give "Viewer" permission to the service account

### 4. Configure Environment Variables
1. Copy `.env.example` to `.env`
2. Update the following variables:
```env
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=path/to/your/service-account-key.json
CLASS_9_FOLDER_ID=your_actual_class_9_folder_id
CLASS_10_FOLDER_ID=your_actual_class_10_folder_id
CLASS_12_FOLDER_ID=your_actual_class_12_folder_id
```

### 5. Get Folder IDs
1. Open Google Drive in browser
2. Navigate to each course folder
3. Copy the folder ID from the URL (the long string after `/folders/`)

## Features
- **Automatic Content Discovery**: New videos are automatically shown when added to Drive
- **Hierarchical Navigation**: Browse through Course → Subject → Chapter → Lecture
- **Real-time Updates**: Content updates reflect immediately
- **Direct Video Access**: Click lectures to open in Google Drive player

## Mock Data
When Google Drive is not configured, the system uses mock data for development and testing.

## Troubleshooting
- Ensure service account has access to all folders
- Check that folder IDs are correct in environment variables
- Verify Google Drive API is enabled in your project
- Check service account key file path is correct