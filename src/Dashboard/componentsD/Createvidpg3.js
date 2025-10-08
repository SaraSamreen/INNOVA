"use client"

import React, { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import "../../Styles/Createvidpg3.css"

export default function Createvidpg3() {
  const location = useLocation()
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [avatars, setAvatars] = useState([])
  const [loadingAvatars, setLoadingAvatars] = useState(true)
  const [script, setScript] = useState("")
  const [voice, setVoice] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [videoUrl, setVideoUrl] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)

  // Load ready avatars from backend
  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const response = await fetch("http://localhost:5001/ready-avatars")
        const data = await response.json()
        
        if (data.success && data.avatars) {
          setAvatars(data.avatars)
          console.log("✅ Loaded avatars:", data.avatars)
        } else {
          console.error("❌ Failed to load avatars:", data)
        }
      } catch (error) {
        console.error("❌ Error fetching avatars:", error)
        alert("Failed to load avatars. Make sure backend is running on http://localhost:5001")
      } finally {
        setLoadingAvatars(false)
      }
    }

    fetchAvatars()
  }, [])

  // Load script and voice from location.state or localStorage
  useEffect(() => {
    if (location.state) {
      if (location.state.script) setScript(location.state.script)
      if (location.state.selectedVoice) setVoice(location.state.selectedVoice)
    } else {
      const storedScript = localStorage.getItem("script")
      if (storedScript) setScript(JSON.parse(storedScript))
      const storedVoice = localStorage.getItem("selectedVoice")
      if (storedVoice) setVoice(JSON.parse(storedVoice))
    }
  }, [location.state])

  // Play voice preview with script
  const playVoice = () => {
    if (!voice || !script) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(script)
    utterance.rate = voice.rate || 1
    utterance.pitch = voice.pitch || 1
    utterance.lang = voice.lang || "en-US"
    window.speechSynthesis.speak(utterance)
  }

  // Generate video with backend
  const handleCreateVideo = async () => {
    if (selectedAvatar === null) {
      return alert("Please select an avatar first!")
    }
    if (!script) {
      return alert("No script available. Go back to Step 1 to generate a script.")
    }

    const selectedAvatarData = avatars[selectedAvatar]
    
    setIsGenerating(true)
    setVideoUrl(null)
    setAudioUrl(null)

    try {
      console.log("🎬 Generating video with:")
      console.log("  Avatar:", selectedAvatarData.name)
      console.log("  Script:", script.substring(0, 50) + "...")

      // Call backend /speak endpoint
      const response = await fetch("http://localhost:5001/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: script,
          avatar_id: selectedAvatarData.id,
          use_ready_avatar: true
        }),
      })

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`)
      }

      const result = await response.json()
      console.log("✅ Video generation result:", result)

      if (result.audio_url) {
        const fullAudioUrl = `http://localhost:5001${result.audio_url}`
        setAudioUrl(fullAudioUrl)
        console.log("🎤 Audio URL:", fullAudioUrl)
      }

      if (result.lipsync_url) {
        const fullVideoUrl = `http://localhost:5001${result.lipsync_url}`
        setVideoUrl(fullVideoUrl)
        console.log("🎬 Video URL:", fullVideoUrl)
        alert("Video generated successfully! Check the preview below.")
      } else if (result.audio_url) {
        alert("Audio generated! (Lip-sync video not available - Wav2Lip may not be installed)")
      } else {
        alert("Generation completed but no media URLs returned.")
      }

    } catch (err) {
      console.error("❌ Video generation failed:", err)
      alert(`Video generation failed: ${err.message}\n\nMake sure the backend is running on http://localhost:5001`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateBackground = () => {
    alert("Background generation coming soon! This will use AI to generate custom backgrounds.")
  }

  const handleRecreateBackground = () => {
    alert("Background recreation coming soon! This will allow you to regenerate the background.")
  }

  return (
    <div className="cv3-container">
      {/* Left Section */}
      <div className="cv3-left">
        <h2 className="cv3-heading">Choose an avatar</h2>
        <p className="cv3-subtext">Select an avatar for your video</p>

        {loadingAvatars ? (
          <div className="cv3-loading">Loading avatars...</div>
        ) : avatars.length === 0 ? (
          <div className="cv3-error">
            <p>❌ No avatars available</p>
            <p>Make sure backend is running on http://localhost:5001</p>
          </div>
        ) : (
          <div className="cv3-avatars">
            {avatars.map((avatar, idx) => (
              <div
                key={avatar.id}
                className={`cv3-avatar-card ${selectedAvatar === idx ? "active" : ""}`}
                onClick={() => setSelectedAvatar(idx)}
              >
                {avatar.url ? (
                  <img
                    src={`http://localhost:5001${avatar.url}`}
                    alt={avatar.name}
                    className="cv3-avatar"
                    onError={(e) => {
                      console.error(`Failed to load avatar: ${avatar.name}`)
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E"
                    }}
                  />
                ) : (
                  <div className="cv3-avatar-placeholder">
                    {avatar.name.charAt(0)}
                  </div>
                )}
                <div className="cv3-avatar-name">{avatar.name}</div>
                <div className="cv3-avatar-meta">
                  {avatar.gender} • {avatar.style}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="cv3-box">
          <label>Script (from Step 1)</label>
          <div className="cv3-info">
            {script || "No script was provided. Go back to Step 1."}
          </div>
        </div>

        <div className="cv3-box">
          <label>Selected Voice (from Step 2)</label>
          <div className="cv3-info">
            {voice ? voice.name : "No voice selected. Go back to Step 2."}
          </div>
          {voice && script && (
            <button className="cv3-btn" onClick={playVoice}>
              🔊 Preview Voice
            </button>
          )}
        </div>

        <div className="cv3-buttons">
          <button
            className="cv3-btn primary"
            onClick={handleCreateVideo}
            disabled={isGenerating || selectedAvatar === null || !script}
          >
            {isGenerating ? "⏳ Generating..." : "🎬 Create Video"}
          </button>
          <button 
            className="cv3-btn" 
            onClick={handleGenerateBackground}
            disabled
          >
            🖼️ Generate Background (Soon)
          </button>
          <button 
            className="cv3-btn" 
            onClick={handleRecreateBackground}
            disabled
          >
            🔄 Recreate Background (Soon)
          </button>
        </div>

        {/* Generated Media Display */}
        {(audioUrl || videoUrl) && (
          <div className="cv3-box">
            <label>Generated Media</label>
            {audioUrl && (
              <div className="cv3-media-item">
                <p>🎤 Audio:</p>
                <audio controls src={audioUrl} className="cv3-audio">
                  Your browser does not support audio playback.
                </audio>
              </div>
            )}
            {videoUrl && (
              <div className="cv3-media-item">
                <p>🎬 Lip-sync Video:</p>
                <video controls src={videoUrl} className="cv3-video">
                  Your browser does not support video playback.
                </video>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Section - Preview */}
      <div className="cv3-right">
        <h2 className="cv3-heading">Preview</h2>
        <p className="cv3-subtext">
          {selectedAvatar !== null && avatars[selectedAvatar]
            ? `${avatars[selectedAvatar].name} • ${avatars[selectedAvatar].style}`
            : "No avatar selected"}
        </p>

        <div className="cv3-preview">
          {selectedAvatar !== null && avatars[selectedAvatar] ? (
            avatars[selectedAvatar].url ? (
              <img
                src={`http://localhost:5001${avatars[selectedAvatar].url}`}
                alt="Selected Avatar Preview"
                className="cv3-preview-avatar"
                onError={(e) => {
                  e.target.style.display = "none"
                  e.target.nextSibling.style.display = "flex"
                }}
              />
            ) : (
              <div className="cv3-preview-placeholder">
                <div className="cv3-placeholder-icon">👤</div>
                <p>{avatars[selectedAvatar].name}</p>
              </div>
            )
          ) : (
            <div className="cv3-preview-placeholder">
              <div className="cv3-placeholder-icon">🎭</div>
              <p>Select an avatar to preview</p>
            </div>
          )}
        </div>

        {/* Video Preview */}
        {videoUrl && (
          <div className="cv3-video-preview">
            <h3>Generated Video</h3>
            <video controls autoPlay src={videoUrl} className="cv3-final-video">
              Your browser does not support video playback.
            </video>
          </div>
        )}
      </div>
    </div>
    
  )
}