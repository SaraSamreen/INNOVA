import React, { useState, useRef, useEffect } from "react";
import "../../Styles/ProductShowcase.css";

// Backend server configuration
const BACKEND_PORT = process.env.REACT_APP_PRODUCT_SERVER_PORT || 5000;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;

export default function ProductShowcase() {
  const [productImage, setProductImage] = useState(null);
  const [productPreview, setProductPreview] = useState(null);
  const [selectedModel, setSelectedModel] = useState("model1");
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [progress, setProgress] = useState(0);
  const [backendStatus, setBackendStatus] = useState("checking");
  const fileInputRef = useRef(null);

  const modelGirls = {
    model1: { name: "Sophia", description: "Elegant & Professional", seed: 42, style: "professional, elegant, business casual" },
    model2: { name: "Emma", description: "Casual & Friendly", seed: 123, style: "casual, friendly, lifestyle" },
    model3: { name: "Aria", description: "Modern & Chic", seed: 456, style: "modern, chic, fashionable" },
    model4: { name: "Zara", description: "Bold & Confident", seed: 789, style: "bold, confident, editorial" },
    model5: { name: "Maya", description: "Natural & Fresh", seed: 999, style: "natural, fresh, minimalist" },
  };

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/health`);
        const data = await response.json();
        if (data.status === "ok") setBackendStatus("ready");
        else setBackendStatus("error");
      } catch {
        setBackendStatus("offline");
      }
    };
    checkStatus();
    const interval = setInterval(() => {
      if (backendStatus !== "ready") checkStatus();
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
      alert("Backend not ready. Wait until models load.");
      return;
    }

    setLoading(true);
    setGeneratedImages([]);
    setProgress(0);

    try {
      // Convert image to base64
      const reader = new FileReader();
      const imageBase64 = await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          // Remove data:image/...;base64, prefix
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(productImage);
      });

      const response = await fetch(`${BACKEND_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_image: imageBase64,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate images");
      const data = await response.json();
      if (data.results) {
        // Convert backend response format to frontend format
        const images = Object.entries(data.results).map(([poseName, result]) => ({
          angle: poseName.charAt(0).toUpperCase() + poseName.slice(1),
          url: `data:image/png;base64,${result.base64}`,
        }));
        setGeneratedImages(images);
      } else throw new Error(data.error || "Unknown error");
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

  const shareImage = async (imageUrl, platform) => {
    const base64Data = imageUrl.startsWith("data:")
      ? imageUrl
      : await fetch(imageUrl)
          .then((r) => r.blob())
          .then(
            (b) =>
              new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(b);
              })
          );

    if (platform === "facebook") {
      window.open(
        "https://www.facebook.com/sharer/sharer.php?u=" +
          encodeURIComponent(window.location.href),
        "_blank"
      );
    } else if (platform === "instagram") {
      alert(
        "Instagram API does not allow direct uploads from client side. Integrate server-side Meta Graph API for publishing."
      );
    }
  };

  const StatusBanner = () => {
    if (backendStatus === "ready") return null;
    const statusConfig = {
      loading: { bg: "bg-blue-100", text: "text-blue-800", icon: "⏳", message: "AI models are loading..." },
      offline: { bg: "bg-red-100", text: "text-red-800", icon: "❌", message: "Backend offline." },
      error: { bg: "bg-yellow-100", text: "text-yellow-800", icon: "⚠️", message: "Model load error." },
      checking: { bg: "bg-gray-100", text: "text-gray-800", icon: "🔍", message: "Checking server..." },
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
        <p>Upload your product and see it showcased by AI-generated models</p>
        <StatusBanner />
      </div>

      <div className="showcase-grid">
        {/* Left Panel */}
        <div className="left-panel animate-slideUp">
          <h2>Setup Your Showcase</h2>
          <div className="upload-section">
            <label>📸 Upload Product Image</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="upload-box"
            >
              {productPreview ? (
                <div className="preview-container">
                  <img src={productPreview} alt="Product" />
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

          <div className="model-select">
            <label>👩 Select Model</label>
            <div className="model-grid">
              {Object.entries(modelGirls).map(([key, model]) => (
                <button
                  key={key}
                  onClick={() => setSelectedModel(key)}
                  className={`model-btn ${
                    selectedModel === key ? "active" : ""
                  }`}
                >
                  <div>
                    <div className="model-name">{model.name}</div>
                    <div className="model-description">{model.description}</div>
                    <div className="model-details">Seed: {model.seed}</div>
                  </div>
                  {selectedModel === key && (
                    <div className="model-check">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateShowcaseImages}
            disabled={
              loading || !productImage || !selectedModel || backendStatus !== "ready"
            }
            className={`generate-btn ${
              loading || !productImage || !selectedModel || backendStatus !== "ready"
                ? "disabled"
                : ""
            }`}
          >
            {loading ? "Generating..." : "✨ Generate 4 Showcase Images"}
          </button>
        </div>

        {/* Right Panel */}
        <div className="right-panel animate-slideUp">
          <div className="panel-header">
            <h2>Generated Showcase</h2>
            {generatedImages.length > 0 && (
              <button onClick={downloadAllImages} className="download-all-btn">
                ⬇️ Download All
              </button>
            )}
          </div>

          <div className="image-grid">
            {generatedImages.map((img, index) => (
              <div key={index} className="image-wrapper">
                <img
                  src={img.url}
                  alt={`Showcase ${index + 1}`}
                  className="result-image"
                />
                <div className="pose-badge">{img.angle}</div>

                <div className="image-actions">
                  <button
                    onClick={() => downloadImage(img.url, index)}
                    className="download-btn"
                  >
                    ⬇️ Download
                  </button>
                  <button
                    onClick={() => shareImage(img.url, "facebook")}
                    className="share-btn fb"
                  >
                    📘 Share
                  </button>
                  <button
                    onClick={() => shareImage(img.url, "instagram")}
                    className="share-btn ig"
                  >
                    📸 Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
