import { useState, useRef, useEffect } from "react";
import { Loader2, Upload, X, Download, ArrowRight, ImagePlus } from "lucide-react";

export default function Index() {
  const [productImage, setProductImage] = useState(null);
  const [productPreview, setProductPreview] = useState("");
  const [processedImage, setProcessedImage] = useState("");
  const [selectedBackground, setSelectedBackground] = useState("");

  // NEW ⭐
  const [customBackground, setCustomBackground] = useState("");

  // movement + scaling
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const fileInputRef = useRef(null);
  const bgUploadRef = useRef(null);

  // Background image options
  const BACKGROUNDS = [
    { name: "Warm Oak Table - 1", url: "/assets/bg1.jpg" },
    { name: "Warm Oak Table - 2", url: "/assets/bg5.png" },
    { name: "Warm Oak Table - 3", url: "/assets/bg6.png" },
    { name: "Warm Oak Table - 4", url: "/assets/bg4.jpg" },
    { name: "Warm Oak Table - 5", url: "/assets/bg2.png" },
    { name: "Warm Oak Table - 6", url: "/assets/bg3.jpg" },
  ];

  const aspectRatios = [
    { id: "square", label: "Square", ratio: "1:1" },
    { id: "portrait", label: "Portrait", ratio: "2:3" },
    { id: "landscape", label: "Landscape", ratio: "3:2" },
  ];

  const [selectedAspect, setSelectedAspect] = useState("landscape");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Upload product image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) return setError("Image must be less than 10MB");
    if (!file.type.startsWith("image/")) return setError("Please upload a valid image file");

    setProductImage(file);
    setError("");
    setProcessedImage("");

    const reader = new FileReader();
    reader.onloadend = () => {
      setProductPreview(reader.result);
      removeBackground(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Upload custom background ⭐
  const handleCustomBackground = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomBackground(reader.result);
      setSelectedBackground(reader.result);
    };
    reader.readAsDataURL(file);
  };

  
  const removeBackground = async (imageData) => {
    setLoading(true);
    setError("");

    try {
      const img = new Image();
      img.src = imageData;

      await img.decode();

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageDataObj.data;

      // Corner background sample
      const corners = [
        { x: 0, y: 0 },
        { x: canvas.width - 1, y: 0 },
        { x: 0, y: canvas.height - 1 },
        { x: canvas.width - 1, y: canvas.height - 1 },
      ];

      let r = 0, g = 0, b = 0;
      corners.forEach((p) => {
        const i = (p.y * canvas.width + p.x) * 4;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      });

      const bgR = r / 4, bgG = g / 4, bgB = b / 4;
      const threshold = 40;

      for (let i = 0; i < data.length; i += 4) {
        const diff =
          Math.abs(data[i] - bgR) +
          Math.abs(data[i + 1] - bgG) +
          Math.abs(data[i + 2] - bgB);

        if (diff < threshold) data[i + 3] = 0;
      }

      ctx.putImageData(imageDataObj, 0, 0);
      setProcessedImage(canvas.toDataURL("image/png"));
    } catch {
      setError("Error processing image.");
    } finally {
      setLoading(false);
    }
  };

  // Movement handlers ⭐
  const startDrag = (e) => {
    dragging.current = true;
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const stopDrag = () => {
    dragging.current = false;
  };

  const handleDrag = (e) => {
    if (!dragging.current) return;
    setPosition({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleDrag);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", stopDrag);
    };
  });

  const removeImage = () => {
    setProductImage(null);
    setProductPreview("");
    setProcessedImage("");
    fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <div className="w-44 bg-white border-r border-gray-200 py-8 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4 px-4">

          {/* Built-in Backgrounds */}
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg.url}
              onClick={() => setSelectedBackground(bg.url)}
              className={`relative w-full h-20 rounded-lg overflow-hidden border-2 hover:scale-105 ${
                selectedBackground === bg.url
                  ? "border-blue-600 ring-2 ring-blue-300"
                  : "border-gray-300"
              }`}
            >
              <img src={bg.url} className="w-full h-full object-cover" />
            </button>
          ))}

          {/* CUSTOM BACKGROUND BUTTON ⭐ */}
          <button
            onClick={() => bgUploadRef.current.click()}
            className="w-full h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-600 transition"
          >
            <ImagePlus className="w-6 h-6" />
            <span className="text-xs mt-1">Custom BG</span>
          </button>

          <input
            type="file"
            ref={bgUploadRef}
            onChange={handleCustomBackground}
            accept="image/*"
            className="hidden"
          />

        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
      
      {/* FULL-WIDTH HEADER */}
      <div className="bg-white border-b border-gray-200 px-10 py-6">
        <h1 className="text-2xl font-semibold text-gray-900">Product Staging</h1>
        <p className="text-sm text-gray-500 mt-1">Remove background and apply beautiful backgrounds</p>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8">

          {/* Product Upload */}
          <div className="grid grid-cols-2 gap-6">
            
            {/* Upload */}
            <div className="bg-white p-6 rounded-lg border">
              {!productPreview ? (
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-gray-300 h-80 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30"
                >
                  <Upload className="w-12 h-12 text-gray-400" />
                  <p className="text-gray-600 font-medium">Upload product</p>
                </div>
              ) : (
                <div className="relative">
                  <img src={productPreview} className="h-80 object-contain w-full bg-gray-50 rounded-lg" />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow border"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {loading && (
                <div className="flex items-center justify-center gap-2 mt-3 text-blue-600">
                  <Loader2 className="animate-spin w-5 h-5" /> Processing…
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="bg-white p-6 rounded-lg border relative group">
              <div
                className="w-full h-80 rounded-lg relative overflow-hidden"
                style={{
                  backgroundImage: `url(${selectedBackground})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {processedImage ? (
                  <img
                    src={processedImage}
                    onMouseDown={startDrag}
                    style={{
                      position: "absolute",
                      left: position.x,
                      top: position.y,
                      transform: `scale(${scale})`,
                      cursor: "grab",
                    }}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-gray-400 flex items-center justify-center h-full">
                    Result will appear here
                  </div>
                )}
              </div>

              {/* Download */}
              {processedImage && (
                <a
                  download="product.png"
                  href={processedImage}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition shadow-lg"
                >
                  <Download className="w-4 h-4 inline-block mr-1" />
                  Download
                </a>
              )}
            </div>
          </div>

          {/* SIZE SLIDER ⭐ */}
          {processedImage && (
            <div className="bg-white p-4 rounded-lg border mt-6">
              <label className="text-sm font-medium text-gray-700">Product Size</label>
              <input
                type="range"
                min="0.3"
                max="2"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full mt-2"
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
