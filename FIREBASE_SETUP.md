# Firebase Migration Setup Guide

## Backend Setup (Server)

### 1. Firebase Admin SDK Configuration

Add the following environment variables to your `server/config.env` file:

```env
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

### 2. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key"
5. Download the JSON file and extract the values for the environment variables above

## Frontend Setup

### 1. Firebase Web App Configuration

Create a `.env` file in your project root with:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### 2. Get Firebase Web App Config

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > General
4. Scroll down to "Your apps" section
5. Click the web app icon (</>) to add a web app
6. Copy the config values to your `.env` file

## Firebase Console Setup

### 1. Enable Authentication

1. Go to Authentication > Sign-in method
2. Enable "Google" provider
3. Add your domain to authorized domains

### 2. Enable Storage

1. Go to Storage
2. Create a new bucket if needed
3. Set up security rules for public access to uploads

### 3. Storage Security Rules

Add these rules to your Firebase Storage:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{userId}/{allPaths=**} {
      allow read: if true; // Public read access
      allow write: if request.auth != null; // Authenticated write access
    }
  }
}
```

## Usage Examples

### Frontend Google Authentication

```javascript
import { signInWithGoogle } from './firebaseClient';

const handleGoogleLogin = async () => {
  try {
    const user = await signInWithGoogle();
    const idToken = await user.getIdToken();
    
    // Send ID token to your backend
    const response = await fetch('/api/auth/google-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    
    const data = await response.json();
    // Handle successful login
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Frontend File Upload

```javascript
import { uploadFileToFirebase } from './firebaseClient';

const handleFileUpload = async (file, userId) => {
  try {
    const downloadURL = await uploadFileToFirebase(file, userId);
    
    // Send URL to your backend to save metadata
    const response = await fetch('/api/media/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId, 
        type: 'image', 
        firebase_url: downloadURL 
      })
    });
    
    const data = await response.json();
    // Handle successful upload
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

## Migration Checklist

- [x] Removed Supabase package and dependencies
- [x] Installed Firebase packages (firebase, firebase-admin)
- [x] Created Firebase Admin SDK configuration
- [x] Created Firebase client configuration
- [x] Updated User model to support Firebase authentication
- [x] Updated Media model to use firebase_url
- [x] Updated media upload routes to use Firebase Storage
- [x] Added Google Authentication route
- [x] Updated environment configuration

## Next Steps

1. Set up Firebase project in console
2. Configure environment variables
3. Test Google authentication
4. Test file uploads
5. Update frontend components to use new Firebase client
6. Remove any remaining Supabase references from frontend
