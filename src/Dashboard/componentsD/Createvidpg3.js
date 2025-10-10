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

  // Play voice preview
  const playVoice = () => {
    if (!voice || !script) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(script)
    utterance.rate = voice.rate || 1
    utterance.pitch = voice.pitch || 1
    utterance.lang = voice.lang || "en-US"
    window.speechSynthesis.speak(utterance)
  }

  // Generate video
  const handleCreateVideo = async () => {
    if (selectedAvatar === null) return alert("Please select an avatar first!")
    if (!script) return alert("No script available. Go back to Step 1.")

    const selectedAvatarData = avatars[selectedAvatar]
    setIsGenerating(true)
    setVideoUrl(null)
    setAudioUrl(null)

    try {
      console.log("🎬 Generating video with:", selectedAvatarData.name)
      const response = await fetch("http://localhost:5001/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: script,
          avatar_id: selectedAvatarData.id,
          use_ready_avatar: true
        }),
      })
      if (!response.ok) throw new Error(`Backend error: ${response.status}`)
      const result = await response.json()
      if (result.audio_url) setAudioUrl(`http://localhost:5001${result.audio_url}`)
      if (result.lipsync_url) setVideoUrl(`http://localhost:5001${result.lipsync_url}`)
      alert("Video generation completed!")
    } catch (err) {
      console.error("❌ Video generation failed:", err)
      alert(`Video generation failed: ${err.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="cv3-container">
      {/* Left Section */}
      <div className="cv3-left">
        <h2 className="cv3-heading">Choose an avatar</h2>
        {loadingAvatars ? (
          <p>Loading avatars...</p>
        ) : avatars.length === 0 ? (
          <p>No avatars found. Check backend.</p>
        ) : (
          <div className="cv3-avatars">
            {avatars.map((avatar, idx) => (
              <div
                key={avatar.id}
                className={`cv3-avatar-card ${selectedAvatar === idx ? "active" : ""}`}
                onClick={() => setSelectedAvatar(idx)}
              >
                <img
                  src={`http://localhost:5001${avatar.url}`}
                  alt={avatar.name}
                  className="cv3-avatar"
                  onError={(e) => {
                    console.error("Failed to load avatar:", avatar.name)
                    e.target.src = "/fallback-avatar.png" // optional fallback image
                  }}
                />
                <div className="cv3-avatar-name">{avatar.name}</div>
              </div>
            ))}
          </div>
        )}

        <div className="cv3-box">
          <label>Script</label>
          <div className="cv3-info">{script || "No script available."}</div>
        </div>

        <div className="cv3-box">
          <label>Selected Voice</label>
          <div className="cv3-info">{voice ? voice.name : "No voice selected."}</div>
          {voice && script && (
            <button onClick={playVoice}>🔊 Preview Voice</button>
          )}
        </div>

        <button
          onClick={handleCreateVideo}
          disabled={isGenerating || selectedAvatar === null || !script}
        >
          {isGenerating ? "⏳ Generating..." : "🎬 Create Video"}
        </button>

        {(audioUrl || videoUrl) && (
          <div className="cv3-box">
            {audioUrl && <audio controls src={audioUrl}></audio>}
            {videoUrl && <video controls src={videoUrl}></video>}
          </div>
        )}
      </div>

      {/* Right Section - Preview */}
      <div className="cv3-right">
        <h2 className="cv3-heading">Preview</h2>
        <div className="cv3-preview">
          {selectedAvatar !== null && avatars[selectedAvatar] ? (
            <img
              src={`http://localhost:5001${avatars[selectedAvatar].url}`}
              alt={avatars[selectedAvatar].name}
              className="cv3-preview-avatar"
              onError={(e) => {
                e.target.style.display = "none"
              }}
            />
          ) : (
            <p>Select an avatar to preview</p>
          )}
        </div>
      </div>
    </div>
  )
}
