"use client"

import React, { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import "../../Styles/TemplateEditor.css"

export default function TemplateEditor() {
  const navigate = useNavigate()
  const location = useLocation()
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const currentSceneAudioRef = useRef(null)
  
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [currentScene, setCurrentScene] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(17)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [selectedElement, setSelectedElement] = useState(null)
  const [selectedSceneForImage, setSelectedSceneForImage] = useState(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  
  // Store per-scene data
  const [sceneAvatars, setSceneAvatars] = useState({}) // {sceneId: imageUrl}
  const [sceneImages, setSceneImages] = useState({}) // {sceneId: {elementId: imageUrl}}
  const [sceneAudioBlobs, setSceneAudioBlobs] = useState({}) // {sceneId: audioBlob}
  
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
          id: "title-1",
          type: "text",
          content: "HeyGen\nApp",
          position: { x: 200, y: 200 },
          style: { fontSize: "48px", fontWeight: "bold", color: "white" }
        },
        {
          id: "subtitle-1", 
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
          id: "main-text-2",
          type: "text", 
          content: "BRIEF INTRO OF THE APP",
          position: { x: 100, y: 180 },
          style: { fontSize: "24px", fontWeight: "bold", color: "white" }
        },
        {
          id: "description-2",
          type: "text",
          content: "• Lists flower shops\n• Online purchasing\n• Easy interface",
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
          id: "how-to-title-3",
          type: "text",
          content: "HOW TO USE?",
          position: { x: 150, y: 200 },
          style: { fontSize: "32px", fontWeight: "bold", color: "white" }
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
          id: "cta-title-4",
          type: "text",
          content: "Download Now!",
          position: { x: 200, y: 200 },
          style: { fontSize: "36px", fontWeight: "bold", color: "white" }
        },
        {
          id: "cta-subtitle-4",
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

  const voices = ["Scarlett - Professional", "James - Friendly", "Emma - Energetic", "David - Authoritative"]
  const emotions = ["Natural", "Expressive", "Calm", "Excited"]

  useEffect(() => {
    if (location.state?.template) {
      setSelectedTemplate(location.state.template)
      if (location.state.template.scenes) {
        setScenes(location.state.template.scenes)
        setTotalDuration(location.state.template.duration || 17)
        
        // Debug: Log scene timings
        console.log('Loaded scenes:', location.state.template.scenes.map(s => 
          `Scene ${s.id}: ${s.startTime}s - ${s.endTime}s`
        ))
      }
    } else {
      setSelectedTemplate({
        id: 1,
        title: "App Presentation",
        category: "Advertisement",
        thumbnail: "/heygen-app-presentation-video-frame-with-avatar.jpg"
      })
      
      // Debug: Log default scene timings
      console.log('Default scenes:', scenes.map(s => 
        `Scene ${s.id}: ${s.startTime}s - ${s.endTime}s`
      ))
    }
  }, [location.state])

  // Playback with automatic audio for each scene
  useEffect(() => {
    let interval
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1
          
          // Check if we've reached the end
          if (newTime >= totalDuration) {
            setIsPlaying(false)
            window.speechSynthesis.cancel()
            return 0
          }
          
          // Find which scene we should be in based on time
          const newSceneIndex = scenes.findIndex(scene => 
            newTime >= scene.startTime && newTime < scene.endTime
          )
          
          // If we found a valid scene and it's different from current
          if (newSceneIndex !== -1 && newSceneIndex !== currentScene) {
            console.log(`Switching to scene ${newSceneIndex + 1} at time ${newTime.toFixed(1)}s`)
            
            // Cancel previous audio before starting new scene
            window.speechSynthesis.cancel()
            setCurrentScene(newSceneIndex)
            
            // Play audio for the new scene after a small delay
            setTimeout(() => {
              playSceneAudio(scenes[newSceneIndex].id)
            }, 100)
          }
          
          return newTime
        })
      }, 100)
    } else {
      // Stop audio when paused
      window.speechSynthesis.cancel()
    }
    
    return () => {
      clearInterval(interval)
      window.speechSynthesis.cancel()
    }
  }, [isPlaying, scenes, currentScene, totalDuration])

  // Play audio for a specific scene
  const playSceneAudio = (sceneId) => {
    const scene = scenes.find(s => s.id === sceneId)
    if (!scene || !scene.script) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()
    
    if ('speechSynthesis' in window) {
      // Ensure voices are loaded
      const voices = window.speechSynthesis.getVoices()
      
      if (voices.length === 0) {
        // Wait for voices to load
        window.speechSynthesis.onvoiceschanged = () => {
          const loadedVoices = window.speechSynthesis.getVoices()
          speakText(scene.script, loadedVoices)
        }
      } else {
        speakText(scene.script, voices)
      }
    }
  }

  // Helper function to speak text
  const speakText = (text, voices) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1.0
    
    const selectedVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') && voice.lang.includes('en')
    ) || voices.find(voice => voice.lang.includes('en-US')) || voices[0]
    
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    utterance.onstart = () => {
      setIsAudioPlaying(true)
      console.log('Audio started:', text.substring(0, 50) + '...')
    }

    utterance.onend = () => {
      setIsAudioPlaying(false)
      console.log('Audio ended')
    }

    utterance.onerror = (e) => {
      setIsAudioPlaying(false)
      console.error('Audio error:', e)
    }

    currentSceneAudioRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const handlePlayPause = () => {
    if (!isPlaying) {
      // Starting playback - play audio for current scene
      playSceneAudio(scenes[currentScene].id)
    } else {
      // Pausing - stop audio
      window.speechSynthesis.cancel()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeekToScene = (sceneIndex) => {
    const scene = scenes[sceneIndex]
    if (scene) {
      setCurrentTime(scene.startTime)
      setCurrentScene(sceneIndex)
      window.speechSynthesis.cancel()
    }
  }

  const handleScriptChange = (sceneId, newScript) => {
    setScenes(prevScenes => 
      prevScenes.map(scene => 
        scene.id === sceneId ? { ...scene, script: newScript } : scene
      )
    )
  }

  const handleElementEdit = (sceneId, elementId, newContent) => {
    setScenes(prevScenes => 
      prevScenes.map(scene => {
        if (scene.id === sceneId) {
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

  // Handle custom avatar upload for specific scene
  const handleCustomAvatarUpload = (event) => {
    const file = event.target.files[0]
    if (file && currentScene !== null) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const sceneId = scenes[currentScene].id
        setSceneAvatars(prev => ({
          ...prev,
          [sceneId]: e.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle image upload for scene elements
  const handleImageUpload = (event, sceneId, elementId) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSceneImages(prev => ({
          ...prev,
          [sceneId]: {
            ...(prev[sceneId] || {}),
            [elementId]: e.target.result
          }
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Generate and store audio for a scene
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

  // Get current scene object
  const getCurrentScene = () => {
    return scenes[currentScene] || scenes[0]
  }

  // Get avatar for current scene
  const getCurrentAvatar = () => {
    const scene = getCurrentScene()
    const customAvatar = sceneAvatars[scene.id]
    if (customAvatar) return customAvatar
    
    const avatarData = avatars.find(a => a.id === scene.avatar)
    return avatarData?.thumbnail || "/professional-woman-avatar.png"
  }

  const handleBackToBrowser = () => {
    window.speechSynthesis.cancel()
    navigate("/template-browser")
  }

  const handlePreview = () => {
    // Stop any existing audio
    window.speechSynthesis.cancel()
    
    // Reset to beginning - IMPORTANT: Set these in correct order
    setIsPlaying(false) // Stop first
    setCurrentTime(0)
    setCurrentScene(0)
    
    // Small delay to ensure state is updated
    setTimeout(() => {
      setIsPlaying(true)
      // Start playing audio for first scene
      setTimeout(() => {
        playSceneAudio(scenes[0].id)
      }, 100)
    }, 50)
  }

  const handleGenerate = () => {
    window.speechSynthesis.cancel()
    alert("Generating your professional video with custom script and avatar...")
  }

  // Add new element to current scene
  const handleAddElement = (type) => {
    const scene = getCurrentScene()
    const newElement = {
      id: `element-${Date.now()}`,
      type: type,
      content: type === 'text' ? 'New Text' : '',
      position: { x: 150, y: 150 },
      style: { fontSize: "24px", fontWeight: "bold", color: "white" }
    }
    
    setScenes(prevScenes =>
      prevScenes.map(s =>
        s.id === scene.id ? { ...s, elements: [...s.elements, newElement] } : s
      )
    )
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
            ← Back
          </button>
          <div className="navbar-divider"></div>
          <span className="template-aspect">16:9</span>
          <div className="navbar-divider"></div>
          <div className="brand-selector">
            👑 Brand
          </div>
        </div>

        <div className="navbar-center">
          <button className="feedback-btn">Feedback</button>
        </div>

        <div className="navbar-right">
          <div className="user-avatar">👤</div>
          <button className="preview-btn" onClick={handlePreview}>
            ▶ Preview
          </button>
          <button className="generate-btn" onClick={handleGenerate}>
            ✓ Generate
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
                onClick={() => setCurrentScene(index)}
              >
                <div className="scene-header">
                  <div className="scene-number">
                    <span>{scene.id}</span>
                  </div>
                  
                  <div className="scene-avatar">
                    <img 
                      src={sceneAvatars[scene.id] || avatars.find(a => a.id === scene.avatar)?.thumbnail || "/professional-woman-avatar.png"} 
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
                      onClick={(e) => {
                        e.stopPropagation()
                        generateAudioForScene(scene.id)
                      }}
                      disabled={isGeneratingAudio}
                    >
                      ▶️
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
                  <button className="add-scene-btn">+ Scene</button>
                  <button className="audio-btn">🔊 Audio</button>
                  <button className="pause-btn">⏸️ Pause</button>
                  <span className="voice-director">🎤 Voice Director</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Video Canvas */}
        <div className="video-canvas-area">
          {/* Top Tools */}
          <div className="canvas-tools">
            <button className="tool-btn active" onClick={() => fileInputRef.current?.click()}>
              👤 <span>Avatars</span>
            </button>
            <button className="tool-btn" onClick={() => handleAddElement('text')}>
              📝 <span>Text</span>
            </button>
            <button className="tool-btn" onClick={() => imageInputRef.current?.click()}>
              🎵 <span>Media</span>
            </button>
            <button className="tool-btn">
              🎨 <span>Elements</span>
            </button>
            <button className="tool-btn">
              💬 <span>Captions</span>
            </button>
            <button className="tool-btn">
              🤖 <span>AI</span>
            </button>
            <button className="tool-btn">
              🖼️ <span>Background</span>
            </button>
            <button className="tool-btn">
              📚 <span>Layers</span>
            </button>
          </div>

          {/* Video Canvas */}
          <div className="video-canvas">
            <div className="canvas-container">
              {/* Background - NO CIRCLES */}
              <div className="video-background">
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%)',
                  position: 'relative'
                }}>
                  {/* Circles removed as requested */}
                </div>
              </div>

              {/* Flower Image - ONLY for current scene - Replaces Avatar */}
              
             {/* Flower Image - ONLY for current scene - Replaces Avatar */}
<div 
  className="flower-image-container"
  onClick={() => fileInputRef.current?.click()}
  style={{
    position: 'absolute',
    right: '60px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    zIndex: 2
  }}
>
  <img
    src={getCurrentAvatar()}
    alt="Flower"
    style={{
      width: '250px',
      height: '300px',
      objectFit: 'cover',
      borderRadius: '15px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      border: '3px solid rgba(255,255,255,0.3)'
    }}
  />
  <div className="flower-edit-overlay" style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    opacity: 0,
    transition: 'opacity 0.3s',
    borderRadius: '15px',
    flexDirection: 'column',
    gap: '10px'
  }}>
    <span style={{ fontSize: '32px' }}>🌸</span>
    <span>Click to change flower</span>
  </div>
</div>


              {/* Dynamic Text Elements - ONLY for current scene */}
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
                    whiteSpace: 'pre-line',
                    zIndex: 3
                  }}
                  onClick={() => setSelectedElement(element.id)}
                  onDoubleClick={() => {
                    const newContent = prompt('Edit text:', element.content)
                    if (newContent !== null) {
                      handleElementEdit(getCurrentScene().id, element.id, newContent)
                    }
                  }}
                >
                  {sceneImages[getCurrentScene().id]?.[element.id] ? (
                    <img 
                      src={sceneImages[getCurrentScene().id][element.id]} 
                      alt="Scene element"
                      style={{ maxWidth: '200px', maxHeight: '200px' }}
                    />
                  ) : (
                    element.content
                  )}
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
                {isPlaying ? "⏸️" : "▶️"}
              </button>
              <div className="time-display">
                {Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, '0')} / 
                {Math.floor(totalDuration / 60)}:{(Math.floor(totalDuration) % 60).toString().padStart(2, '0')}
              </div>
              {isAudioPlaying && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: '#10b981',
                  fontSize: '12px'
                }}>
                  <span>🔊</span>
                  <span>Audio Playing...</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="timeline-section">
            <div className="timeline-controls">▶</div>
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
            <h3>📚 Layers</h3>
            <button className="add-layer-btn">+</button>
            <button className="expand-btn">⬆</button>
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCustomAvatarUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={(e) => {
          if (selectedElement) {
            handleImageUpload(e, getCurrentScene().id, selectedElement)
          }
        }}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </div>
  )
}
