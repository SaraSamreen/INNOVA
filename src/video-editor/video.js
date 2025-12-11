import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, Upload, Type, Sparkles, Scissors, Plus, Trash2, X, Save, Film } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/video';

export default function VideoEditor() {
  const [video, setVideo] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [processedVideoUrl, setProcessedVideoUrl] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);
  const [previewSegments, setPreviewSegments] = useState([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [showInsertMenu, setShowInsertMenu] = useState(false);
  const [insertedVideoElements, setInsertedVideoElements] = useState({});
  const [insertMenuPosition, setInsertMenuPosition] = useState({ x: 0, y: 0 });
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
  const [isDraggingTrimStart, setIsDraggingTrimStart] = useState(false);
  const [isDraggingTrimEnd, setIsDraggingTrimEnd] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  const resizeCanvasToDisplaySize = (canvas) => {
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== Math.floor(width * ratio) || canvas.height !== Math.floor(height * ratio)) {
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      const ctx = canvas.getContext('2d');
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
  };

const preloadInsertedVideo = (clip) => {
  if (clip.type === 'video' && clip.filename) {
    const videoUrl = `http://localhost:5000/uploads/${clip.filename}`;
    const videoElement = document.createElement('video');
    videoElement.src = videoUrl;
    videoElement.crossOrigin = 'anonymous';
    videoElement.muted = true;
    videoElement.preload = 'auto';
    videoElement.playsInline = true; // Important for mobile
    
    videoElement.onloadedmetadata = () => {
      console.log('✅ Inserted video loaded:', clip.filename, 'duration:', videoElement.duration);
    };
    
    videoElement.onerror = (e) => {
      console.error('❌ Error loading inserted video:', clip.filename, e);
    };
    
    setInsertedVideoElements(prev => ({
      ...prev,
      [clip.id]: videoElement
    }));
  } else if (clip.type === 'image' && clip.filename) {
    const imageUrl = `http://localhost:5000/uploads/${clip.filename}`;
    const imageElement = new Image();
    imageElement.src = imageUrl;
    imageElement.crossOrigin = 'anonymous';
    
    imageElement.onload = () => {
      console.log('✅ Inserted image loaded:', clip.filename);
    };
    
    imageElement.onerror = (e) => {
      console.error('❌ Error loading inserted image:', clip.filename, e);
    };
    
    setInsertedVideoElements(prev => ({
      ...prev,
      [clip.id]: imageElement
    }));
  }
};
  const generateThumbnails = async () => {
    const videoEl = videoRef.current;
    if (!videoEl || !videoEl.duration || isNaN(videoEl.duration) || videoEl.duration === Infinity) {
      return;
    }

    setThumbnails([]);
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');

    const thumbW = 200;
    const aspect = (videoEl.videoWidth && videoEl.videoHeight) ? (videoEl.videoWidth / videoEl.videoHeight) : (16 / 9);
    const thumbH = Math.round(thumbW / aspect) || 112;
    tempCanvas.width = thumbW;
    tempCanvas.height = thumbH;

    const frames = [];
    const count = 15;
    const durationSec = videoEl.duration;

    for (let i = 0; i < count; i++) {
      const time = Math.min(durationSec, (durationSec * i) / count);
      videoEl.currentTime = time;

      await new Promise((res) => {
        const onSeeked = () => {
          try {
            ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            ctx.drawImage(videoEl, 0, 0, tempCanvas.width, tempCanvas.height);
            frames.push(tempCanvas.toDataURL('image/jpeg'));
          } catch (err) {
            frames.push('');
          }
          res();
        };
        videoEl.addEventListener('seeked', onSeeked, { once: true });
      });
    }

    setThumbnails(frames.filter(Boolean));
    if (videoEl) videoEl.currentTime = Math.min(durationSec, currentTime || 0);
  };

  useEffect(() => {
  const loadVideoFromUrl = async () => {
    const videoToEdit = localStorage.getItem('videoToEdit');
    if (videoToEdit) {
      try {
        const response = await fetch(videoToEdit);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setVideo(blobUrl);
        
        // Upload the blob to the server so we can edit it
        setIsUploading(true);
        const formData = new FormData();
        formData.append('video', blob, 'imported-video.mp4');

        const uploadResponse = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (uploadData.success) {
          setUploadedFileName(uploadData.file.filename);
          if (uploadData.file.duration) {
            setTrim({ start: 0, end: uploadData.file.duration });
            setDuration(uploadData.file.duration);
          } else {
            setTrim({ start: 0, end: null });
          }
          console.log('✅ Video imported and uploaded:', uploadData.file.filename);
        } else {
          alert('❌ Failed to upload imported video');
        }
      } catch (err) {
        console.error('Failed to load video:', err);
        alert('Failed to load video for editing');
      } finally {
        setIsUploading(false);
        localStorage.removeItem('videoToEdit');
      }
    }
  };
  
  loadVideoFromUrl();
}, []);

useEffect(() => {
  if (!video || !canvasRef.current) return;

  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  const videoElement = videoRef.current;
  let animationFrameId;
  let lastSeekTime = {}; // Track last seek time for each inserted video

  const drawFrame = () => {
    resizeCanvasToDisplaySize(canvas);

    if (videoElement && videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Check if current time is during an inserted clip
      const activeInsert = clips.find(clip => 
        (clip.type === 'video' || clip.type === 'image') &&
        currentTime >= clip.insertAt &&
        currentTime < clip.insertAt + (clip.duration || 3)
      );

      if (activeInsert) {
        const insertedElement = insertedVideoElements[activeInsert.id];
        
        if (insertedElement) {
          // Calculate the time within the inserted clip
          const clipTime = currentTime - activeInsert.insertAt;
          
          if (activeInsert.type === 'video') {
            // Only seek if the difference is significant (more than 0.3 seconds)
            const timeDiff = Math.abs(insertedElement.currentTime - clipTime);
            const needsSeek = timeDiff > 0.3;
            
            // Prevent too frequent seeking
            const now = Date.now();
            const lastSeek = lastSeekTime[activeInsert.id] || 0;
            const canSeek = (now - lastSeek) > 100; // At least 100ms between seeks
            
            if (needsSeek && canSeek) {
              insertedElement.currentTime = clipTime;
              lastSeekTime[activeInsert.id] = now;
            }
            
            // Sync play state
            if (isPlaying && insertedElement.paused) {
              insertedElement.play().catch(e => console.log('Play failed:', e));
            } else if (!isPlaying && !insertedElement.paused) {
              insertedElement.pause();
            }
            
            // Draw the inserted video
            if (insertedElement.readyState >= 2) {
              try {
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
                
                // Calculate aspect ratio to fit video
                const canvasW = canvas.width / (window.devicePixelRatio || 1);
                const canvasH = canvas.height / (window.devicePixelRatio || 1);
                
                // Safety check for video dimensions
                if (insertedElement.videoWidth && insertedElement.videoHeight) {
                  const videoAspect = insertedElement.videoWidth / insertedElement.videoHeight;
                  const canvasAspect = canvasW / canvasH;
                  
                  let drawW, drawH, drawX, drawY;
                  if (videoAspect > canvasAspect) {
                    drawW = canvasW;
                    drawH = canvasW / videoAspect;
                    drawX = 0;
                    drawY = (canvasH - drawH) / 2;
                  } else {
                    drawH = canvasH;
                    drawW = canvasH * videoAspect;
                    drawX = (canvasW - drawW) / 2;
                    drawY = 0;
                  }
                  
                  ctx.drawImage(insertedElement, drawX, drawY, drawW, drawH);
                } else {
                  // Fallback to full canvas if dimensions not available
                  ctx.drawImage(insertedElement, 0, 0, canvasW, canvasH);
                }
              } catch (err) {
                console.error('Error drawing inserted video:', err);
              }
            } else {
              // Show loading state
              ctx.fillStyle = '#1a1d29';
              ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
              
              ctx.fillStyle = '#c3d5ef';
              ctx.font = 'bold 24px Arial';
              ctx.textAlign = 'center';
              const centerX = (canvas.width / (window.devicePixelRatio || 1)) / 2;
              const centerY = (canvas.height / (window.devicePixelRatio || 1)) / 2;
              ctx.fillText('⏳ LOADING VIDEO...', centerX, centerY);
            }
          } else if (activeInsert.type === 'image') {
            // Draw the inserted image
            if (insertedElement.complete) {
              try {
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
                
                // Calculate aspect ratio to fit image
                const canvasW = canvas.width / (window.devicePixelRatio || 1);
                const canvasH = canvas.height / (window.devicePixelRatio || 1);
                const imgAspect = insertedElement.width / insertedElement.height;
                const canvasAspect = canvasW / canvasH;
                
                let drawW, drawH, drawX, drawY;
                if (imgAspect > canvasAspect) {
                  drawW = canvasW;
                  drawH = canvasW / imgAspect;
                  drawX = 0;
                  drawY = (canvasH - drawH) / 2;
                } else {
                  drawH = canvasH;
                  drawW = canvasH * imgAspect;
                  drawX = (canvasW - drawW) / 2;
                  drawY = 0;
                }
                
                ctx.drawImage(insertedElement, drawX, drawY, drawW, drawH);
              } catch (err) {
                console.error('Error drawing inserted image:', err);
              }
            } else {
              // Show loading state for image
              ctx.fillStyle = '#1a1d29';
              ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
              
              ctx.fillStyle = '#c3d5ef';
              ctx.font = 'bold 24px Arial';
              ctx.textAlign = 'center';
              const centerX = (canvas.width / (window.devicePixelRatio || 1)) / 2;
              const centerY = (canvas.height / (window.devicePixelRatio || 1)) / 2;
              ctx.fillText('⏳ LOADING IMAGE...', centerX, centerY);
            }
          }
        } else {
          // Show placeholder if media not loaded yet
          ctx.fillStyle = '#1a1d29';
          ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
          
          ctx.fillStyle = '#c3d5ef';
          ctx.font = 'bold 32px Arial';
          ctx.textAlign = 'center';
          const centerX = (canvas.width / (window.devicePixelRatio || 1)) / 2;
          const centerY = (canvas.height / (window.devicePixelRatio || 1)) / 2;
          
          const icon = activeInsert.type === 'image' ? '🖼️' : '🎬';
          ctx.fillText(icon, centerX, centerY - 40);
          ctx.font = 'bold 24px Arial';
          ctx.fillText('LOADING...', centerX, centerY + 10);
          ctx.font = '16px Arial';
          ctx.fillStyle = '#7da3cc';
          ctx.fillText(activeInsert.filename, centerX, centerY + 40);
        }
      } else {
        // Pause all inserted videos when not active
        Object.values(insertedVideoElements).forEach(el => {
          if (el.pause && !el.paused) {
            el.pause();
          }
        });
        
        // Draw normal video frame
        const filterString = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) grayscale(${filters.grayscale}%)`;
        ctx.filter = filterString;

        try {
          ctx.drawImage(videoElement, 0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
        } catch (err) {
          // ignore if draw fails
        }

        ctx.filter = 'none';
      }

      // Draw text overlays
      textOverlays.forEach((text) => {
        if (currentTime >= text.startTime) {
          const fontWeight = text.bold ? 'bold' : 'normal';
          const fontStyle = text.italic ? 'italic' : 'normal';
          const fontFamily = text.fontFamily || 'Arial';
          ctx.font = `${fontStyle} ${fontWeight} ${text.size}px ${fontFamily}`;
          ctx.fillStyle = text.color;
          ctx.textAlign = 'center';
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 3;
          const x = text.x ?? (canvas.width / (window.devicePixelRatio || 1) / 2);
          const y = text.y ?? (canvas.height / (window.devicePixelRatio || 1) / 2);
          ctx.strokeText(text.text, x, y);
          ctx.fillText(text.text, x, y);
          
          if (selectedText === text.id) {
            const metrics = ctx.measureText(text.text);
            const textWidth = metrics.width;
            const textHeight = text.size;
            ctx.strokeStyle = '#7da3cc';
            ctx.lineWidth = 2;
            ctx.strokeRect(x - textWidth / 2 - 10, y - textHeight - 5, textWidth + 20, textHeight + 10);
          }
        }
      });
    }
    animationFrameId = requestAnimationFrame(drawFrame);
  };

  drawFrame();
  
  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  };
}, [video, filters, textOverlays, currentTime, selectedText, clips, insertedVideoElements, isPlaying]);

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
        if (data.file.duration) {
          setTrim({ start: 0, end: data.file.duration });
          setDuration(data.file.duration);
        } else {
          setTrim({ start: 0, end: null });
        }
        setCurrentTime(0);
        setIsPlaying(false);
        
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
  x: text.x,
  y: text.y,
  bold: text.bold || false,
  italic: text.italic || false,
  fontFamily: text.fontFamily || 'Arial'
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

  const handleDownload = () => {
    if (!processedVideoUrl) {
      alert('⚠️ Please export the video first!');
      return;
    }
    window.open(processedVideoUrl, '_blank');
  };

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
    } catch (error) {
      console.error('Error saving to drafts:', error);
      alert('❌ Failed to save to drafts');
    }
  };

  const handleAddText = () => {
    const newText = {
  id: Date.now(),
  text: 'Your Text Here',
  size: 36,
  color: '#FFFFFF',
  startTime: currentTime,
  x: 400,
  y: 225,
  bold: false,
  italic: false,
  fontFamily: 'Arial'
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

  const handleCanvasMouseDown = (e) => {
  if (!canvasRef.current) return;
  
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const scaleX = (canvas.width / (window.devicePixelRatio || 1)) / rect.width;
  const scaleY = (canvas.height / (window.devicePixelRatio || 1)) / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  const ctx = canvas.getContext('2d');
  for (const text of textOverlays) {
    if (currentTime >= text.startTime) {  // ← FIXED: removed duration check
      const fontWeight = text.bold ? 'bold' : 'normal';
      const fontStyle = text.italic ? 'italic' : 'normal';
      const fontFamily = text.fontFamily || 'Arial';
      ctx.font = `${fontStyle} ${fontWeight} ${text.size}px ${fontFamily}`;
        const metrics = ctx.measureText(text.text);
        const textWidth = metrics.width;
        const textHeight = text.size;
        const textX = text.x ?? ((canvas.width / (window.devicePixelRatio || 1)) / 2);
        const textY = text.y ?? ((canvas.height / (window.devicePixelRatio || 1)) / 2);

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
    const scaleX = (canvas.width / (window.devicePixelRatio || 1)) / rect.width;
    const scaleY = (canvas.height / (window.devicePixelRatio || 1)) / rect.height;
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
        muteInsertedClip: true
      };
      setClips([...clips, newClip]);
      
      // Preload the inserted media
      preloadInsertedVideo(newClip);
      
      alert('✅ Media inserted successfully!');
    }
  } catch (error) {
    console.error('Insert media error:', error);
    alert('❌ Failed to insert media');
  }
};

const handleTimelineClick = (e) => {
  if (!timelineRef.current || !duration || isDraggingTrimStart || isDraggingTrimEnd) return;
  
  const rect = timelineRef.current.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const percentage = clickX / rect.width;
  const newTime = percentage * duration;
  setCurrentTime(newTime);
  if (videoRef.current) {
    videoRef.current.currentTime = newTime;
  }
};

const handleTimelineRightClick = (e) => {
    e.preventDefault();
    if (!timelineRef.current || !duration || isDraggingTrimStart || isDraggingTrimEnd) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    setShowInsertMenu(true);
    setInsertMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const handleTrimStartMouseDown = (e) => {
    e.stopPropagation();
    setIsDraggingTrimStart(true);
  };

  const handleTrimEndMouseDown = (e) => {
    e.stopPropagation();
    setIsDraggingTrimEnd(true);
  };

  const handleTimelineMouseMove = (e) => {
    if (!timelineRef.current || !duration) return;

    if (isDraggingTrimStart || isDraggingTrimEnd) {
      const rect = timelineRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = percentage * duration;

      if (isDraggingTrimStart) {
        setTrim(prev => {
          const endVal = (prev.end == null) ? duration : prev.end;
          const startVal = Math.max(0, Math.min(newTime, endVal - 0.1));
          return { ...prev, start: startVal };
        });
      } else if (isDraggingTrimEnd) {
        setTrim(prev => {
          const startVal = prev.start || 0;
          const endVal = Math.max(startVal + 0.1, Math.min(newTime, duration));
          return { ...prev, end: endVal };
        });
      }
    }
  };

  const handleTimelineMouseUp = () => {
    setIsDraggingTrimStart(false);
    setIsDraggingTrimEnd(false);
  };

  useEffect(() => {
  const handleClickOutside = () => setShowInsertMenu(false);
  if (showInsertMenu) {
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }
}, [showInsertMenu]);

  useEffect(() => {
    if (isDraggingTrimStart || isDraggingTrimEnd) {
      window.addEventListener('mousemove', handleTimelineMouseMove);
      window.addEventListener('mouseup', handleTimelineMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleTimelineMouseMove);
        window.removeEventListener('mouseup', handleTimelineMouseUp);
      };
    }
  }, [isDraggingTrimStart, isDraggingTrimEnd, duration]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentPercentage = duration ? (currentTime / duration) * 100 : 0;
  const trimStartPercentage = duration ? (trim.start / duration) * 100 : 0;
  const trimEndPercentage = duration && trim.end ? (trim.end / duration) * 100 : 100;

  return (
    <div className="min-h-screen bg-[#1a1d29] flex flex-col">
      <div className="bg-[#232734] border-b border-[#2d3142] px-6 py-3 shadow-lg">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#c3d5ef] rounded-lg flex items-center justify-center shadow-md">
              <Film className="text-[#1a1d29]" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Professional Video Editor</h1>
              <p className="text-xs text-gray-400">Create, Edit, Export</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {processedVideoUrl && (
              <>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-md transition-all text-sm"
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  onClick={handleSaveToDrafts}
                  className="flex items-center gap-2 px-4 py-2 bg-[#7da3cc] text-white rounded-lg hover:bg-[#6a92bb] font-medium shadow-md transition-all text-sm"
                >
                  <Save size={16} />
                  Save
                </button>
              </>
            )}
            <button
              onClick={handleExport}
              disabled={!video || isProcessing}
              className="flex items-center gap-2 px-5 py-2 bg-[#c3d5ef] text-[#1a1d29] rounded-lg hover:bg-[#b2c8e6] disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md transition-all text-sm"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1a1d29]"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Export Video
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-4">
          {!video ? (
            <div className="flex-1 flex items-center justify-center bg-black rounded-lg shadow-2xl overflow-hidden mb-4 border border-[#2d3142]">
              <div className="text-center">
                <label htmlFor="video-upload" className="cursor-pointer">
                  <div className="w-28 h-28 mx-auto mb-4 bg-[#232734] rounded-full flex items-center justify-center border-2 border-[#c3d5ef] hover:border-[#b2c8e6] transition-all">
                    <Upload size={40} className="text-[#c3d5ef]" />
                  </div>
                  <p className="text-gray-300 text-lg mb-2 font-medium">Upload a video to start editing</p>
                  <p className="text-gray-500 text-sm">MP4, MOV, AVI, WebM supported</p>
                </label>
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center bg-black rounded-lg shadow-2xl overflow-hidden mb-4 border border-[#2d3142] p-4" style={{ height: '60vh' }}>
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
              </div>

              <div className="bg-[#232734] rounded-lg shadow-lg p-4 border border-[#2d3142]">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-[#1a1d29] px-4 py-2 rounded-lg border border-[#2d3142]">
                    <span className="text-white font-mono text-lg">{formatTime(currentTime)}</span>
                  </div>
                </div>

                <div className="relative mb-4">
  <div className="flex justify-between text-xs text-gray-400 mb-2 px-2">
    <span>{formatTime(trim.start)}</span>
    <span>{formatTime(trim.end || duration)}</span>
  </div>

  <div className="relative bg-[#1a1d29] rounded-lg border-2 border-[#2d3142] overflow-hidden" style={{ height: '120px' }}>
    <div
      ref={timelineRef}
      onClick={handleTimelineClick}
      onContextMenu={handleTimelineClick}
      className="absolute inset-0 flex cursor-pointer"
      style={{
        background: `linear-gradient(90deg, 
          rgba(195, 213, 239, 0.1) 0%, 
          rgba(195, 213, 239, 0.15) ${trimStartPercentage}%,
          rgba(195, 213, 239, 0.3) ${trimStartPercentage}%,
          rgba(195, 213, 239, 0.3) ${trimEndPercentage}%,
          rgba(195, 213, 239, 0.15) ${trimEndPercentage}%,
          rgba(195, 213, 239, 0.1) 100%)`
      }}
    >
      <div className="flex w-full h-full items-center">
        {thumbnails.length > 0 ? thumbnails.map((thumb, i) => (
          <img
            key={i}
            src={thumb}
            alt={`thumb-${i}`}
            className="flex-1 h-full object-cover border-r border-[#2d3142]"
          />
        )) : (
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex-1 h-full bg-[#111214] border-r border-[#2d3142]" />
          ))
        )}
      </div>

      {/* Render clip insertion markers with enhanced visibility */}
      {clips.map((clip) => {
        if (clip.type === 'split') {
          const splitPercentage = duration ? ((clip.startTime / duration) * 100) : 0;
          return (
            <div
              key={clip.id}
              className="absolute top-0 bottom-0 w-1 bg-yellow-500 z-15 pointer-events-none"
              style={{ left: `${splitPercentage}%` }}
              title={`Split at ${formatTime(clip.startTime)}`}
            >
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-yellow-500">
                <Scissors size={16} />
              </div>
            </div>
          );
        }
        
        if (clip.type === 'video' || clip.type === 'image') {
          const insertPercentage = duration ? ((clip.insertAt / duration) * 100) : 0;
          const clipDuration = clip.duration || 3;
          const clipWidthPercentage = duration ? ((clipDuration / duration) * 100) : 2;
          
          return (
            <div
              key={clip.id}
              className="absolute top-0 bottom-0 z-15 pointer-events-none overflow-hidden"
              style={{ 
                left: `${insertPercentage}%`,
                width: `${Math.max(clipWidthPercentage, 3)}%`,
                background: 'linear-gradient(135deg, rgba(125, 163, 204, 0.9) 0%, rgba(90, 138, 184, 0.9) 100%)',
                border: '3px solid #c3d5ef',
                boxShadow: '0 0 20px rgba(195, 213, 239, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)'
              }}
              title={`${clip.type === 'image' ? 'Image' : 'Video'} Insert: ${clip.filename}`}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-[1px]">
                <div className="text-4xl mb-1 filter drop-shadow-lg">{clip.type === 'image' ? '🖼️' : '🎬'}</div>
                <div className="text-white text-xs font-bold text-center px-1 drop-shadow-md">
                  {clip.type === 'image' ? 'IMAGE' : 'VIDEO'}
                </div>
                <div className="text-white text-[10px] font-semibold mt-1 bg-[#1a1d29] bg-opacity-50 px-2 py-0.5 rounded">
                  {formatTime(clipDuration)}
                </div>
              </div>
              {/* Animated border pulse effect */}
              <div className="absolute inset-0 border-2 border-white opacity-50 animate-pulse"></div>
              {/* Top label */}
              <div className="absolute top-0 left-0 right-0 text-[9px] bg-[#c3d5ef] text-[#1a1d29] text-center font-bold py-0.5 tracking-wider">
                INSERTED CLIP
              </div>
            </div>
          );
        }
        return null;
      })}

      {/* Trim handles */}
      <div
        onMouseDown={handleTrimStartMouseDown}
        className="absolute top-0 bottom-0 w-3 bg-[#c3d5ef] cursor-ew-resize hover:w-4 transition-all z-10 flex items-center justify-center"
        style={{ left: `${trimStartPercentage}%` }}
        title="Drag to trim start"
      >
        <div className="w-1 h-8 bg-white rounded-full"></div>
      </div>

      <div
        onMouseDown={handleTrimEndMouseDown}
        className="absolute top-0 bottom-0 w-3 bg-[#c3d5ef] cursor-ew-resize hover:w-4 transition-all z-10 flex items-center justify-center"
        style={{ left: `${trimEndPercentage}%`, transform: 'translateX(-100%)' }}
        title="Drag to trim end"
      >
        <div className="w-1 h-8 bg-white rounded-full"></div>
      </div>

      {/* Playhead */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
        style={{ left: `${currentPercentage}%` }}
      >
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-lg"></div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-lg"></div>
      </div>
    </div>
  </div>

  <div className="flex justify-between text-xs text-gray-500 mt-1 px-2">
    {Array.from({ length: 11 }).map((_, i) => (
      <span key={i}>{formatTime((duration / 10) * i)}</span>
    ))}
  </div>
</div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-12 h-12 bg-[#c3d5ef] text-[#1a1d29] rounded-full flex items-center justify-center hover:bg-[#b2c8e6] transition-all shadow-lg"
                    >
                      {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
                    </button>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="w-10 h-10 bg-[#2d3142] text-gray-300 rounded-full flex items-center justify-center hover:bg-[#3a3f52] transition-all"
                      title={isMuted ? "Unmute preview" : "Mute preview"}
                    >
                      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSplitVideo}
                      className="flex items-center gap-2 px-4 py-2 bg-[#c3d5ef] text-[#1a1d29] rounded-lg text-sm font-medium hover:bg-[#b2c8e6] transition-all shadow-md"
                    >
                      <Scissors size={16} />
                      Split
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div><div className="w-80 bg-[#232734] border-l border-[#2d3142] overflow-y-auto">
          <div className="p-4 border-b border-[#2d3142]">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Upload size={16} className="text-[#c3d5ef]" />
              Upload Media
            </h3>
            <label className="block">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
              <div className="px-4 py-2.5 bg-[#c3d5ef] bg-opacity-20 text-[#c3d5ef] rounded-lg text-sm font-medium text-center cursor-pointer hover:bg-opacity-30 transition-all border border-[#c3d5ef]">
                {isUploading ? '⏳ Uploading...' : '📹 Upload Video'}
              </div>
            </label>
            {uploadedFileName && (
              <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                ✓ {uploadedFileName}
              </p>
            )}
          </div>

          <div className="p-4 border-b border-[#2d3142]">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Type size={16} className="text-[#c3d5ef]" />
              Text Overlays
            </h3>
            <button
              onClick={handleAddText}
              disabled={!video}
              className="w-full px-4 py-2 bg-[#c3d5ef] bg-opacity-20 text-[#c3d5ef] rounded-lg text-sm font-medium hover:bg-opacity-30 transition-all border border-[#c3d5ef] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Add Text
            </button>
            <p className="text-xs text-gray-500 mt-2">💡 Drag text on canvas to move</p>

            <div className="mt-3 space-y-2">
              {textOverlays.map((text) => (
                <div
                  key={text.id}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedText === text.id
                      ? 'border-[#c3d5ef] bg-[#c3d5ef] bg-opacity-10'
                      : 'border-[#2d3142] bg-[#1a1d29] hover:border-[#3a3f52]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="text"
                      value={text.text}
                      onChange={(e) => updateText(text.id, { text: e.target.value })}
                      className="flex-1 px-2 py-1 text-sm bg-[#232734] text-white border border-[#2d3142] rounded focus:ring-2 focus:ring-[#c3d5ef] focus:border-transparent"
                      placeholder="Enter text"
                    />
                    <button
                      onClick={() => deleteText(text.id)}
                      className="ml-2 p-1 text-red-400 hover:bg-red-900 hover:bg-opacity-30 rounded transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-12">Size:</span>
                      <input
                        type="range"
                        min="16"
                        max="72"
                        value={text.size}
                        onChange={(e) => updateText(text.id, { size: parseInt(e.target.value) })}
                        className="flex-1 accent-[#c3d5ef]"
                      />
                      <span className="text-xs text-gray-400 w-8">{text.size}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-12">Color:</span>
                      <input
                        type="color"
                        value={text.color}
                        onChange={(e) => updateText(text.id, { color: e.target.value })}
                        className="h-8 flex-1 rounded border border-[#2d3142] cursor-pointer"
                      />
                    </div>

                   <div className="flex items-center gap-2">
  <span className="text-xs text-gray-400 w-12">Start:</span>
  <input
    type="number"
    value={text.startTime.toFixed(1)}
    onChange={(e) => updateText(text.id, { startTime: parseFloat(e.target.value) })}
    className="flex-1 px-2 py-1 text-xs bg-[#232734] text-white border border-[#2d3142] rounded"
    step="0.1"
    min="0"
  />
  <span className="text-xs text-gray-400">s</span>
</div>

<div className="flex items-center gap-2">
  <span className="text-xs text-gray-400 w-16">Font:</span>
  <select
    value={text.fontFamily || 'Arial'}
    onChange={(e) => updateText(text.id, { fontFamily: e.target.value })}
    className="flex-1 px-2 py-1 text-xs bg-[#232734] text-white border border-[#2d3142] rounded"
  >
    <option value="Arial">Arial</option>
    <option value="Roboto">Roboto</option>
    <option value="Playfair Display">Playfair Display</option>
    <option value="Montserrat">Montserrat</option>
    <option value="Open Sans">Open Sans</option>
    <option value="Lato">Lato</option>
  </select>
</div>

<div className="flex items-center gap-3">
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={text.bold || false}
      onChange={(e) => updateText(text.id, { bold: e.target.checked })}
      className="w-4 h-4 accent-[#c3d5ef]"
    />
    <span className="text-xs text-gray-400 font-bold">Bold</span>
  </label>
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={text.italic || false}
      onChange={(e) => updateText(text.id, { italic: e.target.checked })}
      className="w-4 h-4 accent-[#c3d5ef]"
    />
    <span className="text-xs text-gray-400 italic">Italic</span>
  </label>
</div>

                    
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-b border-[#2d3142]">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-[#c3d5ef]" />
              Filters & Effects
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Brightness</span>
                  <span>{filters.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.brightness}
                  onChange={(e) => setFilters({ ...filters, brightness: parseInt(e.target.value) })}
                  className="w-full accent-[#c3d5ef]"
                  disabled={!video}
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Contrast</span>
                  <span>{filters.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.contrast}
                  onChange={(e) => setFilters({ ...filters, contrast: parseInt(e.target.value) })}
                  className="w-full accent-[#c3d5ef]"
                  disabled={!video}
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Saturation</span>
                  <span>{filters.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.saturation}
                  onChange={(e) => setFilters({ ...filters, saturation: parseInt(e.target.value) })}
                  className="w-full accent-[#c3d5ef]"
                  disabled={!video}
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Grayscale</span>
                  <span>{filters.grayscale}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.grayscale}
                  onChange={(e) => setFilters({ ...filters, grayscale: parseInt(e.target.value) })}
                  className="w-full accent-[#c3d5ef]"
                  disabled={!video}
                />
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-[#2d3142]">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Volume2 size={16} className="text-[#c3d5ef]" />
              Audio Track
            </h3>
            
            <div className="mb-4 p-3 bg-[#1a1d29] rounded-lg border border-[#2d3142]">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepOriginalAudio}
                  onChange={(e) => setKeepOriginalAudio(e.target.checked)}
                  className="w-4 h-4 accent-[#c3d5ef]"
                />
                <div>
                  <span className="text-sm font-medium text-white">Keep Original Audio</span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Preserve video's original audio track
                  </p>
                </div>
              </label>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-300 mb-2">Add Background Music:</p>
              {audio ? (
                <div className="space-y-2">
                  <audio controls className="w-full" src={audio} />
                  <button
                    onClick={() => { setAudio(null); setAudioFileName(null); }}
                    className="w-full px-3 py-2 bg-red-900 bg-opacity-30 text-red-400 rounded-lg text-sm hover:bg-opacity-40 transition-all border border-red-800"
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
                  <div className="px-4 py-2.5 bg-[#c3d5ef] bg-opacity-20 text-[#c3d5ef] rounded-lg text-sm font-medium text-center cursor-pointer hover:bg-opacity-30 transition-all border border-[#c3d5ef]">
                    🎵 Upload Audio
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Plus size={16} className="text-[#c3d5ef]" />
              Insert Media
            </h3>
            
            <label className="block mb-3">
              <input
                type="file"
                accept="video/*,image/*"
                onChange={handleInsertMedia}
                disabled={!video}
                className="hidden"
              />
              <div className="px-4 py-2.5 bg-[#c3d5ef] bg-opacity-20 text-[#c3d5ef] rounded-lg text-sm font-medium text-center cursor-pointer hover:bg-opacity-30 transition-all border border-[#c3d5ef] disabled:opacity-50">
                📎 Insert Video
              </div>
            </label>

            {clips.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-300">Clips & Splits:</p>
                {clips.map((clip) => (
                  <div key={clip.id} className="p-3 bg-[#1a1d29] rounded-lg border border-[#2d3142] text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium">
                        {clip.type === 'split' ? '✂️ Split' : 
                         clip.type === 'image' ? '🖼️ Image' : '🎬 Video'}
                      </span>
                      <button
  onClick={() => {
    // Clean up the video element
    if (insertedVideoElements[clip.id]) {
      const element = insertedVideoElements[clip.id];
      if (element.pause) {
        element.pause();
        element.src = '';
      }
      const newElements = { ...insertedVideoElements };
      delete newElements[clip.id];
      setInsertedVideoElements(newElements);
    }
    setClips(clips.filter(c => c.id !== clip.id));
  }}
  className="text-red-400 hover:bg-red-900 hover:bg-opacity-30 p-1 rounded transition-all"
>
  <X size={12} />
</button>
                    </div>
                    <p className="text-gray-400">
                      {clip.type === 'split' 
                        ? `Split at ${formatTime(clip.startTime)}`
                        : `Insert at ${formatTime(clip.insertAt)}`
                      }
                    </p>
                    {clip.muteInsertedClip && (
                      <p className="text-green-400 text-xs mt-1">🔇 Muted (keeps original audio)</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <video
        ref={videoRef}
        src={video}
        muted={isMuted}
        onTimeUpdate={(e) => {
  const time = e.currentTarget.currentTime;
  setCurrentTime(time);
  
  // Stop video when it reaches trim end
  if (trim.end && time >= trim.end) {
    e.currentTarget.pause();
    setIsPlaying(false);
    e.currentTarget.currentTime = trim.end;
  }
  
  // Skip to trim start if before it
  if (time < trim.start) {
    e.currentTarget.currentTime = trim.start;
  }
}}
        onLoadedMetadata={(e) => {
          const dur = e.currentTarget.duration;
          setDuration(dur || 0);
          setTrim(prev => ({ start: 0, end: prev.end === null ? dur || 0 : prev.end }));
          // Generate thumbnails after metadata loads
          generateThumbnails().catch(err => console.warn('Thumbnail gen failed', err));
        }}
        className="hidden"
      />
    </div>
  );
}