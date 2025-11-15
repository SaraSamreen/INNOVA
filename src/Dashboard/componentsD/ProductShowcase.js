import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const BACKEND_PORT = process.env.REACT_APP_PRODUCT_SERVER_PORT || 5002;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;

export default function ProductShowcase() {
  const location = useLocation();
  const selectedModel = location.state?.model;

  const [productFile, setProductFile] = useState(null);
  const [productPreview, setProductPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [finalImage, setFinalImage] = useState(null);
  const fileRef = useRef();

  if (!selectedModel) {
    return (
      <div className="min-h-screen bg-blue-50 p-8 text-center text-red-600">
        No model selected. Please go back to the home page.
      </div>
    );
  }

  // Convert file → base64 (returns ONLY the raw base64)
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProductFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setProductPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // --- Generate final image ---
  const generateFinal = async () => {
    if (!productFile) {
      alert("Please upload a product image first.");
      return;
    }

    try {
      setLoading(true);
      setFinalImage(null);

      const productB64 = await fileToBase64(productFile);

      const payload = {
        model_image_path: selectedModel, // homepage selected model
        product_image: productB64,       // raw base64 of product
      };

      const res = await fetch(`${BACKEND_URL}/generate-final`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      // Backend returns: { success: true, final: "<base64>" }
      setFinalImage(`data:image/png;base64,${data.final}`);
    } catch (err) {
      console.error(err);
      alert("Generation error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Selected Model */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="font-semibold mb-2">Selected Model</h2>
          <img
            src={selectedModel}
            alt="Model"
            className="max-h-72 mx-auto rounded"
          />
        </div>

        {/* Product Upload */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="font-semibold mb-2">Upload Bag / Product</h2>

          <div
            className="border-2 border-dashed p-4 rounded text-center cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            {productPreview ? (
              <img
                src={productPreview}
                alt="preview"
                className="max-h-40 mx-auto"
              />
            ) : (
              <div className="text-gray-500">
                <div className="text-4xl mb-2">👜</div>
                <div>Select product image</div>
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={generateFinal}
          disabled={loading}
          className={`w-full py-3 rounded text-white font-medium ${
            loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Generating..." : "Generate Final Image"}
        </button>

        {/* Output */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Final Output</h2>

          {!finalImage ? (
            <div className="h-56 border-2 border-dashed rounded flex items-center justify-center text-gray-400">
              No result yet
            </div>
          ) : (
            <img src={finalImage} className="w-full rounded shadow" alt="Result" />
          )}
        </div>
      </div>
    </div>
  );
}