import { useState, useRef } from "react";
import { Loader2, Upload, X, Download, ArrowRight } from "lucide-react";

export default function Index() {
  const [productImage, setProductImage] = useState(null);
  const [productPreview, setProductPreview] = useState("");
  const [processedImage, setProcessedImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [selectedAspect, setSelectedAspect] = useState("landscape");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Color palette options
  const colorPalette = [
    { name: "White", value: "#FFFFFF" },
    { name: "Light Gray", value: "#dcdddfff" },
    { name: "Soft Blue", value: "#b0cef6ff" },
    { name: "Mint", value: "#b5f4d7ff" },
    { name: "Lavender", value: "#cac1f4ff" },
    { name: "Peach", value: "#f8e1c6ff" },
    { name: "Rose", value: "#f5cacdff" },
    { name: "Sky Blue", value: "#bcd5f4ff" },
    { name: "Coral", value: "#c9aa82ff" },
    { name: "Sage", value: "#6aa989ff" },
    { name: "Lilac", value: "#b08adaff" },
    { name: "Champagne", value: "#dea756ff" },
    { name: "Navy", value: "#1E3A8A" },
    { name: "Forest", value: "#064E3B" },
    { name: "Charcoal", value: "#1F2937" },
    { name: "Black", value: "#000000" },
  ];

  const aspectRatios = [
    { id: "square", label: "Square", ratio: "1:1" },
    { id: "portrait", label: "Portrait", ratio: "2:3" },
    { id: "landscape", label: "Landscape", ratio: "3:2" },
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
        if (typeof reader.result === 'string') {
          setProductPreview(reader.result);
          removeBackground(reader.result);
        }
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
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageData;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageDataObj.data;
      
      const cornerSamples = [
        { x: 0, y: 0 },
        { x: canvas.width - 1, y: 0 },
        { x: 0, y: canvas.height - 1 },
        { x: canvas.width - 1, y: canvas.height - 1 }
      ];
      
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
      
      const threshold = 40;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
        
        if (diff < threshold) {
          data[i + 3] = 0;
        }
      }
      
      ctx.putImageData(imageDataObj, 0, 0);
      setProcessedImage(canvas.toDataURL('image/png'));
      
    } catch (err) {
      setError("Failed to process image. Please try another image.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Color Palette */}
      <div className="w-40 bg-white border-r border-gray-200 py-8 overflow-y-auto">
  <div className="grid grid-cols-2 gap-4 px-4">
    {colorPalette.map((color) => (
      <button
        key={color.value}
        onClick={() => setSelectedColor(color.value)}
        className={`w-12 h-12 rounded-full border-2 transition-all hover:scale-110 ${
          selectedColor === color.value
            ? "border-blue-600 ring-2 ring-blue-300 scale-110"
            : "border-gray-300"
        }`}
        style={{ backgroundColor: color.value }}
        title={color.name}
      >
        {selectedColor === color.value && (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </button>
    ))}
  </div>
</div>


      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Product Staging</h1>
          <p className="text-sm text-gray-500 mt-1">Remove background and apply beautiful colors</p>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-6 items-start">
              {/* Left Column - Upload */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                {!productPreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg h-80 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-gray-600 font-medium">Upload product image</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={productPreview}
                      alt="Product preview"
                      className="w-full h-80 object-contain bg-gray-50 rounded-lg"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-white text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition shadow-md border border-gray-200"
                    >
                      <X className="w-4 h-4" />
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
                  <div className="flex items-center justify-center gap-2 text-blue-600 mt-4">
                    <Loader2 className="animate-spin w-5 h-5" />
                    <span className="text-sm">Processing...</span>
                  </div>
                )}

                {error && (
                  <p className="text-red-500 text-sm text-center mt-4">
                    {error}
                  </p>
                )}
              </div>

              {/* Arrow */}
              {processedImage && (
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="bg-white rounded-full p-3 shadow-lg border border-gray-200">
                    <ArrowRight className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              )}

              {/* Right Column - Result */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                {processedImage ? (
                  <div className="relative group">
                    <div 
                      className="w-full h-80 rounded-lg flex items-center justify-center p-4"
                      style={{ backgroundColor: selectedColor }}
                    >
                      <img
                        src={processedImage}
                        alt="Product with background"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <a
                      href={processedImage}
                      download="product-with-background.png"
                      className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 opacity-0 group-hover:opacity-100 transition text-sm font-medium shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg h-80 flex flex-col items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <ArrowRight className="w-6 h-6" />
                      </div>
                      <p className="text-sm">Result will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Aspect Ratio Selection */}
            {processedImage && (
              <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-6">
                  <span className="text-sm font-medium text-gray-700">Size</span>
                  <div className="flex gap-4">
                    {aspectRatios.map((aspect) => (
                      <label
                        key={aspect.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="aspect"
                          value={aspect.id}
                          checked={selectedAspect === aspect.id}
                          onChange={(e) => setSelectedAspect(e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">
                          {aspect.label} ({aspect.ratio})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex gap-2 mt-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-pink-700 text-xs font-medium rounded-full border border-pink-200">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
                    </svg>
                    Subject
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    Size: {aspectRatios.find(a => a.id === selectedAspect)?.label} ({aspectRatios.find(a => a.id === selectedAspect)?.ratio})
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
