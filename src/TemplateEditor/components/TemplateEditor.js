"use client"

import React, { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import "../../Styles/TemplateEditor.css"

export default function TemplateEditor() {
  const navigate = useNavigate()
  const location = useLocation()
  const videoRef = useRef(null)
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [currentScene, setCurrentScene] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(17)
  const [customAvatar, setCustomAvatar] = useState(null)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [selectedElement, setSelectedElement] = useState(null)
  
  // Scene-based script data (like HeyGen)
  const [scenes, setScenes] = useState([
    {
      id: 1,
      startTime: 0,
      endTime: 4.25,
      script: "Your online high-quality flower shop app is published!",
      avatar: "scarlett",
      voiceSettings: { voice: "Scarlett - Professional", emotion: "Expressive" },
      elements: [
        {
          id: "title",
          type: "text",
          content: "HeyGen\nApp",
          position: { x: 200, y: 200 },
          style: { fontSize: "48px", fontWeight: "bold", color: "white" }
        },
        {
          id: "subtitle", 
          type: "text",
          content: "Your online high-quality\nFlower Shop",
          position: { x: 200, y: 350 },
          style: { fontSize: "18px", color: "white" }
        }
      ]
    },
    {
      id: 2,
      startTime: 4.25,
      endTime: 8.5,
      script: "HeyGen is an app that lists most of the flower shops in your city and sells flowers online.",
      avatar: "scarlett",
      voiceSettings: { voice: "Scarlett - Professional", emotion: "Expressive" },
      elements: [
        {
          id: "main-text",
          type: "text", 
          content: "BRIEF INTRO OF THE APP",
          position: { x: 100, y: 180 },
          style: { fontSize: "24px", fontWeight: "bold", color: "white" }
        },
        {
          id: "description",
          type: "text",
          content: "• Lists flower shops in your city\n• Online flower purchasing\n• Easy to use interface",
          position: { x: 100, y: 250 },
          style: { fontSize: "16px", color: "white" }
        }
      ]
    },
    {
      id: 3,
      startTime: 8.5,
      endTime: 12.75,
      script: "Start in a few simple steps as follow.",
      avatar: "scarlett", 
      voiceSettings: { voice: "Scarlett - Professional", emotion: "Expressive" },
      elements: [
        {
          id: "how-to-title",
          type: "text",
          content: "HOW TO USE?",
          position: { x: 150, y: 200 },
          style: { fontSize: "32px", fontWeight: "bold", color: "white" }
        },
        {
          id: "steps",
          type: "text",
          content: "Follow these simple steps:",
          position: { x: 150, y: 280 },
          style: { fontSize: "18px", color: "white" }
        }
      ]
    },
    {
      id: 4,
      startTime: 12.75,
      endTime: 17,
      script: "Let's make a better life with flowers! Download now!",
      avatar: "scarlett",
      voiceSettings: { voice: "Scarlett - Professional", emotion: "Expressive" },
      elements: [
        {
          id: "cta-title",
          type: "text",
          content: "Download Now!",
          position: { x: 200, y: 200 },
          style: { fontSize: "36px", fontWeight: "bold", color: "white" }
        },
        {
          id: "cta-subtitle",
          type: "text",
          content: "Available on App Store & Google Play",
          position: { x: 200, y: 300 },
          style: { fontSize: "16px", color: "white" }
        }
      ]
    }
  ])

  const [voiceSettings, setVoiceSettings] = useState({
    voice: "Scarlett - Professional",
    emotion: "Expressive"
  })

  const avatars = [
    { id: "scarlett", name: "Scarlett", thumbnail: "/professional-woman-avatar.png" },
    { id: "james", name: "James", thumbnail: "/professional-man-avatar.png" },
    { id: "emma", name: "Emma", thumbnail: "/business-woman-avatar.png" },
  ]

  const voices = [
    "Scarlett - Professional", 
    "James - Friendly", 
    "Emma - Energetic", 
    "David - Authoritative"
  ]

  const emotions = ["Natural", "Expressive", "Calm", "Excited"]

  useEffect(() => {
    if (location.state?.template) {
      setSelectedTemplate(location.state.template)
    } else {
      setSelectedTemplate({
        id: 1,
        title: "App Presentation",
        category: "Advertisement",
        thumbnail: "/heygen-app-presentation-video-frame-with-avatar.jpg"
      })
    }
  }, [location.state])

  // Simulate video playback and scene timing
  useEffect(() => {
    let interval
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1
          if (newTime >= totalDuration) {
            setIsPlaying(false)
            return 0
          }
          
          // Update current scene based on time
          const activeScene = scenes.findIndex(scene => 
            newTime >= scene.startTime && newTime < scene.endTime
          )
          if (activeScene !== -1 && activeScene !== currentScene) {
            setCurrentScene(activeScene)
          }
          
          return newTime
        })
      }, 100)
    }
    
    return () => clearInterval(interval)
  }, [isPlaying, scenes, currentScene, totalDuration])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSeekToScene = (sceneIndex) => {
    const scene = scenes[sceneIndex]
    if (scene) {
      setCurrentTime(scene.startTime)
      setCurrentScene(sceneIndex)
    }
  }

  const handleScriptChange = (sceneId, newScript) => {
    setScenes(prevScenes => 
      prevScenes.map(scene => 
        scene.id === sceneId ? { ...scene, script: newScript } : scene
      )
    )
  }

  const handleElementEdit = (sceneIndex, elementId, newContent) => {
    setScenes(prevScenes => 
      prevScenes.map((scene, index) => {
        if (index === sceneIndex) {
          return {
            ...scene,
            elements: scene.elements.map(element =>
              element.id === elementId ? { ...element, content: newContent } : element
            )
          }
        }
        return scene
      })
    )
  }

  const handleAvatarChange = (sceneId, avatarId) => {
    setScenes(prevScenes =>
      prevScenes.map(scene =>
        scene.id === sceneId ? { ...scene, avatar: avatarId } : scene
      )
    )
  }

  const handleCustomAvatarUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCustomAvatar(e.target.result)
        // Update all scenes to use custom avatar
        setScenes(prevScenes =>
          prevScenes.map(scene => ({ ...scene, avatar: "custom" }))
        )
      }
      reader.readAsDataURL(file)
    }
  }

  const generateAudioForScene = async (sceneId) => {
    setIsGeneratingAudio(true)
    const scene = scenes.find(s => s.id === sceneId)
    
    if (scene && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(scene.script)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      
      const voices = window.speechSynthesis.getVoices()
      const selectedVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') && voice.lang.includes('en')
      ) || voices[0]
      
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }

      utterance.onend = () => {
        setIsGeneratingAudio(false)
      }

      utterance.onerror = () => {
        setIsGeneratingAudio(false)
      }

      window.speechSynthesis.speak(utterance)
    }
  }

  const getCurrentScene = () => {
    return scenes[currentScene] || scenes[0]
  }

  const handleBackToBrowser = () => {
    navigate("/template-browser")
  }

  const handlePreview = () => {
    setCurrentTime(0)
    setCurrentScene(0)
    setIsPlaying(true)
  }

  const handleGenerate = () => {
    alert("🎬 Generating your professional video with custom script and avatar...")
  }

  if (!selectedTemplate) {
    return <div className="loading">Loading template...</div>
  }

  return (
    <div className="template-editor-container">
      {/* Top Navigation Bar */}
      <div className="editor-navbar">
        <div className="navbar-left">
          <button className="back-btn" onClick={handleBackToBrowser}>
            <span role="img" aria-label="arrow-left">←</span>
          </button>
          <div className="navbar-divider"></div>
          <span className="template-aspect">16:9</span>
          <div className="navbar-divider"></div>
          <div className="brand-selector">
            <span role="img" aria-label="crown">👑</span> Brand
          </div>
        </div>

        <div className="navbar-center">
          <button className="feedback-btn">Feedback</button>
        </div>

        <div className="navbar-right">
          <div className="user-avatar">
            <span role="img" aria-label="user">👤</span>
          </div>
          <button className="preview-btn" onClick={handlePreview}>
            <span role="img" aria-label="play">▶</span> Preview
          </button>
          <button className="generate-btn" onClick={handleGenerate}>
            <span role="img" aria-label="checkmark">✓</span> Generate
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="editor-main">
        {/* Left Sidebar - Scene Scripts */}
        <div className="left-sidebar">
          <div className="template-title">
            <h2>{selectedTemplate.title}</h2>
          </div>

          <div className="scenes-list">
            {scenes.map((scene, index) => (
              <div 
                key={scene.id} 
                className={`scene-item ${currentScene === index ? 'active' : ''}`}
              >
                <div className="scene-header">
                  <div className="scene-number">
                    <span>{scene.id}</span>
                  </div>
                  
                  <div className="scene-avatar">
                    <img 
                      src={scene.avatar === 'custom' && customAvatar ? customAvatar : avatars.find(a => a.id === scene.avatar)?.thumbnail || "/professional-woman-avatar.png"} 
                      alt="Avatar" 
                    />
                    <div className="avatar-controls">
                      <select
                        value={voiceSettings.voice}
                        onChange={(e) => setVoiceSettings(prev => ({ ...prev, voice: e.target.value }))}
                      >
                        {voices.map(voice => (
                          <option key={voice} value={voice}>{voice}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="scene-controls">
                    <select
                      value={voiceSettings.emotion}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, emotion: e.target.value }))}
                    >
                      {emotions.map(emotion => (
                        <option key={emotion} value={emotion}>{emotion}</option>
                      ))}
                    </select>
                    
                    <button 
                      className="play-scene-btn"
                      onClick={() => generateAudioForScene(scene.id)}
                      disabled={isGeneratingAudio}
                    >
                      <span role="img" aria-label="play">▶️</span>
                    </button>
                  </div>
                </div>

                <textarea
                  value={scene.script}
                  onChange={(e) => handleScriptChange(scene.id, e.target.value)}
                  className="scene-script-input"
                  placeholder="Enter your script for this scene..."
                  rows="3"
                />

                <div className="scene-footer">
                  <button className="add-scene-btn">
                    <span role="img" aria-label="plus">+</span> Scene
                  </button>
                  <button className="audio-btn">
                    <span role="img" aria-label="speaker">🔊</span> Audio
                  </button>
                  <button className="pause-btn">
                    <span role="img" aria-label="pause">⏸️</span> Pause
                  </button>
                  <span className="voice-director">
                    <span role="img" aria-label="microphone">🎤</span> Voice Director
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Video Canvas */}
        <div className="video-canvas-area">
          {/* Top Tools */}
          <div className="canvas-tools">
            <button className="tool-btn active">
              <span role="img" aria-label="person">👤</span>
              <span>Avatars</span>
            </button>
            <button className="tool-btn">
              <span role="img" aria-label="text">📝</span>
              <span>Text</span>
            </button>
            <button className="tool-btn">
              <span role="img" aria-label="media">🎵</span>
              <span>Media</span>
            </button>
            <button className="tool-btn">
              <span role="img" aria-label="elements">🎨</span>
              <span>Elements</span>
            </button>
            <button className="tool-btn">
              <span role="img" aria-label="captions">💬</span>
              <span>Captions</span>
            </button>
            <button className="tool-btn">
              <span role="img" aria-label="ai">🤖</span>
              <span>AI</span>
            </button>
            <button className="tool-btn">
              <span role="img" aria-label="background">🖼️</span>
              <span>Background</span>
            </button>
            <button className="tool-btn">
              <span role="img" aria-label="layers">📚</span>
              <span>Layers</span>
            </button>
          </div>

          {/* Video Canvas */}
          <div className="video-canvas">
            <div className="canvas-container">
              {/* Background */}
              <div className="video-background">
                {/* Blue gradient background like HeyGen */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%)',
                  position: 'relative'
                }}>
                  {/* Decorative circles */}
                  <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: '50%',
                    width: '150px',
                    height: '150px',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderRadius: '50%'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    top: '10%',
                    left: '20%',
                    width: '60px',
                    height: '60px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '50%'
                  }}></div>
                </div>
              </div>

              {/* Avatar */}
              <div 
                className="avatar-container"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute',
                  right: '80px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer'
                }}
              >
                <img
                  src={customAvatar || "/professional-woman-avatar.png"}
                  alt="Presenter"
                  style={{
                    width: '200px',
                    height: '280px',
                    objectFit: 'cover',
                    borderRadius: '10px'
                  }}
                />
                <div className="avatar-edit-overlay">
                  <span>Click to change avatar</span>
                </div>
              </div>

              {/* Dynamic Text Elements */}
              {getCurrentScene()?.elements.map(element => (
                <div
                  key={element.id}
                  className={`text-element ${selectedElement === element.id ? 'selected' : ''}`}
                  style={{
                    position: 'absolute',
                    left: element.position.x,
                    top: element.position.y,
                    ...element.style,
                    cursor: 'pointer',
                    padding: '10px',
                    borderRadius: '5px',
                    whiteSpace: 'pre-line'
                  }}
                  onClick={() => setSelectedElement(element.id)}
                  onDoubleClick={() => {
                    const newContent = prompt('Edit text:', element.content)
                    if (newContent !== null) {
                      handleElementEdit(currentScene, element.id, newContent)
                    }
                  }}
                >
                  {element.content}
                  {selectedElement === element.id && (
                    <div className="element-handles">
                      <div className="handle top-left"></div>
                      <div className="handle top-right"></div>
                      <div className="handle bottom-left"></div>
                      <div className="handle bottom-right"></div>
                    </div>
                  )}
                </div>
              ))}

              {/* Scene Progress Indicator */}
              <div className="scene-progress">
                {Array.from({ length: scenes.length }, (_, i) => (
                  <div
                    key={i}
                    className={`progress-dot ${i <= currentScene ? 'active' : ''}`}
                  />
                ))}
              </div>
            </div>

            {/* Playback Controls */}
            <div className="playback-controls">
              <button className="play-btn" onClick={handlePlayPause}>
                <span role="img" aria-label={isPlaying ? "pause" : "play"}>
                  {isPlaying ? "⏸️" : "▶️"}
                </span>
              </button>
              <div className="time-display">
                {Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, '0')} / 
                {Math.floor(totalDuration / 60)}:{(Math.floor(totalDuration) % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="timeline-section">
            <div className="timeline-controls">
              <span role="img" aria-label="play">▶</span>
            </div>
            <div className="timeline-track">
              {scenes.map((scene, index) => (
                <div
                  key={scene.id}
                  className={`timeline-scene ${currentScene === index ? 'active' : ''}`}
                  style={{
                    width: `${((scene.endTime - scene.startTime) / totalDuration) * 100}%`
                  }}
                  onClick={() => handleSeekToScene(index)}
                >
                  <div className="scene-thumbnail">
                    <div className="scene-number">{scene.id}</div>
                    <img
                      src="/heygen-app-presentation-video-frame-with-avatar.jpg"
                      alt={`Scene ${scene.id}`}
                    />
                  </div>
                </div>
              ))}
              <button className="add-scene-timeline-btn">+</button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Layers Panel */}
        <div className="right-sidebar">
          <div className="layers-panel">
            <h3>
              <span role="img" aria-label="layers">📚</span> Layers
            </h3>
            <button className="add-layer-btn">+</button>
            <button className="expand-btn">
              <span role="img" aria-label="expand">⬆</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input for avatar upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCustomAvatarUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </div>
  )
}