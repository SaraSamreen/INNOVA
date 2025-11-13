"use client";

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../Styles/Createvidpg4.css";

export default function Createvidpg4() {
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatars, setAvatars] = useState([]);
  const [loadingAvatars, setLoadingAvatars] = useState(true);
  const [script, setScript] = useState("");
  const [voice, setVoice] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  // Load avatars
  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const res = await fetch("http://localhost:5002/ready-avatars");
        const data = await res.json();
        if (data.success && data.avatars) setAvatars(data.avatars);
      } catch (err) {
        console.error(err);
        alert("Failed to load avatars.");
      } finally {
        setLoadingAvatars(false);
      }
    };
    fetchAvatars();
  }, []);

  // Load Step1 + Step2
  useEffect(() => {
    const storedPayload = JSON.parse(localStorage.getItem("create_video_payload")) || {};
    const storedVoice = JSON.parse(localStorage.getItem("selectedVoice")) || null;

    if (location.state) {
      setScript(location.state.script || storedPayload.script || "");
      setVoice(location.state.selectedVoice || storedVoice);
    } else {
      setScript(storedPayload.script || "");
      setVoice(storedVoice);
    }
  }, [location.state]);

  // Voice preview
  const playVoice = () => {
    if (!voice || !script) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = voice.rate || 1;
    utterance.pitch = voice.pitch || 1;
    utterance.lang = voice.lang || "en-US";
    window.speechSynthesis.speak(utterance);
  };

  // Generate video
  const handleCreateVideo = async () => {
    if (selectedAvatar === null) return alert("Select an avatar!");
    if (!script) return alert("No script available.");

    const avatarData = avatars[selectedAvatar];
    setIsGenerating(true);
    setVideoUrl(null);
    setAudioUrl(null);

    try {
      const res = await fetch("http://localhost:5002/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: script, avatar_id: avatarData.id, use_ready_avatar: true }),
      });
      if (!res.ok) throw new Error(`Backend error: ${res.status}`);
      const result = await res.json();
      if (result.video_url) setVideoUrl(result.video_url);
      if (result.audio_url) setAudioUrl(result.audio_url);
      alert("Video generated!");
    } catch (err) {
      console.error(err);
      alert(`Video generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save draft
  const handleSaveDraft = () => {
    if (!videoUrl) return alert("Generate video first!");
    const drafts = JSON.parse(localStorage.getItem("video_drafts")) || [];
    drafts.push({ videoUrl, audioUrl, script, voice, avatar: avatars[selectedAvatar] });
    localStorage.setItem("video_drafts", JSON.stringify(drafts));
    alert("Saved to drafts!");
  };

  // Download video
  const handleDownload = () => {
    if (!videoUrl) return alert("Generate video first!");
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = "my_video.mp4";
    a.click();
  };

  // Post to Facebook
  const handlePostFacebook = async () => {
    if (!videoUrl) return alert("Generate video first!");
    const accessToken = prompt("Enter your Facebook Page Access Token"); // for testing
    if (!accessToken) return;

    try {
      const form = new FormData();
      form.append("file_url", videoUrl);
      form.append("description", "My AI-generated Ad Video");
      form.append("access_token", accessToken);

      const pageId = prompt("Enter your Facebook Page ID"); // for testing
      const res = await fetch(`https://graph.facebook.com/v17.0/${pageId}/videos`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (data.id) alert("Posted to Facebook successfully!");
      else alert("Facebook post failed: " + JSON.stringify(data));
    } catch (err) {
      console.error(err);
      alert("Failed to post on Facebook");
    }
  };

  return (
    <div className="cv3-container">
      <div className="cv3-left">
        <h2 className="cv3-heading">Choose an avatar</h2>
        {loadingAvatars ? <p>Loading...</p> : avatars.length === 0 ? <p>No avatars found.</p> : (
          <div className="cv3-avatars">
            {avatars.map((avatar, idx) => (
              <div key={avatar.id} className={`cv3-avatar-card ${selectedAvatar === idx ? "active" : ""}`} onClick={() => setSelectedAvatar(idx)}>
                <img src={`http://localhost:5002${avatar.url}`} alt={avatar.name} onError={e => e.target.src="/fallback-avatar.png"} />
                <div>{avatar.name}</div>
              </div>
            ))}
          </div>
        )}

        <div className="cv3-box"><label>Script</label><div>{script || "No script."}</div></div>
        <div className="cv3-box"><label>Voice</label><div>{voice?.name || "None"}</div>{voice && <button onClick={playVoice}>🔊 Preview</button>}</div>

        <button onClick={handleCreateVideo} disabled={isGenerating}>{isGenerating ? "⏳ Generating..." : "🎬 Create Video"}</button>

        {(videoUrl || audioUrl) && (
          <div className="cv3-box">
            {audioUrl && <audio controls src={audioUrl}></audio>}
            {videoUrl && <video controls src={videoUrl}></video>}
          </div>
        )}

        <div className="cv3-actions">
          <button onClick={handleSaveDraft} disabled={!videoUrl}>💾 Save Draft</button>
          <button onClick={handleDownload} disabled={!videoUrl}>⬇ Download</button>
          <button onClick={handlePostFacebook} disabled={!videoUrl}>📣 Post to Facebook</button>
        </div>
      </div>

      <div className="cv3-right">
        <h2 className="cv3-heading">Preview</h2>
        <div className="cv3-preview">
          {selectedAvatar !== null && avatars[selectedAvatar] ? (
            <img src={`http://localhost:5002${avatars[selectedAvatar].url}`} alt={avatars[selectedAvatar].name} />
          ) : <p>Select an avatar to preview</p>}
        </div>
      </div>
    </div>
  );
}
