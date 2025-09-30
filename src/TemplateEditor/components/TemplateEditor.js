"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import "../../Styles/TemplateEditor.css"

export default function TemplateEditor() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [currentScene, setCurrentScene] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState("scarlett")
  const [voiceSettings, setVoiceSettings] = useState({
    voice: "Scarlett - Professional",
    emotion: "Expressive",
  })

  // Get template data from navigation state or use default
  useEffect(() => {
    if (location.state?.template) {
      setSelectedTemplate(location.state.template)
    } else {
      // Default template data if accessed directly
      setSelectedTemplate({
        id: 1,
        title: "App Presentation",
        category: "Advertisement",
      })
    }
  }, [location.state])

  // Sample script data for the template
  const [scriptScenes, setScriptScenes] = useState([
    {
      id: 1,
      avatar: "scarlett",
      text: "Your online high-quality flower shop app is published!",
      duration: "00:17",
    },
    {
      id: 2,
      avatar: "scarlett",
      text: "HeyGen is an app that lists most of the flower shops in your city and sells flowers online.",
      duration: "00:17",
    },
    {
      id: 3,
      avatar: "scarlett",
      text: "Start in a few simple steps as follow.",
      duration: "00:17",
    },
    {
      id: 4,
      avatar: "scarlett",
      text: "Let's make a better life with flowers! Download now!",
      duration: "00:17",
    },
  ])

  const avatars = [
    { id: "scarlett", name: "Scarlett", thumbnail: "/professional-woman-avatar.png" },
    { id: "james", name: "James", thumbnail: "/professional-man-avatar.png" },
    { id: "emma", name: "Emma", thumbnail: "/business-woman-avatar.png" },
  ]

  const voices = ["Scarlett - Professional", "James - Friendly", "Emma - Energetic", "David - Authoritative"]

  const emotions = ["Natural", "Expressive", "Calm", "Excited"]

  const handleScriptChange = (sceneId, newText) => {
    setScriptScenes((prev) => prev.map((scene) => (scene.id === sceneId ? { ...scene, text: newText } : scene)))
  }

  const handleAvatarChange = (sceneId, avatarId) => {
    setScriptScenes((prev) => prev.map((scene) => (scene.id === sceneId ? { ...scene, avatar: avatarId } : scene)))
  }

  const handlePlayScene = (sceneId) => {
    setCurrentScene(sceneId - 1)
    setIsPlaying(true)
    // Simulate play functionality
    setTimeout(() => setIsPlaying(false), 2000)
  }

  const handleBackToBrowser = () => {
    navigate("/template-browser")
  }

  const handlePreview = () => {
    alert("🎬 Generating preview... (This would show the full video preview)")
  }

  const handleGenerate = () => {
    alert("✨ Generating final video... (This would process and create the final video)")
  }

  if (!selectedTemplate) {
    return <div className="loading">Loading template...</div>
  }

  return (
    <div className="template-editor-container">
      {/* Top Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <button className="back-btn" onClick={handleBackToBrowser}>
            ←
          </button>
         
        </div>

        <div className="toolbar-right">
          <div className="user-avatar">👤</div>
          <button className="preview-btn" onClick={handlePreview}>
            ▶️ Preview
          </button>
          <button className="generate-btn" onClick={handleGenerate}>
            ✨ Generate
          </button>
        </div>
      </div>

      <div className="editor-content">
        {/* Left Panel - Script Editor */}
        <div className="script-panel">
          <div className="script-header">
            <h2 className="template-title">{selectedTemplate.title}</h2>
          </div>

          <div className="script-scenes">
            {scriptScenes.map((scene, index) => (
              <div key={scene.id} className={`script-scene ${currentScene === index ? "active" : ""}`}>
                <div className="scene-number">{scene.id}</div>

                <div className="scene-content">
                  <div className="scene-controls">
                    <div className="avatar-selector">
                      {avatars.map((avatar) => (
                        <button
                          key={avatar.id}
                          className={`avatar-option ${scene.avatar === avatar.id ? "selected" : ""}`}
                          onClick={() => handleAvatarChange(scene.id, avatar.id)}
                        >
                          <img src={avatar.thumbnail || "/placeholder.svg"} alt={avatar.name} />
                        </button>
                      ))}
                    </div>

                    <div className="voice-controls">
                      <select
                        value={voiceSettings.voice}
                        onChange={(e) => setVoiceSettings((prev) => ({ ...prev, voice: e.target.value }))}
                        className="voice-select"
                      >
                        {voices.map((voice) => (
                          <option key={voice} value={voice}>
                            {voice}
                          </option>
                        ))}
                      </select>

                      <select
                        value={voiceSettings.emotion}
                        onChange={(e) => setVoiceSettings((prev) => ({ ...prev, emotion: e.target.value }))}
                        className="emotion-select"
                      >
                        {emotions.map((emotion) => (
                          <option key={emotion} value={emotion}>
                            {emotion}
                          </option>
                        ))}
                      </select>

                      <button className="play-scene-btn" onClick={() => handlePlayScene(scene.id)}>
                        ▶️
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={scene.text}
                    onChange={(e) => handleScriptChange(scene.id, e.target.value)}
                    className="script-textarea"
                    placeholder="Enter your script here..."
                  />

                  <div className="scene-footer">
                    <span className="scene-duration">{scene.duration}</span>
                    <button className="enhance-btn">✨ Enhance with AI</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel - Video Preview */}
        <div className="preview-panel">
          <div className="video-preview">
            <div className="video-frame">
              <img
                src="/heygen-app-presentation-video-frame-with-avatar.jpg"
                alt="Video Preview"
                className="preview-image"
              />
              {isPlaying && (
                <div className="play-overlay">
                  <div className="play-indicator">▶️</div>
                </div>
              )}

              <div className="editing-tools-overlay">
                <div className="tools-header">
                  <button className="tool-tab active">
                    <span className="tool-icon">👤</span>
                    <span className="tool-label">Avatars</span>
                  </button>
                  <button className="tool-tab">
                    <span className="tool-icon">📝</span>
                    <span className="tool-label">Text</span>
                  </button>
                  <button className="tool-tab">
                    <span className="tool-icon">🎵</span>
                    <span className="tool-label">Media</span>
                  </button>
                  <button className="tool-tab">
                    <span className="tool-icon">🎨</span>
                    <span className="tool-label">Elements</span>
                  </button>
                  <button className="tool-tab">
                    <span className="tool-icon">💬</span>
                    <span className="tool-label">Captions</span>
                  </button>
                  <button className="tool-tab">
                    <span className="tool-icon">🤖</span>
                    <span className="tool-label">AI</span>
                  </button>
                  <button className="tool-tab">
                    <span className="tool-icon">🖼️</span>
                    <span className="tool-label">Background</span>
                  </button>
                  <button className="tool-tab">
                    <span className="tool-icon">📚</span>
                    <span className="tool-label">Layers</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="timeline-container">
            <div className="timeline">
              {scriptScenes.map((scene, index) => (
                <div
                  key={scene.id}
                  className={`timeline-scene ${currentScene === index ? "active" : ""}`}
                  onClick={() => setCurrentScene(index)}
                >
                  <img src="/video-scene-thumbnail.jpg" alt={`Scene ${scene.id}`} className="scene-thumbnail" />
                  <span className="scene-label">{scene.id}</span>
                </div>
              ))}
              <button className="add-scene-btn">+</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
