import React, { useState, useRef } from "react";
import "../../Styles/PhotoToVideo.css"

export default function PhotoToVideo({ onAvatarSelect, onAvatarConvert, onAddToDraft }) {
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [convertedAvatar, setConvertedAvatar] = useState(null);
  const [avatarId, setAvatarId] = useState(null);
  const [lipsyncVideo, setLipsyncVideo] = useState(null);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [converting, setConverting] = useState(false);
  const [avatarStyle, setAvatarStyle] = useState("cartoon");
  const [script, setScript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const lipsyncVideoRef = useRef(null);

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: "user"
        },
      });
      setStream(mediaStream);
      setCameraActive(true);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(err => console.error("Play error:", err));
        }
      }, 100);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Cannot access camera. Please check permissions.");
    }
  };

  // Capture image from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);
      const captured = canvas.toDataURL("image/png");
      const avatar = { id: "camera", src: captured, name: "Captured Avatar" };
      
      console.log("✅ Photo captured successfully");
      setSelectedAvatar(avatar);
      if (onAvatarSelect) onAvatarSelect(captured);
      stopCamera();
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  // File upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const avatar = { id: "file", src: ev.target.result, name: "Uploaded Avatar" };
        console.log("✅ File uploaded successfully");
        setSelectedAvatar(avatar);
        if (onAvatarSelect) onAvatarSelect(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert avatar using backend API
  const handleConvert = async () => {
    if (!selectedAvatar) {
      console.log("❌ No avatar selected");
      return;
    }
    
    console.log("🎨 Starting conversion...");
    console.log("Style:", avatarStyle);
    
    setConverting(true);
    
    try {
      console.log("📡 Sending request to backend...");
      
      const response = await fetch("http://localhost:5001/convert-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: selectedAvatar.src,
          style: avatarStyle
        })
      });
      
      console.log("📥 Response status:", response.status);
      
      const data = await response.json();
      console.log("📦 Response data:", data);
      
      if (data.success) {
        const avatarUrl = `http://localhost:5001${data.avatar_url}`;
        console.log("✅ Avatar converted successfully:", avatarUrl);
        setConvertedAvatar(avatarUrl);
        setAvatarId(data.avatar_id);
        setLipsyncVideo(null);
        if (onAvatarConvert) onAvatarConvert(avatarUrl);
      } else {
        console.error("❌ Conversion failed:", data.error);
        
        if (data.error === "No face detected") {
          alert("⚠️ No face detected in the image!\n\nPlease upload a photo with a clearly visible face.");
        } else {
          alert("Failed to convert avatar: " + data.error);
        }
      }
    } catch (err) {
      console.error("❌ Conversion error:", err);
      alert("Failed to connect to server. Make sure the backend is running on http://localhost:5001");
    } finally {
      setConverting(false);
    }
  };

  // Make avatar speak the script with lip-sync
  const handleSpeak = async () => {
    if (!script.trim()) {
      alert("Please enter a script first!");
      return;
    }

    if (!convertedAvatar) {
      alert("Please create an avatar first!");
      return;
    }

    console.log("🎤 Generating speech with lip-sync...");
    setIsSpeaking(true);
    setLipsyncVideo(null);

    try {
      const response = await fetch("http://localhost:5001/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: script,
          avatar_id: avatarId
        })
      });

      const data = await response.json();
      console.log("🔊 Speech response:", data);

      if (data.audio_url) {
        if (data.lipsync_url) {
          const videoUrl = `http://localhost:5001${data.lipsync_url}`;
          console.log("🎬 Lip-sync video:", videoUrl);
          setLipsyncVideo(videoUrl);
          
          const audio = new Audio(`http://localhost:5001${data.audio_url}`);
          
          if (lipsyncVideoRef.current) {
            lipsyncVideoRef.current.currentTime = 0;
            lipsyncVideoRef.current.play();
          }
          
          audio.onended = () => {
            console.log("✅ Audio finished");
            setIsSpeaking(false);
            if (lipsyncVideoRef.current) {
              lipsyncVideoRef.current.pause();
              lipsyncVideoRef.current.currentTime = 0;
            }
          };
          audio.onerror = () => {
            console.error("❌ Audio playback error");
            setIsSpeaking(false);
            alert("Failed to play audio");
          };
          await audio.play();
        } else {
          const audio = new Audio(`http://localhost:5001${data.audio_url}`);
          audio.onended = () => {
            console.log("✅ Audio finished");
            setIsSpeaking(false);
          };
          audio.onerror = () => {
            console.error("❌ Audio playback error");
            setIsSpeaking(false);
            alert("Failed to play audio");
          };
          await audio.play();
        }
      } else {
        alert("Failed to generate speech");
        setIsSpeaking(false);
      }
    } catch (err) {
      console.error("❌ Speech error:", err);
      alert("Failed to generate speech");
      setIsSpeaking(false);
    }
  };

  // Download avatar
  const handleDownload = () => {
    if (!convertedAvatar) {
      alert("Please create an avatar first!");
      return;
    }

    const link = document.createElement('a');
    link.href = convertedAvatar;
    link.download = `avatar_${avatarStyle}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log("✅ Avatar downloaded");
  };

  // Add to draft
  const handleAddToDraft = () => {
    if (!convertedAvatar) {
      alert("Please create an avatar first!");
      return;
    }

    if (onAddToDraft) {
      onAddToDraft({
        avatar: convertedAvatar,
        style: avatarStyle,
        script: script,
        avatarId: avatarId
      });
      console.log("✅ Added to draft");
      alert("✅ Avatar added to draft successfully!");
    } else {
      console.log("⚠️ onAddToDraft callback not provided");
      alert("✅ Avatar ready! (Draft feature not connected)");
    }
  };

  // Reset all states
  const handleReset = () => {
    console.log("🔄 Resetting...");
    setSelectedAvatar(null);
    setConvertedAvatar(null);
    setAvatarId(null);
    setLipsyncVideo(null);
    setScript("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    stopCamera();
  };

  return (
    <div className="ca-container">
      <div className="ca-left">
        <h2 className="ca-heading">Create Your Avatar</h2>
        <p className="ca-subtext">Upload an image or use your camera</p>

        {/* Camera & Upload Row */}
        <div className="ca-camera-upload-row">
          {/* Camera Circle */}
          <div className="ca-camera-circle">
            {cameraActive ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="ca-camera-video-circle" 
              />
            ) : (
              <div className="ca-camera-placeholder">
                <span role="img" aria-label="Camera">📷</span>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="ca-upload-buttons">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            <button 
              className="ca-btn" 
              onClick={() => fileInputRef.current?.click()}
              disabled={cameraActive}
            >
              <span role="img" aria-label="Upload">📁</span> Upload
            </button>
            {!cameraActive ? (
              <button className="ca-btn" onClick={startCamera}>
                <span role="img" aria-label="Camera">📷</span> Start Camera
              </button>
            ) : (
              <button className="ca-btn primary" onClick={capturePhoto}>
                <span role="img" aria-label="Capture">📸</span> Capture
              </button>
            )}
            
            {/* Avatar Style Selector */}
            <select 
              value={avatarStyle} 
              onChange={(e) => setAvatarStyle(e.target.value)}
              className="ca-select"
            >
              <option value="cartoon">🎨 Cartoon</option>
              <option value="anime">😊 Anime</option>
              <option value="sketch">✏️ Sketch</option>
              <option value="pixel">🎮 Pixel Art</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="ca-action-buttons">
          <button 
            className="ca-btn primary" 
            onClick={handleConvert} 
            disabled={!selectedAvatar || converting}
          >
            {converting ? "🔄 Converting..." : "✨ Convert to Avatar"}
          </button>
          <button className="ca-btn" onClick={handleReset} disabled={!selectedAvatar}>
            <span role="img" aria-label="Reset">🔄</span> Reset
          </button>
        </div>

        {/* Script Section */}
        <div className="ca-script-section">
          <h3 className="ca-script-heading"><span role="img" aria-label="Script">💬</span> Avatar Script</h3>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Enter the text you want your avatar to speak..."
            className="ca-textarea"
            rows={6}
          />
          <button 
            className="ca-speak-btn"
            onClick={handleSpeak}
            disabled={isSpeaking || !convertedAvatar || !script.trim()}
          >
            {isSpeaking ? "🔊 Speaking..." : "🎤 Make Avatar Speak"}
          </button>
        </div>

        {/* Download & Add to Draft Buttons */}
        {convertedAvatar && (
          <div className="ca-bottom-actions">
            <button 
              className="ca-btn ca-download-btn"
              onClick={handleDownload}
            >
              <span role="img" aria-label="Download">⬇️</span> Download Avatar
            </button>
            <button 
              className="ca-btn ca-draft-btn primary"
              onClick={handleAddToDraft}
            >
              <span role="img" aria-label="Add">➕</span> Add to Draft
            </button>
          </div>
        )}
      </div>

      <div className="ca-right">
        <h2 className="ca-heading">Preview</h2>
        <div className="ca-preview">
          {lipsyncVideo ? (
            <>
              <video 
                ref={lipsyncVideoRef}
                src={lipsyncVideo} 
                className="ca-preview-avatar" 
                autoPlay
                loop={false}
              />
              <p className="ca-avatar-name"><span role="img" aria-label="Avatar">✨</span> {avatarStyle.charAt(0).toUpperCase() + avatarStyle.slice(1)} Avatar (Speaking)</p>
              {isSpeaking && (
                <div className="ca-speaking-indicator">
                  <div className="ca-pulse"></div>
                  <span>Speaking...</span>
                </div>
              )}
            </>
          ) : convertedAvatar ? (
            <>
              <img src={convertedAvatar} alt="Converted Avatar" className="ca-preview-avatar" />
              <p className="ca-avatar-name"><span role="img" aria-label="Avatar">✨</span> {avatarStyle.charAt(0).toUpperCase() + avatarStyle.slice(1)} Avatar</p>
              {isSpeaking && (
                <div className="ca-speaking-indicator">
                  <div className="ca-pulse"></div>
                  <span>Speaking...</span>
                </div>
              )}
            </>
          ) : selectedAvatar ? (
            <>
              <img src={selectedAvatar.src} alt="Original" className="ca-preview-avatar" />
              <p className="ca-avatar-name">{selectedAvatar.name} (Original)</p>
            </>
          ) : (
            <div className="ca-preview-placeholder">
              <div className="ca-placeholder-icon"><span role="img" aria-label="User">👤</span></div>
              <p>No avatar selected</p>
            </div>
          )}
        </div>

        {/* Download & Add to Draft Buttons - Moved to Right Side */}
        {convertedAvatar && (
          <div className="ca-bottom-actions">
            <button 
              className="ca-btn ca-download-btn"
              onClick={handleDownload}
            >
              <span role="img" aria-label="Download">⬇️</span> Download Avatar
            </button>
            <button 
              className="ca-btn ca-draft-btn primary"
              onClick={handleAddToDraft}
            >
              <span role="img" aria-label="Add">➕</span> Add to Draft
            </button>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}