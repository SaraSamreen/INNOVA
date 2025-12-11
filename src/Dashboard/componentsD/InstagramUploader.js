import { useState, useEffect } from "react";
import { Upload, Calendar, Send, Trash2, Clock, CheckCircle, XCircle, AlertCircle, Sparkles, Hash, Wand2, Info } from "lucide-react";

const InstagramUploader = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [caption, setCaption] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState("immediate");
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [useHashtags, setUseHashtags] = useState(true);
  const [generatingHashtags, setGeneratingHashtags] = useState(false);
  const [seoPreview, setSeoPreview] = useState(null);

  const getAuthToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('authToken');
  };

  const fetchScheduledPosts = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/instagram/scheduled', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setScheduledPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
    }
  };

  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setMessage({ type: '', text: '' });
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleGenerateHashtags = async () => {
    if (!caption) {
      showMessage('error', 'Please enter a caption first');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      showMessage('error', 'Please login first');
      return;
    }

    setGeneratingHashtags(true);

    try {
      const response = await fetch('http://localhost:5000/api/instagram/generate-hashtags', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          caption,
          imageDescription,
          count: 30
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSeoPreview(data);
        if (data.usingFallback) {
          showMessage('info', `⚠️ Using smart fallback: ${data.fallbackReason || 'AI service unavailable'}`);
        } else {
          showMessage('success', '✨ AI-powered SEO hashtags generated!');
        }
      } else {
        showMessage('error', data.message || 'Failed to generate hashtags');
      }
    } catch (error) {
      console.error('Generate hashtags error:', error);
      showMessage('error', 'Network error');
    } finally {
      setGeneratingHashtags(false);
    }
  };

  const handleApplySEO = () => {
    if (seoPreview) {
      setCaption(`${seoPreview.enhancedCaption}\n\n${seoPreview.allHashtags}`);
      setSeoPreview(null);
      showMessage('success', 'SEO caption applied!');
    }
  };

  const handleUploadNow = async () => {
    if (!image) {
      showMessage('error', 'Please select an image');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      showMessage('error', 'Please login first');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('caption', caption);
      formData.append('useHashtags', useHashtags);
      formData.append('imageDescription', imageDescription);

      const response = await fetch('http://localhost:5000/api/instagram/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showMessage('success', '🎉 Posted to Instagram successfully!');
        resetForm();
      } else {
        showMessage('error', data.message || 'Failed to post to Instagram');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showMessage('error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!image || !scheduleTime) {
      showMessage('error', 'Please select an image and schedule time');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      showMessage('error', 'Please login first');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('caption', caption);
      formData.append('scheduleTime', scheduleTime);
      formData.append('useHashtags', useHashtags);
      formData.append('imageDescription', imageDescription);

      const response = await fetch('http://localhost:5000/api/instagram/schedule', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showMessage('success', '📅 Post scheduled successfully!');
        resetForm();
        fetchScheduledPosts();
      } else {
        showMessage('error', data.message || 'Failed to schedule post');
      }
    } catch (error) {
      console.error('Schedule error:', error);
      showMessage('error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScheduled = async (postId) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/instagram/scheduled/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showMessage('success', 'Scheduled post deleted');
        fetchScheduledPosts();
      }
    } catch (error) {
      console.error('Delete error:', error);
      showMessage('error', 'Failed to delete post');
    }
  };

  const resetForm = () => {
    setImage(null);
    setImagePreview("");
    setCaption("");
    setImageDescription("");
    setScheduleTime("");
    setSeoPreview(null);
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "scheduled":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "posted":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {message.text && (
          <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-100 text-green-800' :
            message.type === 'error' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {message.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {message.type === 'info' && <Info className="w-5 h-5" />}
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Instagram Publisher</h1>
              <p className="text-gray-600">Upload now or schedule for later • SEO-optimized</p>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setUploadMode("immediate")}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                uploadMode === "immediate"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Send className="w-5 h-5 inline mr-2" />
              Post Now
            </button>
            <button
              onClick={() => setUploadMode("schedule")}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                uploadMode === "schedule"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Calendar className="w-5 h-5 inline mr-2" />
              Schedule Post
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors mb-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setImage(null);
                        setImagePreview("");
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">Click to upload image</p>
                    <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Image Description (helps generate better hashtags)
                </label>
                <input
                  type="text"
                  value={imageDescription}
                  onChange={(e) => setImageDescription(e.target.value)}
                  placeholder="e.g., Beach sunset, Product photo, Fashion shoot..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Caption
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write your caption..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows="4"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="useHashtags"
                    checked={useHashtags}
                    onChange={(e) => setUseHashtags(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="useHashtags" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Auto-generate SEO hashtags
                  </label>
                </div>
                <button
                  onClick={handleGenerateHashtags}
                  disabled={generatingHashtags || !caption}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold hover:shadow-md transition-all disabled:opacity-50"
                >
                  {generatingHashtags ? (
                    'Generating...'
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 inline mr-1" />
                      Preview SEO
                    </>
                  )}
                </button>
              </div>

              {seoPreview && (
                <div className={`p-4 border-2 rounded-xl ${
                  seoPreview.usingFallback 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-bold flex items-center gap-2 ${
                      seoPreview.usingFallback ? 'text-yellow-800' : 'text-green-800'
                    }`}>
                      <Hash className="w-4 h-4" />
                      {seoPreview.usingFallback ? 'Smart Fallback Hashtags' : 'AI-Powered SEO Hashtags'}
                    </h4>
                    <button
                      onClick={handleApplySEO}
                      className={`px-3 py-1 text-white rounded-lg text-sm font-semibold ${
                        seoPreview.usingFallback 
                          ? 'bg-yellow-600 hover:bg-yellow-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      Apply
                    </button>
                  </div>
                  
                  {seoPreview.usingFallback && (
                    <div className="mb-2 p-2 bg-yellow-100 rounded text-xs text-yellow-800 flex items-center gap-2">
                      <Info className="w-3 h-3" />
                      <span>{seoPreview.fallbackReason}</span>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-700 max-h-32 overflow-y-auto">
                    <p className="mb-2">{seoPreview.enhancedCaption}</p>
                    <p className="text-blue-600">{seoPreview.allHashtags}</p>
                  </div>
                  <div className="mt-2 flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                      High: {seoPreview.hashtags.high.length}
                    </span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                      Medium: {seoPreview.hashtags.medium.length}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                      Low: {seoPreview.hashtags.low.length}
                    </span>
                  </div>
                </div>
              )}

              {uploadMode === "schedule" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Schedule Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    min={getMinDateTime()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}

              <button
                onClick={uploadMode === "immediate" ? handleUploadNow : handleSchedule}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  "Processing..."
                ) : uploadMode === "immediate" ? (
                  <>
                    <Send className="w-5 h-5 inline mr-2" />
                    Post to Instagram
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5 inline mr-2" />
                    Schedule Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {scheduledPosts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-purple-500" />
              Scheduled Posts
            </h2>
            <div className="space-y-4">
              {scheduledPosts.map((post) => (
                <div
                  key={post._id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={post.imageUrl}
                    alt="Scheduled"
                    className="w-20 h-20 object-cover rounded-lg shadow-md"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 line-clamp-1">
                      {post.caption || "No caption"}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      {getStatusIcon(post.status)}
                      <span className="capitalize">{post.status}</span>
                      <span>•</span>
                      <span>{formatDateTime(post.scheduleTime)}</span>
                    </div>
                  </div>
                  {post.status === "scheduled" && (
                    <button
                      onClick={() => handleDeleteScheduled(post._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstagramUploader;