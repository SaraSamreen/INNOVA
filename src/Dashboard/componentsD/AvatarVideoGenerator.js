import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api/ai";

const FALLBACK_AVATARS = [
  { avatar_id: "Angela-inTshirt-20220820", avatar_name: "Angela", preview_image_url: "https://files2.heygen.ai/avatar/v3/Angela-inTshirt-20220820/preview.webp", gender: "female" },
  { avatar_id: "josh-lite3-20230714", avatar_name: "Josh", preview_image_url: "https://files2.heygen.ai/avatar/v3/josh-lite3-20230714/preview.webp", gender: "male" },
];

const FALLBACK_VOICES = [
  { voice_id: "1bd001e7e50f421d891986aad5158bc8", name: "Sara (Female)", language: "English", gender: "female" },
  { voice_id: "eb4badba85fe4eb290bc37aa3ccf6e13", name: "Paul (Male)", language: "English", gender: "male" },
];

export default function AvatarVideoGenerator() {
  const [step, setStep] = useState(1);
  const [inputMethod, setInputMethod] = useState("script");
  
  const [productInfo, setProductInfo] = useState({ name: "", features: "", benefits: "", targetAudience: "" });
  const [script, setScript] = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  
  const [avatars, setAvatars] = useState(FALLBACK_AVATARS);
  const [voices, setVoices] = useState(FALLBACK_VOICES);
  const [selectedAvatar, setSelectedAvatar] = useState(FALLBACK_AVATARS[0]);
  const [selectedVoice, setSelectedVoice] = useState(FALLBACK_VOICES[0]);
  const [loadingAvatars, setLoadingAvatars] = useState(true);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const [videoId, setVideoId] = useState(null);
  
  // Social media states
  const [uploadingTo, setUploadingTo] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingAvatars(true);
      try {
        const avatarRes = await axios.get(API_BASE + "/heygen-avatars");
        if (avatarRes.data && avatarRes.data.avatars && avatarRes.data.avatars.length > 0) {
          setAvatars(avatarRes.data.avatars);
          setSelectedAvatar(avatarRes.data.avatars[0]);
        }
      } catch (err) {
        console.log("Using fallback avatars");
      }

      try {
        const voiceRes = await axios.get(API_BASE + "/heygen-voices");
        if (voiceRes.data && voiceRes.data.voices && voiceRes.data.voices.length > 0) {
          setVoices(voiceRes.data.voices);
          setSelectedVoice(voiceRes.data.voices[0]);
        }
      } catch (err) {
        console.log("Using fallback voices");
      }
      setLoadingAvatars(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!videoId || !isGenerating) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE}/video-status/${videoId}`);
        const data = res.data;

        if (data.status === 'completed' && data.videoUrl) {
          setVideoUrl(data.videoUrl);
          setProgress(100);
          setProgressMsg("Video ready!");
          setIsGenerating(false);
          clearInterval(pollInterval);
        } else if (data.status === 'failed') {
          setError(data.error || 'Video generation failed');
          setIsGenerating(false);
          clearInterval(pollInterval);
        } else {
          setProgressMsg(data.message || 'Generating video...');
          setProgress(prev => {
            if (prev < 90) return prev + 2;
            return prev;
          });
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Video not found. Please try again.');
          setIsGenerating(false);
          clearInterval(pollInterval);
        }
      }
    }, 3000);

    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      if (isGenerating) {
        setError('Video generation is taking longer than expected. Please check back later or try again.');
        setIsGenerating(false);
      }
    }, 600000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [videoId, isGenerating]);

  const generateScript = async () => {
    const trimmedName = productInfo.name.trim();
    if (!trimmedName) {
      setError("Please enter product name");
      return;
    }
    setIsGeneratingScript(true);
    setError(null);

    try {
      const res = await axios.post(API_BASE + "/generate-marketing-script", {
        productName: trimmedName,
        features: productInfo.features.trim(),
        benefits: productInfo.benefits.trim(),
        targetAudience: productInfo.targetAudience.trim(),
      });
      setScript(res.data.script);
      setInputMethod("script");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate script");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const generateVideo = async () => {
    if (!script.trim()) {
      setError("Please enter a script");
      return;
    }

    const words = script.split(/\s+/).filter(Boolean);
    if (words.length > 150) {
      setError("Script too long! Keep under 150 words for free tier.");
      return;
    }

    setIsGenerating(true);
    setProgress(10);
    setProgressMsg("Starting video generation...");
    setError(null);
    setVideoUrl(null);
    setVideoId(null);

    try {
      setProgressMsg("Sending to HeyGen API...");
      setProgress(20);

      const res = await axios.post(API_BASE + "/generate-avatar-video", {
        script: script,
        avatarId: selectedAvatar.avatar_id,
        voiceId: selectedVoice.voice_id,
      });

      if (res.data.videoId) {
        setVideoId(res.data.videoId);
        setProgress(30);
        setProgressMsg("Video generation started! Waiting for HeyGen...");
      } else {
        throw new Error('No video ID returned');
      }

    } catch (err) {
      setError(err.response?.data?.details || err.response?.data?.error || "Failed to generate video");
      setIsGenerating(false);
    }
  };

  const uploadToSocialMedia = async (platform) => {
    if (!videoUrl) return;
    
    setUploadingTo(platform);
    setUploadSuccess(null);
    setError(null);

    try {
      const res = await axios.post(`${API_BASE}/upload-to-social`, {
        videoUrl: videoUrl,
        platform: platform,
        caption: script.substring(0, 280) + "\n\n🎬 Created with AI Avatar Generator",
        productName: productInfo.name || "AI Generated Video"
      });

      if (res.data.success) {
        setUploadSuccess(`✅ Successfully shared to ${platform}!`);
        if (res.data.postUrl) {
          setTimeout(() => {
            window.open(res.data.postUrl, '_blank');
          }, 1000);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || `Failed to upload to ${platform}. ${err.response?.data?.message || ''}`);
    } finally {
      setUploadingTo(null);
    }
  };

  const copyLink = () => {
    if (videoUrl) {
      navigator.clipboard.writeText(videoUrl);
      setUploadSuccess("📋 Video link copied!");
      setTimeout(() => setUploadSuccess(null), 2000);
    }
  };

  const wordCount = script.split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
            AI Avatar Video Generator
          </h1>
          <p className="text-gray-600 mt-2">Create marketing videos with HeyGen AI avatars</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            {["Script", "Avatar", "Generate"].map((label, i) => (
              <React.Fragment key={i}>
                <div
                  onClick={() => { if (i + 1 < step) setStep(i + 1); }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold cursor-pointer transition ${
                    step >= i + 1 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i + 1}
                </div>
                {i < 2 && <div className={`w-8 h-1 ${step > i + 1 ? "bg-purple-600" : "bg-gray-200"}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* STEP 1: Script */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Step 1: Create Your Script</h2>

            <div className="flex gap-3 mb-5">
              <button
                onClick={() => setInputMethod("script")}
                className={`flex-1 py-2.5 rounded-xl font-medium transition ${
                  inputMethod === "script" ? "bg-purple-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Write Script
              </button>
              <button
                onClick={() => setInputMethod("product")}
                className={`flex-1 py-2.5 rounded-xl font-medium transition ${
                  inputMethod === "product" ? "bg-purple-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                From Product
              </button>
            </div>

            {inputMethod === "script" ? (
              <div>
                <textarea
                  placeholder="Enter your marketing script here... (Keep under 150 words for free tier)"
                  className="w-full h-44 p-4 border-2 border-purple-200 rounded-xl focus:border-purple-500 outline-none resize-none text-gray-700"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                />
                <p className={`text-sm mt-2 ${wordCount > 150 ? "text-red-500" : "text-gray-500"}`}>
                  Word count: {wordCount}/150 {wordCount > 150 && "(too long!)"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Product Name *"
                    className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 outline-none"
                    value={productInfo.name}
                    onChange={(e) => setProductInfo({ ...productInfo, name: e.target.value })}
                    onBlur={(e) => setProductInfo({ ...productInfo, name: e.target.value.trim() })}
                  />
                </div>
                <textarea
                  placeholder="Key Features (optional)"
                  className="w-full h-20 p-3 border-2 border-purple-200 rounded-xl outline-none resize-none"
                  value={productInfo.features}
                  onChange={(e) => setProductInfo({ ...productInfo, features: e.target.value })}
                />
                <textarea
                  placeholder="Benefits (optional)"
                  className="w-full h-20 p-3 border-2 border-purple-200 rounded-xl outline-none resize-none"
                  value={productInfo.benefits}
                  onChange={(e) => setProductInfo({ ...productInfo, benefits: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Target Audience (optional)"
                  className="w-full p-3 border-2 border-purple-200 rounded-xl outline-none"
                  value={productInfo.targetAudience}
                  onChange={(e) => setProductInfo({ ...productInfo, targetAudience: e.target.value })}
                />
                <button
                  onClick={generateScript}
                  disabled={isGeneratingScript || !productInfo.name || productInfo.name.trim().length === 0}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-xl disabled:opacity-50 hover:opacity-90 transition"
                >
                  {isGeneratingScript ? "⏳ Generating..." : "✨ Generate Script with AI"}
                </button>
                {script && (
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <h4 className="font-bold text-green-800 mb-2">Generated Script:</h4>
                    <textarea
                      className="w-full h-28 p-3 border rounded-lg"
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                    />
                    <p className="text-sm text-gray-500 mt-1">Words: {wordCount}</p>
                  </div>
                )}
              </div>
            )}

            {error && <p className="text-red-500 mt-3 p-3 bg-red-50 rounded-lg">{error}</p>}

            <button
              onClick={() => { setError(null); setStep(2); }}
              disabled={!script.trim() || wordCount > 150}
              className="w-full mt-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl disabled:opacity-50"
            >
              Next: Choose Avatar
            </button>
          </div>
        )}

        {/* STEP 2: Avatar & Voice */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Step 2: Choose Avatar & Voice</h2>

            {loadingAvatars ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Loading avatars...</p>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Select Avatar:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {avatars.map((avatar) => (
                    <div
                      key={avatar.avatar_id}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`cursor-pointer rounded-xl p-2 transition border-2 ${
                        selectedAvatar?.avatar_id === avatar.avatar_id
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      <div className="w-full h-28 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={avatar.preview_image_url}
                          alt={avatar.avatar_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://via.placeholder.com/150x150?text=${avatar.avatar_name}`;
                          }}
                        />
                      </div>
                      <p className="text-center text-sm font-medium mt-1 truncate">{avatar.avatar_name}</p>
                    </div>
                  ))}
                </div>

                <h3 className="font-semibold text-gray-700 mb-3">Select Voice:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
                  {voices.map((voice) => (
                    <button
                      key={voice.voice_id}
                      onClick={() => setSelectedVoice(voice)}
                      className={`p-3 rounded-xl text-sm font-medium transition text-left ${
                        selectedVoice?.voice_id === voice.voice_id
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {voice.name}
                      <span className="block text-xs opacity-70">{voice.gender}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 bg-gray-200 rounded-xl font-bold">
                Back
              </button>
              <button 
                onClick={() => setStep(3)} 
                disabled={!selectedAvatar || !selectedVoice}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold disabled:opacity-50"
              >
                Next: Generate
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Generate */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Step 3: Generate Video</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-bold text-gray-700 mb-2">Script Preview:</h4>
                <p className="text-gray-600 text-sm">{script.length > 200 ? script.substring(0, 200) + "..." : script}</p>
                <p className="text-xs text-gray-400 mt-1">{wordCount} words</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                  <img
                    src={selectedAvatar?.preview_image_url}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/64"; }}
                  />
                </div>
                <div>
                  <p className="font-bold">{selectedAvatar?.avatar_name}</p>
                  <p className="text-sm text-gray-500">{selectedVoice?.name}</p>
                </div>
              </div>
            </div>

            {!videoUrl && !isGenerating && (
              <button
                onClick={generateVideo}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg rounded-xl hover:opacity-90"
              >
                🎬 Generate Avatar Video
              </button>
            )}

            {isGenerating && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-gray-600 mt-2 font-medium">{progressMsg}</p>
                <p className="text-center text-xs text-gray-400 mt-1">
                  ⏱️ This usually takes 2-5 minutes... Please be patient!
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 font-medium">❌ Error:</p>
                <p className="text-red-500 text-sm mt-1">{error}</p>
                <button
                  onClick={() => { setError(null); generateVideo(); }}
                  className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
                >
                  🔄 Try Again
                </button>
              </div>
            )}

            {videoUrl && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-green-700 mb-3">✅ Your Video is Ready!</h3>
                <video src={videoUrl} controls className="w-full rounded-xl shadow-lg mb-4" />
                
                {uploadSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-center font-medium">
                    {uploadSuccess}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <a
                    href={videoUrl}
                    download="avatar-video.mp4"
                    className="py-3 bg-blue-600 text-white font-bold rounded-xl text-center hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <span>⬇️</span> Download
                  </a>
                  <button
                    onClick={copyLink}
                    className="py-3 bg-gray-600 text-white font-bold rounded-xl hover:bg-gray-700 flex items-center justify-center gap-2"
                  >
                    <span>📋</span> Copy Link
                  </button>
                </div>

                <div className="border-t pt-4 mb-4">
                  <h4 className="font-bold text-gray-700 mb-3 text-center">Share to Social Media</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => uploadToSocialMedia('twitter')}
                      disabled={uploadingTo !== null}
                      className="py-3 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-600 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {uploadingTo === 'twitter' ? (
                        <>⏳ Posting...</>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                          Twitter/X
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => uploadToSocialMedia('linkedin')}
                      disabled={uploadingTo !== null}
                      className="py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {uploadingTo === 'linkedin' ? (
                        <>⏳ Posting...</>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                          LinkedIn
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    📱 One-click sharing to your social media accounts
                  </p>
                </div>

                <button
                  onClick={() => { setVideoUrl(null); setError(null); setStep(1); setScript(""); setVideoId(null); setUploadSuccess(null); }}
                  className="w-full py-3 bg-gray-200 font-bold rounded-xl hover:bg-gray-300"
                >
                  ✨ Create New Video
                </button>
              </div>
            )}

            {!videoUrl && !isGenerating && (
              <button onClick={() => setStep(2)} className="w-full mt-3 py-3 bg-gray-200 rounded-xl font-bold">
                ← Back
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}