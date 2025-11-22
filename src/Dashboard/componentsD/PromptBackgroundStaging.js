import { useState, useEffect, useRef } from "react";
import { Upload, Loader2, Sparkles } from "lucide-react";

export default function PromptBackgroundStaging() {
  const [productFile, setProductFile] = useState(null);
  const [productPreview, setProductPreview] = useState("");
  const [processedImage, setProcessedImage] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [productType, setProductType] = useState("watch");
  const [modelGender, setModelGender] = useState("female");
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("");
  const [scale, setScale] = useState(1);

  // Drag controls
  const [pos, setPos] = useState({ x: 80, y: 80 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const fileInputRef = useRef(null);

  const productTypes = [
    { value: "watch", label: "Watch" },
    { value: "bag", label: "Bag/Handbag" },
    { value: "sunglasses", label: "Sunglasses" },
    { value: "jewelry", label: "Jewelry" },
    { value: "cosmetics", label: "Cosmetics" },
    { value: "perfume", label: "Perfume" },
    { value: "shoes", label: "Shoes" },
    { value: "accessories", label: "Accessories" },
  ];

  // ---------------------------------------
  // UPLOAD HANDLER
  // ---------------------------------------
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProductFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setProductPreview(reader.result);
      setProcessedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ---------------------------------------
  // BUILD PROMPT FOR FASHION MODEL
  // ---------------------------------------
  const buildPrompt = () => {
    const genderText = modelGender === "male" ? "male" : "female";
    const productDesc = productTypes.find((p) => p.value === productType)?.label || productType;

    let prompt = `Professional high-end fashion photography, ${genderText} fashion model, `;

    switch (productType) {
      case "watch":
        prompt += `elegant pose showing wrist with luxury watch, hand elegantly positioned, sophisticated styling`;
        break;
      case "bag":
        prompt += `holding designer handbag, confident pose, luxury fashion setting`;
        break;
      case "sunglasses":
        prompt += `wearing stylish sunglasses, cool confident expression, fashion editorial style`;
        break;
      case "jewelry":
        prompt += `wearing elegant jewelry piece, close-up detail shot, luxurious styling`;
        break;
      case "cosmetics":
        prompt += `flawless makeup, beauty close-up, holding cosmetic product elegantly, soft lighting`;
        break;
      case "perfume":
        prompt += `holding perfume bottle gracefully, luxury aesthetic, elegant pose`;
        break;
      case "shoes":
        prompt += `fashionable footwear showcase, styled pose, high-end fashion`;
        break;
      case "accessories":
        prompt += `wearing fashion accessories, editorial style photography`;
        break;
      default:
        prompt += `showcasing ${productDesc} elegantly`;
    }

    prompt += `, studio lighting, professional photography, clean white or minimal background, high fashion, ultra realistic, 8k quality, photorealistic`;

    if (additionalPrompt.trim()) {
      prompt += `, ${additionalPrompt}`;
    }

    return prompt;
  };

  // ---------------------------------------
  // GENERATE MODEL IMAGE VIA BACKEND
  // ---------------------------------------
  const generateModelImage = async () => {
    if (!productPreview) {
      alert("Please upload a product image first");
      return;
    }

    setIsGenerating(true);
    setGenerationStatus("Submitting request...");
    setGeneratedImage("");

    try {
      const prompt = buildPrompt();

      // Call YOUR backend endpoint
      const response = await fetch("/api/generate-model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          productType: productType,
          modelGender: modelGender,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Backend Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        setGenerationStatus("Complete!");
      } else {
        throw new Error("No image URL received from backend");
      }
    } catch (error) {
      console.error("Generation error:", error);
      alert(`Failed to generate image: ${error.message}`);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationStatus(""), 2000);
    }
  };

  // ---------------------------------------
  // DRAG LOGIC
  // ---------------------------------------
  const startDrag = (e) => {
    dragging.current = true;
    offset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  };

  const stopDrag = () => (dragging.current = false);

  const doDrag = (e) => {
    if (!dragging.current) return;
    setPos({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  useEffect(() => {
    window.addEventListener("mousemove", doDrag);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", doDrag);
      window.removeEventListener("mouseup", stopDrag);
    };
  });

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center p-6"
      style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
    >
      <div className="w-full max-w-4xl mb-6">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          AI Model Product Staging
        </h1>
        <p className="text-white/80 text-center text-sm">
          Generate professional model imagery for your products
        </p>
      </div>

      {/* OUTPUT CANVAS */}
      <div className="w-full max-w-3xl h-[500px] rounded-xl overflow-hidden bg-white shadow-2xl border relative mb-6">
        {generatedImage ? (
          <img
            src={generatedImage}
            className="w-full h-full object-cover"
            alt="Generated Model"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col gap-3">
            <Sparkles className="w-16 h-16 text-gray-300" />
            <p className="text-lg">AI-generated model will appear here...</p>
            <p className="text-sm text-gray-400">
              Upload a product and click generate
            </p>
          </div>
        )}

        {/* PRODUCT OVERLAY (draggable) */}
        {generatedImage && processedImage && (
          <img
            src={processedImage}
            onMouseDown={startDrag}
            className="absolute cursor-move drop-shadow-2xl"
            style={{
              left: pos.x,
              top: pos.y,
              width: `${150 * scale}px`,
            }}
            alt="Product"
          />
        )}

        {/* LOADING OVERLAY */}
        {isGenerating && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
              <p className="text-gray-700 font-medium">{generationStatus}</p>
              <p className="text-xs text-gray-500">This may take 30-60 seconds</p>
            </div>
          </div>
        )}
      </div>

      {/* CONTROLS */}
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl p-6 space-y-4">
        {/* Product Upload */}
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {productPreview ? (
              <img
                src={processedImage || productPreview}
                className="w-20 h-20 rounded-lg border-2 border-purple-200 object-cover"
                alt="Product preview"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                <Upload className="w-8 h-8" />
              </div>
            )}
          </div>

          <button
            onClick={() => fileInputRef.current.click()}
            className="px-6 py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Product Image
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Product Type & Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-700 text-sm font-medium block mb-2">
              Product Type
            </label>
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              {productTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-700 text-sm font-medium block mb-2">
              Model Gender
            </label>
            <select
              value={modelGender}
              onChange={(e) => setModelGender(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
        </div>

        {/* Additional Prompt */}
        <div>
          <label className="text-gray-700 text-sm font-medium block mb-2">
            Additional Details (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g., outdoor setting, casual style, vibrant colors..."
            value={additionalPrompt}
            onChange={(e) => setAdditionalPrompt(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={generateModelImage}
          disabled={isGenerating || !productPreview}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Model Image
            </>
          )}
        </button>
      </div>

      {/* SIZE SLIDER */}
      {generatedImage && processedImage && (
        <div className="w-full max-w-3xl bg-white p-4 mt-4 rounded-xl shadow-2xl">
          <label className="text-gray-700 text-sm font-medium block mb-2">
            Product Size on Model
          </label>
          <input
            type="range"
            min="0.3"
            max="2.5"
            step="0.05"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}