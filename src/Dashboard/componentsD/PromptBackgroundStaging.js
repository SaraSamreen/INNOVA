import { useState, useEffect, useRef } from "react";
import { Upload, Loader2, SendHorizontal } from "lucide-react";

export default function PromptBackgroundStaging() {
  const [productFile, setProductFile] = useState(null);
  const [productPreview, setProductPreview] = useState("");
  const [processedImage, setProcessedImage] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [promptText, setPromptText] = useState("");
  const [scale, setScale] = useState(1);

  // Drag controls
  const [pos, setPos] = useState({ x: 80, y: 80 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const fileInputRef = useRef(null);

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
      removeBackground(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ---------------------------------------
  // BACKGROUND REMOVAL (simple algorithm)
  // ---------------------------------------
  const removeBackground = async (imageData) => {
    const img = new Image();
    img.src = imageData;
    await img.decode();

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const r = data[0];
    const g = data[1];
    const b = data[2];
    const threshold = 40;

    for (let i = 0; i < data.length; i += 4) {
      const diff =
        Math.abs(data[i] - r) +
        Math.abs(data[i + 1] - g) +
        Math.abs(data[i + 2] - b);

      if (diff < threshold) data[i + 3] = 0;
    }

    ctx.putImageData(imgData, 0, 0);
    setProcessedImage(canvas.toDataURL("image/png"));
  };

  // ---------------------------------------
  // GENERATE BACKGROUND USING POLLINATIONS
  // ---------------------------------------
  const generateBackground = async () => {
    if (!promptText.trim()) {
      alert("Please enter a prompt");
      return;
    }

    const encoded = encodeURIComponent(promptText);
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=768&nologo=true`;

    setBackgroundImage("");
    const img = new Image();
    img.onload = () => {
      setBackgroundImage(imageUrl);
    };
    img.src = imageUrl;
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
    <div className="min-h-screen w-full flex flex-col items-center p-6"
         style={{ background: "linear-gradient(#d6eaff,#ebf6ff)" }}>
      
      {/* OUTPUT CANVAS */}
      <div className="w-full max-w-3xl h-[420px] rounded-xl overflow-hidden bg-white shadow border relative mb-6">
        {backgroundImage ? (
          <img
            src={backgroundImage}
            className="w-full h-full object-cover"
            alt="Generated Background"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Background will appear here...
          </div>
        )}

        {/* PRODUCT ON TOP (only after BG exists) */}
        {backgroundImage && processedImage && (
          <img
            src={processedImage}
            onMouseDown={startDrag}
            className="absolute cursor-move drop-shadow-xl"
            style={{
              left: pos.x,
              top: pos.y,
              width: `${150 * scale}px`,
            }}
            alt="Product"
          />
        )}
      </div>

      {/* PROMPT + PRODUCT BUBBLE */}
      <div className="w-full max-w-2xl flex items-center gap-3 bg-white p-3 rounded-full shadow border">
        {/* Product small bubble */}
        {productPreview ? (
          <img
            src={processedImage ? processedImage : productPreview}
            className="w-12 h-12 rounded-full border object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
            No Img
          </div>
        )}

        <input
          type="text"
          placeholder="Describe the background…"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          className="flex-1 bg-transparent outline-none px-2 text-gray-700"
        />

        <button
          onClick={() => fileInputRef.current.click()}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <Upload className="w-5 h-5 text-gray-600" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <button
          onClick={generateBackground}
          className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
        >
          <SendHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* SIZE SLIDER */}
      {backgroundImage && processedImage && (
        <div className="w-full max-w-2xl bg-white p-4 mt-4 rounded-xl shadow border">
          <label className="text-gray-700 text-sm font-medium">Product Size</label>
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
  );
}
