import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, Upload, Type, Sparkles, Scissors, Plus, Trash2, X, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/video';

export default function VideoEditor() {
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [processedVideoUrl, setProcessedVideoUrl] = useState(null);
  
  // Editing features
  const [trim, setTrim] = useState({ start: 0, end: null });
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
  });
  const [textOverlays, setTextOverlays] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [audio, setAudio] = useState(null);
  const [audioFileName, setAudioFileName] = useState(null);
  const [clips, setClips] = useState([]);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [muteInsertedClips, setMuteInsertedClips] = useState(true);
  const [keepOriginalAudio, setKeepOriginalAudio] = useState(true);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const timelineRef = useRef(null);

  // Play/Pause control
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // Draw canvas with filters and text
  useEffect(() => {
    if (!video || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const videoElement = videoRef.current;

    const drawFrame = () => {
      if (videoElement && videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply filters
        const filterString = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) grayscale(${filters.grayscale}%)`;
        ctx.filter = filterString;

        // Draw video
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // Draw text overlays
        ctx.filter = 'none';
        textOverlays.forEach((text) => {
          if (currentTime >= text.startTime && currentTime < text.startTime + text.duration) {
            ctx.font = `bold ${text.size}px Arial`;
            ctx.fillStyle = text.color;
            ctx.textAlign = 'center';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            ctx.strokeText(text.text, text.x || canvas.width / 2, text.y || canvas.height / 2);
            ctx.fillText(text.text, text.x || canvas.width / 2, text.y || canvas.height / 2);
            
            // Draw selection box if selected
            if (selectedText === text.id) {
              const metrics = ctx.measureText(text.text);
              const textWidth = metrics.width;
              const textHeight = text.size;
              ctx.strokeStyle = '#8b5cf6';
              ctx.lineWidth = 2;
              ctx.strokeRect(
                (text.x || canvas.width / 2) - textWidth / 2 - 10,
                (text.y || canvas.height / 2) - textHeight - 5,
                textWidth + 20,
                textHeight + 10
              );
            }
          }
        });
      }
      requestAnimationFrame(drawFrame);
    };

    drawFrame();
  }, [video, filters, textOverlays, currentTime, selectedText]);

  // Video upload
  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const url = URL.createObjectURL(file);
        setVideo(url);
        setUploadedFileName(data.file.filename);
        setTrim({ start: 0, end: data.file.duration });
        setCurrentTime(0);
        setIsPlaying(false);
        alert('✅ Video uploaded successfully!');
      } else {
        alert('❌ Upload failed: ' + data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  // Audio upload
  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const url = URL.createObjectURL(file);
        setAudio(url);
        setAudioFileName(data.file.filename);
        alert('✅ Audio uploaded successfully!');
      }
    } catch (error) {
      console.error('Audio upload error:', error);
      alert('❌ Failed to upload audio');
    }
  };

  // Process and export video
  const handleExport = async () => {
    if (!uploadedFileName) {
      alert('⚠️ Please upload a video first!');
      return;
    }

    setIsProcessing(true);

    try {
      const processData = {
        inputFile: uploadedFileName,
        outputName: `edited_${Date.now()}.mp4`,
        trim: trim,
        filters: filters,
        textOverlays: textOverlays.map(text => ({
          text: text.text,
          size: text.size,
          color: text.color,
          startTime: text.startTime,
          duration: text.duration,
          x: text.x,
          y: text.y
        })),
        audioFile: audioFileName,
        clips: clips,
        keepOriginalAudio: keepOriginalAudio
      };

      const response = await fetch(`${API_URL}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processData),
      });

      const data = await response.json();

      if (data.success) {
        const fullUrl = `http://localhost:5000${data.downloadUrl}`;
        setProcessedVideoUrl(fullUrl);
        alert('✅ Video exported successfully!');
      } else {
        alert('❌ Export failed: ' + data.error);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Failed to export video');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download video
  const handleDownload = () => {
    if (!processedVideoUrl) {
      alert('⚠️ Please export the video first!');
      return;
    }
    window.open(processedVideoUrl, '_blank');
  };

  // Save to drafts
  const handleSaveToDrafts = async () => {
    if (!processedVideoUrl) {
      alert('⚠️ Please export the video first!');
      return;
    }

    try {
      const existingDrafts = JSON.parse(localStorage.getItem('videoDrafts') || '[]');
      
      const newDraft = {
        type: 'video',
        videoUrl: processedVideoUrl,
        timestamp: Date.now(),
        filters: filters,
        textOverlays: textOverlays,
        duration: duration
      };

      const updatedDrafts = [newDraft, ...existingDrafts];
      localStorage.setItem('videoDrafts', JSON.stringify(updatedDrafts));

      alert('✅ Video saved to drafts!');
      navigate('/drafts', { state: { newVideoDraft: newDraft } });
    } catch (error) {
      console.error('Error saving to drafts:', error);
      alert('❌ Failed to save to drafts');
    }
  };

  // Text overlay functions
  const handleAddText = () => {
    const newText = {
      id: Date.now(),
      text: 'Your Text Here',
      size: 36,
      color: '#FFFFFF',
      startTime: currentTime,
      duration: 5,
      x: 400,
      y: 225
    };
    setTextOverlays([...textOverlays, newText]);
    setSelectedText(newText.id);
  };

  const updateText = (id, updates) => {
    setTextOverlays(textOverlays.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteText = (id) => {
    setTextOverlays(textOverlays.filter(t => t.id !== id));
    setSelectedText(null);
  };

  // Handle canvas mouse events for dragging text
  const handleCanvasMouseDown = (e) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const ctx = canvas.getContext('2d');
    for (const text of textOverlays) {
      if (currentTime >= text.startTime && currentTime < text.startTime + text.duration) {
        ctx.font = `bold ${text.size}px Arial`;
        const metrics = ctx.measureText(text.text);
        const textWidth = metrics.width;
        const textHeight = text.size;
        const textX = text.x || canvas.width / 2;
        const textY = text.y || canvas.height / 2;

        if (x >= textX - textWidth / 2 - 10 && x <= textX + textWidth / 2 + 10 &&
            y >= textY - textHeight - 5 && y <= textY + 10) {
          setIsDraggingText(true);
          setSelectedText(text.id);
          setDragOffset({ x: x - textX, y: y - textY });
          break;
        }
      }
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDraggingText || !selectedText || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    updateText(selectedText, {
      x: x - dragOffset.x,
      y: y - dragOffset.y
    });
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingText(false);
  };

  // Split video at current time
  const handleSplitVideo = () => {
    if (!video || currentTime <= 0 || currentTime >= duration) {
      alert('⚠️ Cannot split at this position');
      return;
    }

    const newClip = {
      id: Date.now(),
      filename: uploadedFileName,
      startTime: currentTime,
      type: 'split'
    };

    setClips([...clips, newClip]);
    alert(`✅ Split created at ${formatTime(currentTime)}`);
  };

  // Insert media
  const handleInsertMedia = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const newClip = {
          id: Date.now(),
          filename: data.file.filename,
          insertAt: currentTime,
          duration: data.file.duration || 3,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          muteInsertedClip: true // Always mute inserted clips to keep original audio
        };
        setClips([...clips, newClip]);
        alert('✅ Media inserted successfully! (Will play muted with original audio)');
      }
    } catch (error) {
      console.error('Insert media error:', error);
      alert('❌ Failed to insert media');
    }
  };

  // Timeline interactions
  const handleTimelineClick = (e) => {
    if (!timelineRef.current || !duration) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Video Editor</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {processedVideoUrl && (
              <>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-md transition-all"
                >
                  <Download size={18} />
                  Download
                </button>
                <button
                  onClick={handleSaveToDrafts}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md transition-all"
                >
                  <Save size={18} />
                  Save to Drafts
                </button>
              </>
            )}
            <button
              onClick={handleExport}
              disabled={!video || isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md transition-all"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Export Video
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col p-6">
          {/* Video Canvas */}
          <div className="flex-1 flex items-center justify-center bg-black rounded-xl shadow-2xl overflow-hidden mb-6">
            {video ? (
              <canvas
                ref={canvasRef}
                width={800}
                height={450}
                className="max-w-full max-h-full cursor-move"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              />
            ) : (
              <div className="text-center">
                <label htmlFor="video-upload" className="cursor-pointer">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                    <Upload size={48} className="text-gray-400" />
                  </div>
                  <p className="text-gray-400 text-lg mb-2">Upload a video to start editing</p>
                  <p className="text-gray-500 text-sm">MP4, MOV, AVI, WebM</p>
                </label>
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Playback Controls */}
          {video && (
            <div className="bg-white rounded-xl shadow-lg p-4">
              {/* Timeline */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <div
                  ref={timelineRef}
                  onClick={handleTimelineClick}
                  className="h-2 bg-gray-200 rounded-full cursor-pointer relative overflow-hidden"
                >
                  <div
                    className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                    style={{ width: `${currentPercentage}%` }}
                  />
                  <div
                    className="absolute w-4 h-4 bg-white border-2 border-blue-600 rounded-full top-1/2 -translate-y-1/2 shadow-md"
                    style={{ left: `${currentPercentage}%`, transform: 'translate(-50%, -50%)' }}
                  />
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-10 h-10 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all"
                  title={isMuted ? "Unmute preview" : "Mute preview"}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <button
                  onClick={handleSplitVideo}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all flex items-center gap-2 font-medium"
                >
                  <Scissors size={18} />
                  Split
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Editing Tools */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          {/* Upload Section */}
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Upload size={16} />
              Upload Media
            </h3>
            <label className="block">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
              <div className="px-4 py-3 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium text-center cursor-pointer hover:bg-blue-100 transition-all border border-blue-200">
                {isUploading ? '⏳ Uploading...' : '📹 Upload Video'}
              </div>
            </label>
            {uploadedFileName && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                ✓ {uploadedFileName}
              </p>
            )}
          </div>

          {/* Text Overlays */}
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Type size={16} />
              Text Overlays
            </h3>
            <button
              onClick={handleAddText}
              disabled={!video}
              className="w-full px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-all border border-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Add Text
            </button>
            <p className="text-xs text-gray-500 mt-2">💡 Click and drag text on canvas to reposition</p>

            <div className="mt-3 space-y-2">
              {textOverlays.map((text) => (
                <div
                  key={text.id}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedText === text.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="text"
                      value={text.text}
                      onChange={(e) => updateText(text.id, { text: e.target.value })}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter text"
                    />
                    <button
                      onClick={() => deleteText(text.id)}
                      className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 w-12">Size:</span>
                      <input
                        type="range"
                        min="16"
                        max="72"
                        value={text.size}
                        onChange={(e) => updateText(text.id, { size: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-600 w-8">{text.size}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 w-12">Color:</span>
                      <input
                        type="color"
                        value={text.color}
                        onChange={(e) => updateText(text.id, { color: e.target.value })}
                        className="h-8 flex-1 rounded border border-gray-300 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 w-12">Start:</span>
                      <input
                        type="number"
                        value={text.startTime.toFixed(1)}
                        onChange={(e) => updateText(text.id, { startTime: parseFloat(e.target.value) })}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                        step="0.1"
                        min="0"
                      />
                      <span className="text-xs text-gray-600">s</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 w-12">Length:</span>
                      <input
                        type="number"
                        value={text.duration}
                        onChange={(e) => updateText(text.id, { duration: parseInt(e.target.value) })}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                        step="1"
                        min="1"
                      />
                      <span className="text-xs text-gray-600">s</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles size={16} />
              Filters & Effects
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Brightness</span>
                  <span>{filters.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.brightness}
                  onChange={(e) => setFilters({ ...filters, brightness: parseInt(e.target.value) })}
                  className="w-full"
                  disabled={!video}
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Contrast</span>
                  <span>{filters.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.contrast}
                  onChange={(e) => setFilters({ ...filters, contrast: parseInt(e.target.value) })}
                  className="w-full"
                  disabled={!video}
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Saturation</span>
                  <span>{filters.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.saturation}
                  onChange={(e) => setFilters({ ...filters, saturation: parseInt(e.target.value) })}
                  className="w-full"
                  disabled={!video}
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Grayscale</span>
                  <span>{filters.grayscale}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.grayscale}
                  onChange={(e) => setFilters({ ...filters, grayscale: parseInt(e.target.value) })}
                  className="w-full"
                  disabled={!video}
                />
              </div>
            </div>
          </div>

          {/* Audio */}
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              🎵 Audio Settings
            </h3>
            
            {/* Keep Original Audio Toggle */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepOriginalAudio}
                  onChange={(e) => setKeepOriginalAudio(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Keep Original Video Audio</span>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Original audio continues even when clips are inserted
                  </p>
                </div>
              </label>
            </div>

            {/* Background Music */}
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">Background Music:</p>
              {audio ? (
                <div className="space-y-2">
                  <audio controls className="w-full" src={audio} />
                  <button
                    onClick={() => { setAudio(null); setAudioFileName(null); }}
                    className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-all border border-red-200"
                  >
                    Remove Audio
                  </button>
                </div>
              ) : (
                <label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                  <div className="px-4 py-3 bg-green-50 text-green-600 rounded-lg text-sm font-medium text-center cursor-pointer hover:bg-green-100 transition-all border border-green-200">
                    🎵 Upload Background Music
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Insert Media & Clips */}
          <div className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Scissors size={16} />
              Insert & Split
            </h3>
            
            <label className="block mb-3">
              <input
                type="file"
                accept="video/*,image/*"
                onChange={handleInsertMedia}
                disabled={!video}
                className="hidden"
              />
              <div className="px-4 py-3 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium text-center cursor-pointer hover:bg-indigo-100 transition-all border border-indigo-200 disabled:opacity-50">
                📽️ Insert Video/Image
              </div>
            </label>

            {clips.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">Clips & Splits:</p>
                {clips.map((clip) => (
                  <div key={clip.id} className="p-2 bg-gray-50 rounded border border-gray-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">
                        {clip.type === 'split' ? '✂️ Split' : clip.type === 'image' ? '🖼️ Image' : '📽️ Video'}
                      </span>
                      <button
                        onClick={() => setClips(clips.filter(c => c.id !== clip.id))}
                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <p className="text-gray-600 mt-1">
                      {clip.type === 'split' 
                        ? `At ${formatTime(clip.startTime)}`
                        : `Insert at ${formatTime(clip.insertAt)}`
                      }
                    </p>
                    {clip.muteInsertedClip && (
                      <p className="text-green-600 text-xs mt-1">🔇 Muted (original audio continues)</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden video element */}
      <video
        ref={videoRef}
        src={video}
        muted={isMuted}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          if (trim.end === null) setTrim({ start: 0, end: e.currentTarget.duration });
        }}
        className="hidden"
      />
    </div>
  );
}