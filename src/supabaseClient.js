import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lziqfetgqrpgpinexwbq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6aXFmZXRncXJwZ3BpbmV4d2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NDM3MTksImV4cCI6MjA3NTMxOTcxOX0.A0mCCu_rsEybIYotdUSrLSTsmNokl7VM1YVcYstB6jI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Uploads a file to Supabase Storage under a user's folder
 * @param {File} file - file object from frontend
 * @param {string} userId - your MongoDB user ID
 * @returns {Promise<string>} - returns the file path if successful
 */
export async function uploadFile(file, userId) {
  // Folder path: each user has their own folder
  const filePath = `${userId}/${file.name}`;

  const { data, error } = await supabase.storage
    .from('media')      // your Supabase bucket name
    .upload(filePath, file);

  if (error) {
    console.error('Supabase upload error:', error.message);
    throw error;
  }

  return data.path; // This path can be stored in MongoDB
}

/**
 * Get public URL for a stored file
 * @param {string} path - Supabase file path
 * @returns {string} - public URL
 */
export function getPublicUrl(path) {
  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
}
