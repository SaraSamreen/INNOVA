"use client"

import React, { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"

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
  
  const [sceneAvatars, setSceneAvatars] = useState({})
  const [sceneImages, setSceneImages] = useState({})
  const [sceneAudioBlobs, setSceneAudioBlobs] = useState({})
  
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
      }
    } else {
      setSelectedTemplate({
        id: 1,
        title: "App Presentation",
        category: "Advertisement",
        thumbnail: "/heygen-app-presentation-video-frame-with-avatar.jpg"
      })
    }
  }, [location.state])

  // Playback with automatic audio
  useEffect(() => {
    let interval
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1
          
          if (newTime >= totalDuration) {
            setIsPlaying(false)
            window.speechSynthesis.cancel()
            return 0
          }
          
          const newSceneIndex = scenes.findIndex(scene => 
            newTime >= scene.startTime && newTime < scene.endTime
          )
          
          if (newSceneIndex !== -1 && newSceneIndex !== currentScene) {
            window.speechSynthesis.cancel()
            setCurrentScene(newSceneIndex)
            
            setTimeout(() => {
              playSceneAudio(scenes[newSceneIndex].id)
            }, 100)
          }
          
          return newTime
        })
      }, 100)
    } else {
      window.speechSynthesis.cancel()
    }
    
    return () => {
      clearInterval(interval)
      window.speechSynthesis.cancel()
    }
  }, [isPlaying, scenes, currentScene, totalDuration])

  const playSceneAudio = (sceneId) => {
    const scene = scenes.find(s => s.id === sceneId)
    if (!scene || !scene.script) return

    window.speechSynthesis.cancel()
    
    if ('speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices()
      
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          const loadedVoices = window.speechSynthesis.getVoices()
          speakText(scene.script, loadedVoices)
        }
      } else {
        speakText(scene.script, voices)
      }
    }
  }

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
    }

    utterance.onend = () => {
      setIsAudioPlaying(false)
    }

    utterance.onerror = (e) => {
      setIsAudioPlaying(false)
    }

    currentSceneAudioRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const handlePlayPause = () => {
    if (!isPlaying) {
      playSceneAudio(scenes[currentScene].id)
    } else {
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
    window.speechSynthesis.cancel()
    
    setIsPlaying(false)
    setCurrentTime(0)
    setCurrentScene(0)
    
    setTimeout(() => {
      setIsPlaying(true)
      setTimeout(() => {
        playSceneAudio(scenes[0].id)
      }, 100)
    }, 50)
  }

  const handleGenerate = () => {
    window.speechSynthesis.cancel()
    alert("Generating your professional video with custom script and avatar...")
  }

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
    return <div className="flex items-center justify-center w-screen h-screen text-lg text-gray-500 bg-gray-50">Loading template...</div>
  }

  return (
    <div className="flex flex-col w-screen h-screen bg-gray-100 font-sans">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between h-16 bg-white border-b border-gray-200 px-5 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBackToBrowser}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 text-sm"
          >
            ← Back
          </button>
          <div className="w-px h-6 bg-gray-200"></div>
          <span className="text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">16:9</span>
          <div className="w-px h-6 bg-gray-200"></div>
          <div className="flex items-center gap-2 text-sm text-gray-700 bg-yellow-50 px-3 py-1.5 rounded-lg cursor-pointer">
            👑 Brand
          </div>
        </div>

        <div className="flex items-center">
          <button className="text-sm text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">Feedback</button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-base">👤</div>
          <button 
            onClick={handlePreview}
            className="flex items-center gap-2 text-sm text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all"
          >
            ▶ Preview
          </button>
          <button 
            onClick={handleGenerate}
            className="flex items-center gap-2 text-sm font-medium text-white bg-black px-4 py-2 rounded-lg hover:bg-gray-800 transition-all"
          >
            ✓ Generate
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Left Sidebar - Scene Scripts */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
          <div className="px-5 py-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 m-0">{selectedTemplate.title}</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {scenes.map((scene, index) => (
              <div 
                key={scene.id} 
                className={`border-b border-gray-100 p-4 transition-all cursor-pointer ${currentScene === index ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                onClick={() => setCurrentScene(index)}
              >
                <div className="flex gap-3 mb-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {scene.id}
                  </div>
                  
                  <div>
                    <img 
                      src={sceneAvatars[scene.id] || avatars.find(a => a.id === scene.avatar)?.thumbnail || "/professional-woman-avatar.png"} 
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover mb-2"
                    />
                    <select
                      value={voiceSettings.voice}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, voice: e.target.value }))}
                      className="text-xs border border-gray-300 rounded px-2 py-1 w-28"
                    >
                      {voices.map(voice => (
                        <option key={voice} value={voice}>{voice}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <select
                      value={voiceSettings.emotion}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, emotion: e.target.value }))}
                      className="text-xs border border-gray-300 rounded px-2 py-1 w-24"
                    >
                      {emotions.map(emotion => (
                        <option key={emotion} value={emotion}>{emotion}</option>
                      ))}
                    </select>
                    
                    <button 
                      className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-all"
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
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm leading-5 resize-vertical min-h-16 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your script for this scene..."
                  rows="3"
                />

                <div className="flex gap-2 mt-3 flex-wrap">
                  <button className="text-xs bg-transparent border border-gray-300 px-2 py-1 rounded hover:bg-gray-50">+ Scene</button>
                  <button className="text-xs bg-transparent border border-gray-300 px-2 py-1 rounded hover:bg-gray-50">🔊 Audio</button>
                  <button className="text-xs bg-transparent border border-gray-300 px-2 py-1 rounded hover:bg-gray-50">⏸️ Pause</button>
                  <span className="text-xs text-gray-600 flex items-center gap-1">🎤 Voice Director</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Video Canvas */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Top Tools */}
          <div className="h-16 bg-white border-b border-gray-200 flex items-center px-5 gap-1">
            <button 
              className="flex flex-col items-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="text-sm">👤</span>
              <span className="text-xs">Avatars</span>
            </button>
            <button 
              className="flex flex-col items-center gap-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              onClick={() => handleAddElement('text')}
            >
              <span className="text-sm">📝</span>
              <span className="text-xs">Text</span>
            </button>
            <button 
              className="flex flex-col items-center gap-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              onClick={() => imageInputRef.current?.click()}
            >
              <span className="text-sm">🎵</span>
              <span className="text-xs">Media</span>
            </button>
            <button className="flex flex-col items-center gap-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
              <span className="text-sm">🎨</span>
              <span className="text-xs">Elements</span>
            </button>
            <button className="flex flex-col items-center gap-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
              <span className="text-sm">💬</span>
              <span className="text-xs">Captions</span>
            </button>
            <button className="flex flex-col items-center gap-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
              <span className="text-sm">🤖</span>
              <span className="text-xs">AI</span>
            </button>
            <button className="flex flex-col items-center gap-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
              <span className="text-sm">🖼️</span>
              <span className="text-xs">Background</span>
            </button>
            <button className="flex flex-col items-center gap-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
              <span className="text-sm">📚</span>
              <span className="text-xs">Layers</span>
            </button>
          </div>

          {/* Video Canvas */}
          <div className="flex-1 flex flex-col p-5 items-center justify-center">
            <div className="w-full max-w-3xl rounded-xl overflow-hidden shadow-xl relative bg-black"
              style={{ aspectRatio: '16/9' }}>
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-purple-900"></div>

              {/* Flower Image */}
              <div 
                className="absolute right-16 top-1/2 -translate-y-1/2 cursor-pointer hover:scale-105 transition-transform z-20"
                onClick={() => fileInputRef.current?.click()}
              >
                <img
                  src={getCurrentAvatar()}
                  alt="Flower"
                  className="w-64 h-80 object-cover rounded-2xl shadow-2xl border-4 border-white/30 hover:border-white/50 transition-all"
                />
                <div className="absolute inset-0 bg-black/70 rounded-2xl flex flex-col items-center justify-center gap-2.5 opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-2xl">🌸</span>
                  <span className="text-sm text-white">Click to change flower</span>
                </div>
              </div>

              {/* Text Elements */}
              {getCurrentScene()?.elements.map(element => (
                <div
                  key={element.id}
                  className={`absolute cursor-pointer p-2.5 rounded whitespace-pre-line z-30 transition-all hover:scale-105 ${selectedElement === element.id ? 'ring-2 ring-blue-500' : ''}`}
                  style={{
                    left: element.position.x,
                    top: element.position.y,
                    ...element.style
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
                      className="max-w-48 max-h-48"
                    />
                  ) : (
                    element.content
                  )}
                </div>
              ))}

              {/* Scene Progress */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-40">
                {Array.from({ length: scenes.length }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${i <= currentScene ? 'bg-white' : 'bg-white/30'}`}
                  />
                ))}
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-4 mt-5 px-5 py-3 bg-black/80 rounded-full text-white">
              <button 
                className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-base transition-all"
                onClick={handlePlayPause}
              >
                {isPlaying ? "⏸️" : "▶️"}
              </button>
              <div className="text-sm font-mono min-w-20 text-center">
                {Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, '0')} / 
                {Math.floor(totalDuration / 60)}:{(Math.floor(totalDuration) % 60).toString().padStart(2, '0')}
              </div>
              {isAudioPlaying && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                  <span>🔊</span>
                  <span>Audio Playing...</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="h-24 bg-white border-t border-gray-200 flex items-center px-5 gap-4">
            <div className="text-base">▶</div>
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-1 flex gap-0.5 items-center overflow-x-auto">
              {scenes.map((scene, index) => (
                <div
                  key={scene.id}
                  className={`flex-shrink-0 bg-white border border-gray-300 rounded-lg cursor-pointer transition-all hover:shadow-md ${currentScene === index ? 'ring-2 ring-blue-500 ring-offset-0' : ''}`}
                  style={{
                    width: `${((scene.endTime - scene.startTime) / totalDuration) * 100}%`,
                    minWidth: '60px'
                  }}
                  onClick={() => handleSeekToScene(index)}
                >
                  <div className="relative w-full h-full rounded-lg overflow-hidden">
                    <img
                      src="/heygen-app-presentation-video-frame-with-avatar.jpg"
                      alt={`Scene ${scene.id}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center text-xs font-semibold">
                      {scene.id}
                    </div>
                  </div>
                </div>
              ))}
              <button className="flex-shrink-0 w-12 h-12 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center text-xl text-gray-500">+</button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Layers Panel */}
        <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-5 flex items-center justify-between border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 m-0 flex items-center gap-2">📚 Layers</h3>
            <div className="flex gap-1">
              <button className="w-8 h-8 bg-transparent border border-gray-300 rounded-lg px-1.5 py-1 text-gray-600 hover:bg-gray-50 flex items-center justify-center">+</button>
              <button className="w-8 h-8 bg-transparent border border-gray-300 rounded-lg px-1.5 py-1 text-gray-600 hover:bg-gray-50 flex items-center justify-center">⬆</button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCustomAvatarUpload}
        accept="image/*"
        className="hidden"
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
        className="hidden"
      />
    </div>
  )
}