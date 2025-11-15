import React, { useState } from "react";
import "../../Styles/Createvidpg3.css";

export default function UnifiedCreateVideo() {
  const [inputText, setInputText] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [background, setBackground] = useState("");
  const [videoType, setVideoType] = useState("");
  const [loading, setLoading] = useState(false);

  // Video generation loading + url
  const [videoUrl, setVideoUrl] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);

  const API_BASE = "http://localhost:5002";

  const avatars = [
    { id: "avatar1", img: "/avatar/avatar1.jpg" },
    { id: "avatar2", img: "/avatar/avatar2.jpg" },
    { id: "avatar3", img: "/avatar/avatar3.jpg" },
    { id: "avatar4", img: "/avatar/avatar4.jpg" },
  ];

  const backgrounds = ["studio", "office", "nature", "portrait", "abstract"];
  const videoTypes = [
    "product-ad",
    "service-promo",
    "brand-awareness",
    "social-reel",
  ];

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);
    setCharCount(text.length);
  };

  // Directly generate video using user input text
  const generateVideo = async () => {
    if (!inputText.trim() || !selectedAvatar || !background || !videoType) {
      alert(
        "Please select Avatar, Background, Video Type, and provide a video idea."
      );
      return;
    }

    setVideoLoading(true);
    setVideoUrl("");

    try {
      const res = await fetch(`${API_BASE}/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          avatar_id: selectedAvatar,
          background,
          videoType,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setVideoUrl(data.video_url);
      } else {
        alert("Video generation failed: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      alert("Error generating video: " + error.message);
    } finally {
      setVideoLoading(false);
    }
  };

  const moveToStep2 = () => {
    if (!selectedAvatar || !background || !videoType) {
      alert("Please select Avatar, Background, and Video Type.");
      return;
    }
    if (!videoUrl) {
      alert("Please generate the video first before proceeding.");
      return;
    }
  
    // Pass data via URL params instead of localStorage
    const params = new URLSearchParams({
      inputText,
      avatar: selectedAvatar,
      background,
      videoType,
      videoUrl
    });
    
    window.location.href = `/create/step2?${params.toString()}`;
  };

  return (
    <div className="avatar-page">
      {/* Left Panel */}
      <div className="left-panel">
        <h1 className="title">Create Your AI Avatar Video</h1>

        <div className="avatar-form">
          {/* Avatar Selection */}
          <div className="cv1-group">
            <label className="cv1-label">Select Your Avatar</label>
            <div className="avatar-grid">
              {avatars.map((avatar) => (
                <img
                  key={avatar.id}
                  src={avatar.img}
                  alt={avatar.id}
                  className={`avatar-thumb ${
                    selectedAvatar === avatar.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedAvatar(avatar.id)}
                />
              ))}
            </div>
          </div>

          {/* Background Selection */}
          <div className="cv1-group">
            <label className="cv1-label" htmlFor="bg-select">
              Select Background
            </label>
            <select
              id="bg-select"
              className="cv1-select"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
            >
              <option value="">Choose Background</option>
              {backgrounds.map((bg) => (
                <option key={bg} value={bg}>
                  {bg.charAt(0).toUpperCase() + bg.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Video Type */}
          <div className="cv1-group">
            <label className="cv1-label">Ad Reel Type</label>
            <div className="cv1-pills">
              {videoTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`cv1-pill ${videoType === type ? "is-active" : ""}`}
                  onClick={() => setVideoType(type)}
                >
                  {type.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          {/* Video Idea Input */}
          <div className="cv1-group">
            <label className="cv1-label" htmlFor="script-input">
              Describe Your Video Idea
            </label>
            <textarea
              id="script-input"
              className="input-textarea"
              value={inputText}
              onChange={handleInputChange}
              placeholder="e.g., Promote eco-friendly shoes for Gen Z audience..."
              maxLength={32000}
              rows={6}
            />
            <div className="char-counter">{charCount}/32000</div>
          </div>

          {/* Generate Video Button */}
          <button
            className="generate-btn"
            onClick={generateVideo}
            disabled={videoLoading || loading}
          >
            {videoLoading ? "Generating Video..." : "Generate Video"}
          </button>

          {/* Generate Final Ad */}
          <button className="next-btn" onClick={moveToStep2}>
            Generate Ad
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        {/* Display Selected Avatar Full Size */}
        {selectedAvatar ? (
          <div className="selected-avatar-full">
            <img
              src={avatars.find((a) => a.id === selectedAvatar)?.img}
              alt="Selected Avatar"
              className="full-avatar-image"
            />
          </div>
        ) : (
          <div className="no-avatar-msg">
            <p>Select an avatar to preview it here.</p>
          </div>
        )}

        {/* Video Preview */}
        {videoUrl ? (
          <div className="video-preview" style={{ marginTop: 20 }}>
            <h2 className="subtitle">Video Preview</h2>
            <video
              src={videoUrl}
              controls
              autoPlay
              muted
              style={{ maxWidth: "100%", borderRadius: 10 }}
            />
          </div>
        ) : (
          <div className="empty-state">
            <p className="status-text">Generate your video to preview it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}