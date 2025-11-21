import { useState, useRef } from "react";
import { Upload, X, Loader2, Download } from "lucide-react";

export default function BackRemover() {
  const [imagePreview, setImagePreview] = useState("");
  const [resultImage, setResultImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file");
      return;
    }

    setError("");
    setResultImage("");

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      removeBackground(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview("");
    setResultImage("");
    fileInputRef.current.value = "";
  };

  const removeBackground = async (imageData) => {
    setLoading(true);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = imageData;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageDataObj.data;

      const corners = [
        { x: 0, y: 0 },
        { x: img.width - 1, y: 0 },
        { x: 0, y: img.height - 1 },
        { x: img.width - 1, y: img.height - 1 },
      ];

      let rSum = 0,
        gSum = 0,
        bSum = 0;

      corners.forEach((c) => {
        const idx = (c.y * img.width + c.x) * 4;
        rSum += data[idx];
        gSum += data[idx + 1];
        bSum += data[idx + 2];
      });

      const bgR = rSum / 4;
      const bgG = gSum / 4;
      const bgB = bSum / 4;
      const threshold = 40;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const diff =
          Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);

        if (diff < threshold) data[i + 3] = 0;
      }

      ctx.putImageData(imageDataObj, 0, 0);

      setResultImage(canvas.toDataURL("image/png"));
    } catch (err) {
      console.error(err);
      setError("Failed to remove background. Try another image.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f7ff] py-12 px-4">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">
          Background Remover
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 grid md:grid-cols-2 gap-10">

          {/* LEFT — Upload */}
          <div className="flex flex-col">

            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-gray-300 p-10 rounded-xl text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
              >
                <Upload className="w-14 h-14 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">Click to upload</p>
                <p className="text-xs text-gray-400 mt-1">PNG or JPG</p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={imagePreview}
                  className="w-full h-80 object-contain"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-3 right-3 bg-gray-800 text-white p-2 rounded-full hover:bg-black transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
            />

            {loading && (
              <div className="mt-5 flex items-center justify-center gap-3 text-blue-600 bg-blue-50 py-3 rounded-md">
                <Loader2 className="animate-spin w-5 h-5" />
                <span className="font-medium">Processing...</span>
              </div>
            )}

            {error && (
              <p className="mt-4 text-red-500 bg-red-50 py-3 rounded-md text-center">
                {error}
              </p>
            )}
          </div>

          {/* RIGHT — Result */}
          <div className="flex flex-col">

            <p className="font-semibold text-gray-700 mb-3">
              Output (Transparent PNG)
            </p>

            {resultImage ? (
              <div className="relative border border-gray-200 rounded-xl bg-white shadow-sm">
                <div className="w-full h-80 flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <img
                    src={resultImage}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <a
                  href={resultImage}
                  download="background-removed.png"
                  className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full flex items-center gap-2 shadow-md transition"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
              </div>
            ) : (
              <div className="h-80 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400">
                <p>Your result will appear here</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
