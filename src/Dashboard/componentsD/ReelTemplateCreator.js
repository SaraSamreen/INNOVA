import { useState, useRef, useEffect } from "react";
import { Upload, Play, Pause, Music, Download, X, Wand2, Type, Image, Trash2, Save, Loader } from "lucide-react";
import { supabase } from '../../supabaseClient';

export default function ReelTemplateCreator() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedAudio, setUploadedAudio] = useState(null);
  const [text, setText] = useState("");
  const [textPosition, setTextPosition] = useState("center");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftError, setDraftError] = useState(null);
  const [draftSuccess, setDraftSuccess] = useState(false);
  
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const templates = [
    {
      id: 1,
      name: "Slide Show",
      description: "Images slide left to right alternating",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      layout: "slide-alternate"
    },
    {
      id: 2,
      name: "Grid Collage",
      description: "Images appear in grid pattern",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      layout: "grid"
    },
    {
      id: 3,
      name: "Zoom Stack",
      description: "Images stack with zoom effect",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      layout: "zoom-stack"
    },
  ];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (uploadedImages.length + files.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedAudio(reader.result);
      if (audioRef.current) {
        audioRef.current.load();
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Auto-cycle through images for preview
  useEffect(() => {
    if (uploadedImages.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % uploadedImages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [uploadedImages.length]);

  // Save to Drafts Function
  const saveToDrafts = async () => {
    // Get user from localStorage (MongoDB user)
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    console.log('📦 Raw userData from localStorage:', userData);
    
    if (!userData || !token) {
      setDraftError('Please log in to save drafts');
      return;
    }

    let user, userId;
    try {
      user = JSON.parse(userData);
      console.log('🔍 Parsed user object:', user);
      
      // Try to get user ID from user object (check all possible fields)
      userId = user._id || user.id || user.userId;
      
      // If not in user object, decode from JWT token
      if (!userId && token) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const decoded = JSON.parse(jsonPayload);
          userId = decoded.userId || decoded.id || decoded._id;
          console.log('🔓 Decoded user ID from token:', userId);
        } catch (decodeErr) {
          console.error('Failed to decode token:', decodeErr);
        }
      }
      
      console.log('🆔 Final User ID:', userId);
      
      if (!userId) {
        console.error('❌ User object:', user);
        throw new Error('User ID not found in user data or token');
      }
    } catch (err) {
      console.error('❌ Error details:', err);
      setDraftError(`Invalid user session: ${err.message}. Please log in again.`);
      return;
    }

    if (!selectedTemplate || uploadedImages.length === 0) {
      setDraftError('Please select a template and add at least one image');
      return;
    }

    try {
      setSavingDraft(true);
      setDraftError(null);
      setDraftSuccess(false);

      // Create canvas to generate image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      canvas.width = 1080;
      canvas.height = 1920;

      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      const colors = selectedTemplate.gradient.match(/#[0-9a-f]{6}/gi);
      if (colors) {
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw first image
      const img = new window.Image();
      img.src = uploadedImages[0];
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      
      ctx.globalAlpha = 0.8;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      ctx.globalAlpha = 1.0;

      // Draw text
      if (text) {
        ctx.font = "bold 80px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.textAlign = "center";
        
        const yPos = textPosition === "top" ? 200 : textPosition === "center" ? canvas.height / 2 : canvas.height - 200;
        
        ctx.strokeText(text, canvas.width / 2, yPos);
        ctx.fillText(text, canvas.width / 2, yPos);
      }

      // Convert canvas to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

      // Upload to Supabase Storage
      const timestamp = Date.now();
      const storagePath = `${userId}/images/${timestamp}.png`;

      const { error: uploadError } = await supabase.storage
        .from('drafts')
        .upload(storagePath, blob, {
          contentType: 'image/png',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('drafts')
        .getPublicUrl(storagePath);

      // Save metadata to database
      const draft = {
        user_id: userId.toString(), // Ensure it's a string
        type: 'image',
        media_url: publicUrl,
        storage_path: storagePath,
        timestamp: Date.now(),
        created_at: new Date().toISOString(),
        duration: null,
        text_overlays: text ? [{ text, position: textPosition }] : [],
        filters: {
          template: selectedTemplate.name,
          imageCount: uploadedImages.length
        }
      };

      console.log('📝 Draft object to insert:', draft);

      const { data: insertData, error: insertError } = await supabase
        .from('drafts')
        .insert([draft])
        .select();

      if (insertError) {
        console.error('❌ Insert error:', insertError);
        throw insertError;
      }
      
      console.log('✅ Draft saved successfully:', insertData);

      setDraftSuccess(true);
      setTimeout(() => setDraftSuccess(false), 3000);

    } catch (err) {
      console.error('Error saving draft:', err);
      setDraftError(`Failed to save: ${err.message}`);
    } finally {
      setSavingDraft(false);
    }
  };

  const renderTemplateLayout = () => {
    if (!selectedTemplate || uploadedImages.length === 0) {
      return (
        <div className="absolute inset-0 flex items-center justify-center text-white text-center p-8">
          <div>
            <p className="text-xl font-semibold mb-2">Choose a template and add images</p>
            <p className="text-sm opacity-75">Upload up to 5 photos to see the magic!</p>
          </div>
        </div>
      );
    }

    const layout = selectedTemplate.layout;

    // Template 1: Slide Show - Images slide left to right alternating
    if (layout === "slide-alternate") {
      const isEven = currentImageIndex % 2 === 0;
      return (
        <div className="absolute inset-0 overflow-hidden">
          <img 
            key={currentImageIndex}
            src={uploadedImages[currentImageIndex]} 
            className={`w-full h-full object-cover transition-all duration-700 ${
              isEven ? 'animate-slide-in-left' : 'animate-slide-in-right'
            }`}
            style={{
              animation: isEven 
                ? 'slideInLeft 0.7s ease-out' 
                : 'slideInRight 0.7s ease-out'
            }}
            alt="Slide"
          />
          <style>{`
            @keyframes slideInLeft {
              from { transform: translateX(-100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      );
    }

    // Template 2: Grid Collage - Shows multiple images in grid
    if (layout === "grid") {
      const displayImages = uploadedImages.slice(0, 5);
      
      if (displayImages.length === 1) {
        return (
          <div className="absolute inset-0 p-4">
            <img src={displayImages[0]} className="w-full h-full object-cover rounded-lg" alt="Grid 1" />
          </div>
        );
      }
      
      if (displayImages.length === 2) {
        return (
          <div className="absolute inset-0 p-4 flex gap-2">
            <img src={displayImages[0]} className="w-1/2 h-full object-cover rounded-lg" alt="Grid 1" />
            <img src={displayImages[1]} className="w-1/2 h-full object-cover rounded-lg" alt="Grid 2" />
          </div>
        );
      }
      
      if (displayImages.length === 3) {
        return (
          <div className="absolute inset-0 p-4 flex flex-col gap-2">
            <img src={displayImages[0]} className="w-full h-1/2 object-cover rounded-lg" alt="Grid 1" />
            <div className="flex gap-2 h-1/2">
              <img src={displayImages[1]} className="w-1/2 h-full object-cover rounded-lg" alt="Grid 2" />
              <img src={displayImages[2]} className="w-1/2 h-full object-cover rounded-lg" alt="Grid 3" />
            </div>
          </div>
        );
      }
      
      if (displayImages.length === 4) {
        return (
          <div className="absolute inset-0 p-4 grid grid-cols-2 gap-2">
            {displayImages.map((img, i) => (
              <img key={i} src={img} className="w-full h-full object-cover rounded-lg" alt={`Grid ${i+1}`} />
            ))}
          </div>
        );
      }
      
      // 5 images
      return (
        <div className="absolute inset-0 p-4 flex flex-col gap-2">
          <div className="flex gap-2 h-1/2">
            <img src={displayImages[0]} className="w-1/2 h-full object-cover rounded-lg" alt="Grid 1" />
            <img src={displayImages[1]} className="w-1/2 h-full object-cover rounded-lg" alt="Grid 2" />
          </div>
          <div className="flex gap-2 h-1/2">
            <img src={displayImages[2]} className="w-1/3 h-full object-cover rounded-lg" alt="Grid 3" />
            <img src={displayImages[3]} className="w-1/3 h-full object-cover rounded-lg" alt="Grid 4" />
            <img src={displayImages[4]} className="w-1/3 h-full object-cover rounded-lg" alt="Grid 5" />
          </div>
        </div>
      );
    }

    // Template 3: Zoom Stack - Images zoom in and stack
    if (layout === "zoom-stack") {
      return (
        <div className="absolute inset-0">
          {uploadedImages.map((img, index) => {
            const isActive = index === currentImageIndex;
            const offset = (index - currentImageIndex) * 20;
            const zIndex = uploadedImages.length - Math.abs(index - currentImageIndex);
            
            return (
              <img 
                key={index}
                src={img} 
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
                style={{
                  transform: `scale(${isActive ? 1 : 0.85}) translateY(${offset}px)`,
                  opacity: isActive ? 1 : 0.3,
                  zIndex: zIndex
                }}
                alt={`Stack ${index+1}`}
              />
            );
          })}
        </div>
      );
    }
  };

  const downloadReel = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    canvas.width = 1080;
    canvas.height = 1920;

    // Draw background gradient
    if (selectedTemplate) {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      const colors = selectedTemplate.gradient.match(/#[0-9a-f]{6}/gi);
      if (colors) {
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw first image as snapshot
    if (uploadedImages.length > 0) {
      const img = new window.Image();
      img.src = uploadedImages[0];
      img.onload = () => {
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        
        ctx.globalAlpha = 0.8;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        ctx.globalAlpha = 1.0;

        // Draw text
        if (text) {
          ctx.font = "bold 80px Arial";
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 4;
          ctx.textAlign = "center";
          
          const yPos = textPosition === "top" ? 200 : textPosition === "center" ? canvas.height / 2 : canvas.height - 200;
          
          ctx.strokeText(text, canvas.width / 2, yPos);
          ctx.fillText(text, canvas.width / 2, yPos);
        }

        // Download
        const link = document.createElement("a");
        link.download = `${selectedTemplate.name}-reel.png`;
        link.href = canvas.toDataURL();
        link.click();
      };
    } else {
      alert("Please add at least one image");
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("ended", () => setIsPlaying(false));
    }
  }, [uploadedAudio]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quick Reels Template Creator</h1>
          <p className="text-gray-600">Create stunning animated Instagram/TikTok reels with up to 5 photos</p>
        </div>

        {/* Success/Error Messages */}
        {draftSuccess && (
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg flex items-center gap-3">
            <Save className="w-5 h-5" />
            <span className="font-medium">✅ Saved to drafts successfully!</span>
            <a href="/drafts" className="ml-auto text-green-700 underline hover:text-green-900">
              View Drafts
            </a>
          </div>
        )}

        {draftError && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex justify-between items-center">
            <span>{draftError}</span>
            <button 
              onClick={() => setDraftError(null)}
              className="text-red-700 hover:text-red-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel - Template Selection */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Templates */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Choose Template
              </h2>
              <div className="space-y-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full p-4 rounded-lg transition-all text-left ${
                      selectedTemplate?.id === template.id
                        ? "ring-4 ring-blue-500 scale-105"
                        : "hover:scale-102 border-2 border-gray-200"
                    }`}
                    style={{ background: template.gradient }}
                  >
                    <span className="text-white font-semibold drop-shadow-lg block mb-1">
                      {template.name}
                    </span>
                    <span className="text-white text-xs drop-shadow-lg opacity-90">
                      {template.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Images */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Image className="w-5 h-5" />
                Add Images ({uploadedImages.length}/5)
              </h2>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadedImages.length >= 5}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-5 h-5" />
                Upload Images
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {uploadedImages.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img src={img} className="w-full h-20 object-cover rounded-lg" alt={`Upload ${index+1}`} />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Text */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Type className="w-5 h-5" />
                Add Text
              </h2>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="mt-3">
                <label className="text-sm text-gray-600 mb-2 block">Text Position</label>
                <select
                  value={textPosition}
                  onChange={(e) => setTextPosition(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="top">Top</option>
                  <option value="center">Center</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
            </div>

            {/* Add Audio */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Music className="w-5 h-5" />
                Add Audio
              </h2>
              <button
                onClick={() => audioInputRef.current?.click()}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
              >
                <Upload className="w-5 h-5" />
                Upload Audio
              </button>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="hidden"
              />
              
              {uploadedAudio && (
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={toggleAudio}
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <span className="text-sm text-gray-600 flex-1">Audio added</span>
                  <button
                    onClick={() => {
                      setUploadedAudio(null);
                      setIsPlaying(false);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              <audio ref={audioRef} src={uploadedAudio} className="hidden" />
            </div>

          </div>

          {/* Right Panel - Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Live Preview (9:16 Format)</h2>
              
              <div className="flex justify-center">
                <div 
                  className="relative bg-black rounded-lg overflow-hidden shadow-2xl"
                  style={{ width: "360px", height: "640px" }}
                >
                  {/* Background Gradient */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: selectedTemplate?.gradient || "#1f2937",
                    }}
                  />

                  {/* Template Layout */}
                  {renderTemplateLayout()}

                  {/* Text Overlay */}
                  {text && (
                    <div
                      className={`absolute inset-x-0 flex items-center justify-center z-10 ${
                        textPosition === "top"
                          ? "top-12"
                          : textPosition === "center"
                          ? "top-1/2 -translate-y-1/2"
                          : "bottom-12"
                      }`}
                    >
                      <h2 
                        className="text-white text-3xl font-bold px-6 text-center"
                        style={{
                          textShadow: "3px 3px 10px rgba(0,0,0,0.9)",
                        }}
                      >
                        {text}
                      </h2>
                    </div>
                  )}

                  {/* Audio Indicator */}
                  {uploadedAudio && (
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 z-10">
                      <Music className="w-4 h-4" />
                      {isPlaying ? "Playing..." : "Audio Added"}
                    </div>
                  )}

                  {/* Image Counter */}
                  {uploadedImages.length > 0 && (
                    <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm z-10">
                      {currentImageIndex + 1} / {uploadedImages.length}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-center gap-3">
                {/* Save to Drafts Button */}
                <button
                  onClick={saveToDrafts}
                  disabled={!selectedTemplate || uploadedImages.length === 0 || savingDraft}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-all transform hover:scale-105 disabled:transform-none"
                >
                  {savingDraft ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save to Drafts
                    </>
                  )}
                </button>

                {/* Download Button */}
                <button
                  onClick={downloadReel}
                  disabled={!selectedTemplate || uploadedImages.length === 0}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-all transform hover:scale-105 disabled:transform-none"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
              </div>

              <p className="text-sm text-gray-500 text-center mt-4">
                Preview shows animation cycle. Download/Save creates a snapshot with all images.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}