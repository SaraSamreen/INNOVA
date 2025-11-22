import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Download, Trash2, ArrowLeft, Video, Image as ImageIcon, Play } from "lucide-react";

export default function Drafts() {
  const location = useLocation();
  const [imageDrafts, setImageDrafts] = useState([]);
  const [videoDrafts, setVideoDrafts] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Load existing image drafts
    const savedImageDrafts = JSON.parse(localStorage.getItem("productDrafts") || "[]");
    
    // Load existing video drafts
    const savedVideoDrafts = JSON.parse(localStorage.getItem("videoDrafts") || "[]");
    
    // If there's a new image draft from navigation state
    if (location.state?.newDraft) {
      const newImageDrafts = [location.state.newDraft, ...savedImageDrafts];
      setImageDrafts(newImageDrafts);
      localStorage.setItem("productDrafts", JSON.stringify(newImageDrafts));
    } else {
      setImageDrafts(savedImageDrafts);
    }

    // If there's a new video draft from navigation state
    if (location.state?.newVideoDraft) {
      const newVideoDrafts = [location.state.newVideoDraft, ...savedVideoDrafts];
      setVideoDrafts(newVideoDrafts);
      localStorage.setItem("videoDrafts", JSON.stringify(newVideoDrafts));
    } else {
      setVideoDrafts(savedVideoDrafts);
    }
    
    // Clear navigation state
    if (location.state?.newDraft || location.state?.newVideoDraft) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const deleteImageDraft = (timestamp) => {
    const updated = imageDrafts.filter((draft) => draft.timestamp !== timestamp);
    setImageDrafts(updated);
    localStorage.setItem("productDrafts", JSON.stringify(updated));
  };

  const deleteVideoDraft = (timestamp) => {
    const updated = videoDrafts.filter((draft) => draft.timestamp !== timestamp);
    setVideoDrafts(updated);
    localStorage.setItem("videoDrafts", JSON.stringify(updated));
  };

  const downloadImageDraft = (draft) => {
    const link = document.createElement("a");
    link.href = draft.image;
    link.download = `draft-${draft.timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadVideoDraft = (draft) => {
    window.open(draft.videoUrl, '_blank');
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

  const totalDrafts = imageDrafts.length + videoDrafts.length;
  const allDrafts = [
    ...imageDrafts.map(d => ({ ...d, type: 'image' })),
    ...videoDrafts.map(d => ({ ...d, type: 'video' }))
  ].sort((a, b) => b.timestamp - a.timestamp);

  const filteredDrafts = activeTab === 'all' 
    ? allDrafts 
    : activeTab === 'images' 
    ? allDrafts.filter(d => d.type === 'image')
    : allDrafts.filter(d => d.type === 'video');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4 no-underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Drafts</h1>
              <p className="text-gray-600 mt-1">
                {totalDrafts} {totalDrafts === 1 ? "draft" : "drafts"} saved
              </p>
            </div>
          </div>

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
              <ImageIcon size={16} />
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
                key={draft.timestamp}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
              >
                {/* Preview */}
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative group">
                  {draft.type === 'image' ? (
                    <img
                      src={draft.image}
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
                          <ImageIcon size={12} />
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
                      {draft.textOverlays && draft.textOverlays.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Text:</span>
                          <span>{draft.textOverlays.length} overlay(s)</span>
                        </div>
                      )}
                      {draft.filters && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Filters:</span>
                          <span>Applied</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => 
                        draft.type === 'image' 
                          ? downloadImageDraft(draft) 
                          : downloadVideoDraft(draft)
                      }
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => 
                        draft.type === 'image' 
                          ? deleteImageDraft(draft.timestamp) 
                          : deleteVideoDraft(draft.timestamp)
                      }
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