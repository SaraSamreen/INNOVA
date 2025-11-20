import { useState, useRef, useEffect } from "react";
import { Loader2, Sparkles, Upload, X, Download, Palette } from "lucide-react";

export default function ProductBeautifier() {
  const [productImage, setProductImage] = useState(null);
  const [productPreview, setProductPreview] = useState("");
  const [processedImage, setProcessedImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Color palette options
  const colorPalette = [
    { name: "White", value: "#FFFFFF" },
    { name: "Light Gray", value: "#F3F4F6" },
    { name: "Soft Blue", value: "#EFF6FF" },
    { name: "Mint", value: "#ECFDF5" },
    { name: "Lavender", value: "#F5F3FF" },
    { name: "Peach", value: "#FFF7ED" },
    { name: "Rose", value: "#FFF1F2" },
    { name: "Sky Blue", value: "#DBEAFE" },
    { name: "Coral", value: "#FFEDD5" },
    { name: "Sage", value: "#D1FAE5" },
    { name: "Lilac", value: "#E9D5FF" },
    { name: "Champagne", value: "#FEF3C7" },
    { name: "Navy", value: "#1E3A8A" },
    { name: "Forest", value: "#064E3B" },
    { name: "Charcoal", value: "#1F2937" },
    { name: "Black", value: "#000000" },
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image must be less than 10MB");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image file");
        return;
      }

      setProductImage(file);
      setError("");
      setProcessedImage("");
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductPreview(reader.result);
        // Automatically process image when uploaded
        removeBackground(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProductImage(null);
    setProductPreview("");
    setProcessedImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeBackground = async (imageData) => {
    setLoading(true);
    setError("");

    try {
      // Create an image element
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageData;
      });

      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageDataObj.data;
      
      // Simple background removal algorithm
      // This removes pixels similar to the corner colors (assumed to be background)
      const cornerSamples = [
        { x: 0, y: 0 },
        { x: canvas.width - 1, y: 0 },
        { x: 0, y: canvas.height - 1 },
        { x: canvas.width - 1, y: canvas.height - 1 }
      ];
      
      // Get average corner color
      let totalR = 0, totalG = 0, totalB = 0;
      cornerSamples.forEach(sample => {
        const index = (sample.y * canvas.width + sample.x) * 4;
        totalR += data[index];
        totalG += data[index + 1];
        totalB += data[index + 2];
      });
      
      const bgR = totalR / 4;
      const bgG = totalG / 4;
      const bgB = totalB / 4;
      
      // Remove similar colors
      const threshold = 40; // Adjust for sensitivity
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
        
        if (diff < threshold) {
          data[i + 3] = 0; // Make transparent
        }
      }
      
      // Put modified image data back
      ctx.putImageData(imageDataObj, 0, 0);
      
      // Convert to PNG with transparency
      setProcessedImage(canvas.toDataURL('image/png'));
      
    } catch (err) {
      setError("Failed to process image. Please try another image.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-800 flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-12 h-12 text-blue-600" />
              Product Background Changer
            </h1>
            <p className="text-xl text-gray-600">
              Remove background and apply beautiful colors to your product images
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200">
          {/* Color Palette - Always visible */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-700 mb-4 flex items-center justify-center gap-2">
              <Palette className="w-6 h-6 text-blue-600" />
              Choose Background Color
            </label>
            <div className="flex flex-wrap justify-center gap-4">
              {colorPalette.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-16 h-16 rounded-full border-4 transition-all hover:scale-110 ${
                    selectedColor === color.value
                      ? "border-blue-600 ring-4 ring-blue-300 scale-110"
                      : "border-gray-200"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {selectedColor === color.value && (
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {selectedColor && (
              <p className="text-sm text-gray-600 mt-4 text-center">
                Selected: <span className="font-semibold">{colorPalette.find(c => c.value === selectedColor)?.name}</span>
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  Upload Product Image
                </label>
                
                {!productPreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                  >
                    <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 font-medium mb-2">
                      Click to upload product image
                    </p>
                    <p className="text-sm text-gray-400">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border-2 border-blue-300">
                    <img
                      src={productPreview}
                      alt="Product preview"
                      className="w-full h-96 object-contain bg-gray-50"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg"
                    >
                      <X className="w-5 h-5" />
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
              </div>

              {loading && (
                <div className="flex items-center justify-center gap-3 text-blue-600 bg-blue-50 py-4 rounded-lg">
                  <Loader2 className="animate-spin w-6 h-6" />
                  <span className="font-medium">Removing background...</span>
                </div>
              )}

              {error && (
                <p className="text-red-500 text-center font-medium bg-red-50 py-3 px-4 rounded-lg">
                  {error}
                </p>
              )}
            </div>

            {/* Result Section */}
            <div className="flex flex-col">
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Result with Background
              </label>
              {processedImage ? (
                <div className="space-y-4">
                  <div 
                    className="relative group rounded-xl overflow-hidden border-2 border-green-300"
                    style={{ backgroundColor: selectedColor }}
                  >
                    <div className="w-full h-96 flex items-center justify-center p-4">
                      <img
                        src={processedImage}
                        alt="Product with background"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <a
                      href={processedImage}
                      download="product-with-background.png"
                      className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full flex items-center gap-2 opacity-0 group-hover:opacity-100 transition font-medium shadow-lg"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </a>
                  </div>
                  <p className="text-sm text-center text-gray-600">
                    💡 Click any color above to change the background instantly
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 border-4 border-dashed border-gray-300 rounded-xl h-96 flex flex-col items-center justify-center text-gray-400">
                  <Sparkles className="w-16 h-16 mb-4" />
                  <p className="text-lg">Your image with background will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Instant background removal • No server required • Client-side processing</p>
        </div>
      </div>
    </div>
  );
}