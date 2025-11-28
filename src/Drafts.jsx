import React, { useState, useEffect } from "react";
import { Download, Trash2, Video, Image, Play, Loader } from "lucide-react";
import { supabase } from './supabaseClient'; // Import from your centralized file

export default function Drafts() {
  const [drafts, setDrafts] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftError, setDraftError] = useState(null);
  const [draftSuccess, setDraftSuccess] = useState(false);

  useEffect(() => {
    // Get user from localStorage (MongoDB authentication)
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Check all possible user ID fields
        let userId = parsedUser._id || parsedUser.id || parsedUser.userId;
        
        // If user ID not in user object, decode from JWT token
        if (!userId && token) {
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decoded = JSON.parse(jsonPayload);
            userId = decoded.userId || decoded.id || decoded._id;
            console.log('Decoded user ID from token:', userId);
          } catch (decodeErr) {
            console.error('Failed to decode token:', decodeErr);
          }
        }
        
        if (userId) {
          fetchDrafts(userId.toString());
        } else {
          console.error('User ID not found');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDrafts = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      // Query Supabase for user's drafts using MongoDB user ID
      const { data, error: fetchError } = await supabase
        .from('drafts')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (fetchError) throw fetchError;

      setDrafts(data || []);
    } catch (err) {
      console.error('Error fetching drafts:', err);
      setError('Failed to load drafts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async (draftData, type) => {
    if (!user) {
      setError('Please log in to save drafts');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const userId = user._id || user.id; // MongoDB user ID
      let mediaUrl = '';
      let storagePath = '';

      if (type === 'image' && draftData.image) {
        // Convert base64 to blob
        const response = await fetch(draftData.image);
        const blob = await response.blob();

        // Create unique file path: userId/images/timestamp.png
        const timestamp = Date.now();
        storagePath = `${userId}/images/${timestamp}.png`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('drafts')
          .upload(storagePath, blob, {
            contentType: 'image/png',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('drafts')
          .getPublicUrl(storagePath);

        mediaUrl = publicUrl;

      } else if (type === 'video' && draftData.videoUrl) {
        // For videos
        if (draftData.videoUrl.startsWith('blob:') || draftData.videoUrl.startsWith('data:')) {
          const response = await fetch(draftData.videoUrl);
          const blob = await response.blob();

          const timestamp = Date.now();
          storagePath = `${userId}/videos/${timestamp}.mp4`;

          const { error: uploadError } = await supabase.storage
            .from('drafts')
            .upload(storagePath, blob, {
              contentType: 'video/mp4',
              upsert: false
            });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('drafts')
            .getPublicUrl(storagePath);

          mediaUrl = publicUrl;
        } else {
          mediaUrl = draftData.videoUrl;
        }
      }

      // Save metadata to Supabase database
      const draft = {
        user_id: userId, // MongoDB user ID
        type,
        media_url: mediaUrl,
        storage_path: storagePath,
        timestamp: Date.now(),
        created_at: new Date().toISOString(),
        duration: type === 'video' ? (draftData.duration || 0) : null,
        text_overlays: type === 'video' ? (draftData.textOverlays || []) : null,
        filters: type === 'video' ? (draftData.filters || {}) : null
      };

      const { error: insertError } = await supabase
        .from('drafts')
        .insert([draft]);

      if (insertError) throw insertError;

      // Refresh drafts list
      await fetchDrafts(userId);
    } catch (err) {
      console.error('Error saving draft:', err);
      setError(`Failed to save draft: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const deleteDraft = async (draftId, storagePath) => {
    try {
      // Delete from Supabase Storage
      if (storagePath) {
        const { error: deleteStorageError } = await supabase.storage
          .from('drafts')
          .remove([storagePath]);

        if (deleteStorageError) {
          console.error('Error deleting file:', deleteStorageError);
        }
      }

      // Delete from database
      const { error: deleteDbError } = await supabase
        .from('drafts')
        .delete()
        .eq('id', draftId);

      if (deleteDbError) throw deleteDbError;

      // Update local state
      setDrafts(drafts.filter(d => d.id !== draftId));
    } catch (err) {
      console.error('Error deleting draft:', err);
      setError('Failed to delete draft. Please try again.');
    }
  };

  const downloadDraft = (draft) => {
    const link = document.createElement('a');
    link.href = draft.media_url;
    link.download = `draft-${draft.timestamp}.${draft.type === 'image' ? 'png' : 'mp4'}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const imageDrafts = drafts.filter(d => d.type === 'image');
  const videoDrafts = drafts.filter(d => d.type === 'video');
  const totalDrafts = drafts.length;

  const filteredDrafts = activeTab === 'all' 
    ? drafts 
    : activeTab === 'images' 
    ? imageDrafts
    : videoDrafts;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your drafts...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your drafts</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Drafts</h1>
              <p className="text-gray-600 mt-1">
                Welcome, {user.name || user.email} • {totalDrafts} {totalDrafts === 1 ? "draft" : "drafts"} saved
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Uploading Indicator */}
          {uploading && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
              <Loader className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-blue-700">Saving draft to cloud...</span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm w-fit">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All ({totalDrafts})
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === 'images'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Image size={16} />
              Images ({imageDrafts.length})
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === 'videos'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Video size={16} />
              Videos ({videoDrafts.length})
            </button>
          </div>
        </div>

        {/* Drafts Grid */}
        {filteredDrafts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">
              {activeTab === 'images' ? '🖼️' : activeTab === 'videos' ? '🎬' : '📝'}
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No {activeTab === 'all' ? '' : activeTab} drafts yet
            </h2>
            <p className="text-gray-500 mb-6">
              {activeTab === 'images' && 'Create product showcases and save them here'}
              {activeTab === 'videos' && 'Edit videos and save them to drafts'}
              {activeTab === 'all' && 'Create and save your content here for later'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrafts.map((draft) => (
              <div
                key={draft.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
              >
                {/* Preview */}
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative group">
                  {draft.type === 'image' ? (
                    <img
                      src={draft.media_url}
                      alt="Draft"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 bg-blue-600 rounded-full flex items-center justify-center">
                          <Play size={28} className="text-white ml-1" />
                        </div>
                        <p className="text-white text-sm font-medium">Video Draft</p>
                        {draft.duration && (
                          <p className="text-gray-400 text-xs mt-1">
                            {formatDuration(draft.duration)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Type Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      draft.type === 'image' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-blue-500 text-white'
                    }`}>
                      {draft.type === 'image' ? (
                        <>
                          <Image size={12} />
                          Image
                        </>
                      ) : (
                        <>
                          <Video size={12} />
                          Video
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Info & Actions */}
                <div className="p-4">
                  <div className="text-sm text-gray-500 mb-3 flex items-center justify-between">
                    <span>{formatDate(draft.timestamp)}</span>
                    {draft.type === 'video' && draft.duration && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        ⏱️ {formatDuration(draft.duration)}
                      </span>
                    )}
                  </div>

                  {/* Video details */}
                  {draft.type === 'video' && (
                    <div className="mb-3 text-xs text-gray-600 space-y-1">
                      {draft.text_overlays && draft.text_overlays.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Text:</span>
                          <span>{draft.text_overlays.length} overlay(s)</span>
                        </div>
                      )}
                      {draft.filters && Object.keys(draft.filters).length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Filters:</span>
                          <span>Applied</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadDraft(draft)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => deleteDraft(draft.id, draft.storage_path)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all shadow-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}