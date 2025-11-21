//firebaseAdmin.js
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You'll need to add your service account key to config.env

// Helper function to parse private key from environment variable
function parsePrivateKey(key) {
  if (!key) {
    return null;
  }
  
  // Remove surrounding quotes if present
  let parsed = key.trim().replace(/^["']|["']$/g, '');
  
  // Handle escaped newlines (both \n and \\n)
  parsed = parsed.replace(/\\n/g, '\n');
  
  // Ensure proper PEM format
  if (!parsed.includes('BEGIN PRIVATE KEY') || !parsed.includes('END PRIVATE KEY')) {
    return null;
  }
  
  return parsed;
}

// Validate Firebase credentials before initializing
const privateKey = parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

// Check if credentials are valid
if (!privateKey || privateKey.includes('YOUR_PRIVATE_KEY') || !projectId || !clientEmail || clientEmail.includes('xxxxx')) {
  console.error('⚠️  Firebase Admin SDK not initialized: Invalid or missing credentials');
  console.error('Please check your config.env file and ensure all Firebase credentials are properly set.');
  console.error('Required fields:');
  console.error('  - FIREBASE_PROJECT_ID');
  console.error('  - FIREBASE_PRIVATE_KEY (with actual private key, not placeholder)');
  console.error('  - FIREBASE_CLIENT_EMAIL');
} else {
  const serviceAccount = {
    type: "service_account",
    project_id: projectId,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: privateKey,
    client_email: clientEmail,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${clientEmail}`
  };

  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
      console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
      console.error('Please verify your Firebase credentials in config.env');
    }
  }
}

// Only export these if Firebase is initialized
let authAdmin = null;
let storageBucket = null;

try {
  if (admin.apps.length > 0) {
    authAdmin = admin.auth();
    storageBucket = admin.storage().bucket();
  }
} catch (error) {
  console.error('⚠️  Could not initialize Firebase Auth/Storage:', error.message);
}

module.exports = {
  admin,
  authAdmin,
  storageBucket
};
