import React, { useState, useRef, useEffect } from "react";
import "../../Styles/ProductShowcase.css"; 

export default function ProductShowcase() {
  const [productImage, setProductImage] = useState(null);
  const [productPreview, setProductPreview] = useState(null);
  const [selectedModel, setSelectedModel] = useState("model1");
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [progress, setProgress] = useState(0);
  const [backendStatus, setBackendStatus] = useState("checking");
  const fileInputRef = useRef(null);

  // Predefined model girls
  const modelGirls = {
    model1: {
      name: "Sophia",
      description: "Elegant & Professional",
      seed: 42,
      style: "professional, elegant, business casual",
    },
    model2: {
      name: "Emma",
      description: "Casual & Friendly",
      seed: 123,
      style: "casual, friendly, lifestyle",
    },
    model3: {
      name: "Aria",
      description: "Modern & Chic",
      seed: 456,
      style: "modern, chic, fashionable",
    },
    model4: {
      name: "Zara",
      description: "Bold & Confident",
      seed: 789,
      style: "bold, confident, editorial",
    },
    model5: {
      name: "Maya",
      description: "Natural & Fresh",
      seed: 999,
      style: "natural, fresh, minimalist",
    },
  };

  // Check backend status on mount and periodically
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("http://localhost:5004/status");
        const data = await response.json();
        
        if (data.ready) {
          setBackendStatus("ready");
        } else if (data.loading) {
          setBackendStatus("loading");
        } else {
          setBackendStatus("error");
        }
      } catch (error) {
        setBackendStatus("offline");
      }
    };

    checkStatus();
    
    // Check every 3 seconds if not ready
    const interval = setInterval(() => {
      if (backendStatus !== "ready") {
        checkStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [backendStatus]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setProductPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const generateShowcaseImages = async () => {
    if (!productImage || !selectedModel) {
      alert("Please upload a product image and select a model");
      return;
    }

    if (backendStatus !== "ready") {
      alert("Backend is not ready yet. Please wait for models to load.");
      return;
    }

    setLoading(true);
    setGeneratedImages([]);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("product_image", productImage);
      formData.append("model_id", selectedModel);

      const response = await fetch("http://localhost:5004/generate-showcase", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate images");
      }

      const data = await response.json();

      if (data.success && data.images) {
        setGeneratedImages(data.images);
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate images: " + error.message);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const downloadImage = (imageUrl, index) => {
    fetch(imageUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `showcase-${selectedModel}-${index + 1}.png`;
        link.click();
        URL.revokeObjectURL(url);
      });
  };

  const downloadAllImages = () => {
    generatedImages.forEach((img, index) => {
      setTimeout(() => downloadImage(img.url, index), index * 500);
    });
  };

  // Status banner component
  const StatusBanner = () => {
    if (backendStatus === "ready") return null;

    const statusConfig = {
      loading: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: "⏳",
        message: "AI models are loading... This may take 1-5 minutes on first run."
      },
      offline: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: "❌",
        message: "Backend server is offline. Please start product-server.py"
      },
      error: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: "⚠️",
        message: "Models failed to load. Check server logs."
      },
      checking: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: "🔍",
        message: "Checking server status..."
      }
    };

    const config = statusConfig[backendStatus];

    return (
      <div className={`status-banner ${config.bg} ${config.text}`}>
        <span className="status-icon">{config.icon}</span>
        <span className="status-message">{config.message}</span>
      </div>
    );
  };

  return (
    <div className="showcase-container">
      <div className="showcase-header animate-fadeIn">
        <h1>👜 AI Product Showcase Generator</h1>
        <p>
          Upload your product and see it showcased by AI-generated models with
          consistent faces
        </p>
        <StatusBanner />
      </div>

      <div className="showcase-grid">
        {/* Left Panel */}
        <div className="left-panel animate-slideUp">
          <h2>Setup Your Showcase</h2>

          {/* Upload */}
          <div className="upload-section">
            <label>📸 Upload Product Image</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="upload-box"
            >
              {productPreview ? (
                <div className="preview-container">
                  <img
                    src={productPreview}
                    alt="Product"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProductImage(null);
                      setProductPreview(null);
                    }}
                  >
                    ✕
                  </button>
                </div> 
              ) : (
                <div>
                  <div className="upload-placeholder">📷</div>
                  <p>Click to upload product image</p>
                  <p className="upload-text">PNG, JPG up to 10MB</p>
                  
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </div>

          {/* Model selection */}
          <div className="model-select">
            <label>👩 Select Model (Consistent Face)</label>
            <div className="model-grid">
              {Object.entries(modelGirls).map(([key, model]) => (
                <button
                  key={key}
                  onClick={() => setSelectedModel(key)}
                  className={`model-btn ${selectedModel === key ? 'active' : ''}`}
                >
                  <div>
                    <div className="model-name">
                      {model.name}
                    </div>
                    <div className="model-description">
                      {model.description}
                    </div>
                    <div className="model-details">
                      Seed: {model.seed}
                    </div>
                  </div>
                  {selectedModel === key && (
                    <div className="model-check">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Generate */}
          <button
            onClick={generateShowcaseImages}
            disabled={loading || !productImage || !selectedModel || backendStatus !== "ready"}
            className={`generate-btn ${loading || !productImage || !selectedModel || backendStatus !== "ready" ? 'disabled' : ''}`}
          >
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner" />
                <span>Generating images...</span>
              </div>
            ) : backendStatus === "loading" ? (
              "⏳ Waiting for models to load..."
            ) : backendStatus === "offline" ? (
              "❌ Server Offline"
            ) : (
              "✨ Generate 4 Showcase Images"
            )}
          </button>

          {backendStatus === "ready" && (
            <div className="status-indicator ready">
              ✓ Backend Ready
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="right-panel animate-slideUp">
          <div className="panel-header">
            <h2>Generated Showcase</h2>
            {generatedImages.length > 0 && (
              <button
                onClick={downloadAllImages}
                className="download-all-btn"
              >
                ⬇️ Download All
              </button>
            )}
          </div>

          {generatedImages.length === 0 && !loading ? (
            <div className="empty-state">
              <div className="empty-content">
                <div className="empty-icon">🎨</div>
                <p className="empty-title">
                  Your showcase images will appear here
                </p>
                <p className="empty-subtitle">
                  Upload a product and select a model to start
                </p>
              </div>
            </div>
          ) : (
            <div className="image-grid">
              {loading
                ? [1, 2, 3, 4].map((i) => (
                    <div key={i} className="loading-placeholder">
                      <div className="loading-text-container">
                        <div className="loading-text-box">
                          <span className="loading-text">
                            Generating pose {i}...
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                : generatedImages.map((img, index) => (
                    <div key={index} className="image-wrapper">
                      <img
                        src={img.url}
                        alt={`Showcase ${index + 1}`}
                        className="result-image"
                      />
                      <button
                        onClick={() => downloadImage(img.url, index)}
                        className="download-btn"
                      >
                        ⬇️ Download
                      </button>
                      <div className="pose-badge">
                        {img.angle}
                      </div>
                    </div>
                  ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}