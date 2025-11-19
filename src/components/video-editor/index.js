'use client'

import { useState, useRef, useEffect } from 'react'
import Canvas from './Canvas'
import Timeline from './Timeline'
import Toolbar from './Toolbar'
import FileUpload from './FileUpload'

const API_URL = 'http://localhost:5000/api/video'

export default function VideoEditor() {
  const [video, setVideo] = useState(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [trim, setTrim] = useState({ start: 0, end: null })
  const [isMuted, setIsMuted] = useState(false)
  const [audio, setAudio] = useState(null)
  const [textOverlays, setTextOverlays] = useState([])
  const [selectedText, setSelectedText] = useState(null)
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    grayscale: 0,
    saturation: 100,
  })
  const [activeTab, setActiveTab] = useState('upload')
  const [uploadedFileName, setUploadedFileName] = useState(null)
  const [audioFileName, setAudioFileName] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [isPlaying])

  const handleVideoUpload = async (file) => {
    if (!file) {
      console.log('No file selected')
      return
    }
    
    setIsUploading(true)
    console.log('Uploading file:', file.name)
    
    try {
      const formData = new FormData()
      formData.append('video', file)

      console.log('Sending to:', `${API_URL}/upload`)

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (data.success) {
        const url = URL.createObjectURL(file)
        setVideo(url)
        setUploadedFileName(data.file.filename)
        setTrim({ start: 0, end: data.file.duration })
        setCurrentTime(0)
        setIsPlaying(false)
        alert('Video uploaded successfully! ✅')
      } else {
        alert('Upload failed: ' + data.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload video. Check console for details.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleAudioUpload = async (file) => {
    if (!file) return
    
    try {
      const formData = new FormData()
      formData.append('video', file)

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        const url = URL.createObjectURL(file)
        setAudio(url)
        setAudioFileName(data.file.filename)
        alert('Audio uploaded successfully! ✅')
      }
    } catch (error) {
      console.error('Audio upload error:', error)
      alert('Failed to upload audio')
    }
  }

  const handleProcessVideo = async () => {
    if (!uploadedFileName) {
      alert('Please upload a video first!')
      return
    }

    setIsProcessing(true)

    try {
      const processData = {
        inputFile: uploadedFileName,
        outputName: `processed_${Date.now()}.mp4`,
        trim: trim,
        filters: filters,
        textOverlays: textOverlays.map(text => ({
          text: text.text,
          size: text.size,
          color: text.color,
          startTime: text.startTime,
          duration: text.duration
        })),
        audioFile: audioFileName
      }

      console.log('Processing video with:', processData)

      const response = await fetch(`${API_URL}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processData),
      })

      const data = await response.json()
      console.log('Process response:', data)

      if (data.success) {
        alert('Video processed successfully! Downloading now... ✅')
        window.open(`http://localhost:5000${data.downloadUrl}`, '_blank')
      } else {
        alert('Processing failed: ' + data.error)
      }
    } catch (error) {
      console.error('Processing error:', error)
      alert('Failed to process video. Check console for details.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAddText = () => {
    const newText = {
      id: Date.now(),
      text: 'New Text',
      size: 24,
      color: '#FFFFFF',
      startTime: currentTime,
      duration: 3,
    }
    setTextOverlays([...textOverlays, newText])
    setSelectedText(newText.id)
  }

  const updateTextOverlay = (id, updates) => {
    setTextOverlays(textOverlays.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }

  const deleteTextOverlay = (id) => {
    setTextOverlays(textOverlays.filter((t) => t.id !== id))
    setSelectedText(null)
  }

  const handleFilterChange = (filterName, value) => {
    setFilters({ ...filters, [filterName]: value })
  }

  const handleAudioFileChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      handleAudioUpload(file)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-200">
      <Toolbar
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onMute={() => setIsMuted(!isMuted)}
        isMuted={isMuted}
      />

      <div className="flex flex-1 gap-0 overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center bg-black p-8">
          <Canvas
            videoSrc={video}
            currentTime={currentTime}
            filters={filters}
            textOverlays={textOverlays}
            canvasRef={canvasRef}
          />
          
          <div className="mt-5 text-center">
            <button 
              onClick={handleProcessVideo}
              disabled={!uploadedFileName || isProcessing}
              className={`px-6 py-3 text-base font-bold rounded-md transition-colors ${
                isProcessing || !uploadedFileName
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 cursor-pointer'
              } text-white`}
            >
              {isProcessing ? 'Processing Video...' : '🎬 Export Video'}
            </button>
          </div>
        </div>

        <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col overflow-hidden">
          <div className="flex border-b border-slate-700 bg-slate-900">
            <button
              className={`flex-1 px-3 py-3 text-sm border-b-2 transition-all ${
                activeTab === 'upload'
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
              onClick={() => setActiveTab('upload')}
            >
              Upload
            </button>
            <button
              className={`flex-1 px-3 py-3 text-sm border-b-2 transition-all ${
                activeTab === 'audio'
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
              onClick={() => setActiveTab('audio')}
            >
              Audio
            </button>
            <button
              className={`flex-1 px-3 py-3 text-sm border-b-2 transition-all ${
                activeTab === 'text'
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
              onClick={() => setActiveTab('text')}
            >
              Text
            </button>
            <button
              className={`flex-1 px-3 py-3 text-sm border-b-2 transition-all ${
                activeTab === 'filters'
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
              onClick={() => setActiveTab('filters')}
            >
              Filters
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'upload' && (
              <div>
                <h3 className="text-sm font-semibold uppercase text-slate-400 mb-4">Upload Video</h3>
                {isUploading && <p className="text-green-500 mb-2">Uploading...</p>}
                <FileUpload onVideoUpload={handleVideoUpload} />
                {uploadedFileName && (
                  <p className="text-green-500 mt-3 text-sm">✅ Video uploaded: {uploadedFileName}</p>
                )}
              </div>
            )}

            {activeTab === 'audio' && (
              <div>
                <h3 className="text-sm font-semibold uppercase text-slate-400 mb-4">Audio Track</h3>
                {audio ? (
                  <div className="flex flex-col gap-4">
                    <audio controls className="w-full mb-2" src={audio} />
                    <button 
                      onClick={() => { setAudio(null); setAudioFileName(null); }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
                    >
                      Remove Audio
                    </button>
                  </div>
                ) : (
                  <div 
                    className="p-8 border-2 border-dashed border-slate-700 rounded-md text-center cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => document.getElementById('audio-upload-input').click()}
                  >
                    <input
                      id="audio-upload-input"
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileChange}
                      className="hidden"
                    />
                    <p className="text-slate-500 text-sm">🎵 Choose audio file</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'text' && (
              <div>
                <h3 className="text-sm font-semibold uppercase text-slate-400 mb-4">Text Overlays</h3>
                <button 
                  onClick={handleAddText}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors mb-4"
                >
                  + Add Text
                </button>

                <div className="flex flex-col gap-3">
                  {textOverlays.map((text) => (
                    <div
                      key={text.id}
                      className={`p-3 rounded-md border cursor-pointer transition-all ${
                        selectedText === text.id
                          ? 'bg-slate-700 border-blue-500'
                          : 'bg-slate-900 border-slate-700 hover:bg-slate-800'
                      }`}
                      onClick={() => setSelectedText(text.id)}
                    >
                      <input
                        type="text"
                        value={text.text}
                        onChange={(e) => updateTextOverlay(text.id, { text: e.target.value })}
                        placeholder="Enter text"
                        className="w-full px-2 py-1 mb-2 bg-slate-800 border border-slate-700 rounded text-slate-200 text-sm"
                      />
                      <input
                        type="range"
                        min="10"
                        max="72"
                        value={text.size}
                        onChange={(e) => updateTextOverlay(text.id, { size: parseInt(e.target.value) })}
                        className="w-full mb-2 cursor-pointer"
                      />
                      <input
                        type="color"
                        value={text.color}
                        onChange={(e) => updateTextOverlay(text.id, { color: e.target.value })}
                        className="w-full h-8 border border-slate-700 rounded cursor-pointer mb-2"
                      />
                      <button 
                        onClick={() => deleteTextOverlay(text.id)}
                        className="w-full px-2 py-1 bg-red-900 hover:bg-red-800 text-red-300 rounded text-xs transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'filters' && (
              <div>
                <h3 className="text-sm font-semibold uppercase text-slate-400 mb-4">Filters & Effects</h3>
                
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-slate-300 font-medium">Brightness</label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={filters.brightness}
                      onChange={(e) => handleFilterChange('brightness', parseInt(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                    <span className="text-xs text-slate-400 text-right">{filters.brightness}%</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-slate-300 font-medium">Contrast</label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={filters.contrast}
                      onChange={(e) => handleFilterChange('contrast', parseInt(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                    <span className="text-xs text-slate-400 text-right">{filters.contrast}%</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-slate-300 font-medium">Grayscale</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.grayscale}
                      onChange={(e) => handleFilterChange('grayscale', parseInt(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                    <span className="text-xs text-slate-400 text-right">{filters.grayscale}%</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-slate-300 font-medium">Saturation</label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={filters.saturation}
                      onChange={(e) => handleFilterChange('saturation', parseInt(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                    <span className="text-xs text-slate-400 text-right">{filters.saturation}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Timeline
        duration={duration}
        currentTime={currentTime}
        onTimeChange={setCurrentTime}
        trim={trim}
        onTrimChange={setTrim}
      />

      <video
        ref={videoRef}
        src={video}
        muted={isMuted}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={(e) => {
          setDuration(e.target.duration)
          if (trim.end === null) setTrim({ start: 0, end: e.target.duration })
        }}
        className="hidden"
      />
    </div>
  )
}