import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Createvidpg1() {
  const [images, setImages] = useState([]);
  const [duration, setDuration] = useState(30); // default 30 seconds
  const [prompt, setPrompt] = useState(""); // store user prompt

  // Handle image file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file =>
      file.type === "image/jpeg" || file.type === "image/png"
    );
    setImages(validFiles.slice(0, 11)); // max 11 files
  };

  return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 border">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Idea (prompt) to video</h2>
          <button className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
        </div>

        {/* Steps */}
        <div className="flex justify-between items-center mb-10">
          {["Prompt", "Script", "Customization"].map((step, index, arr) => (
            <div key={index} className="flex flex-col items-center text-center relative w-1/4">
              {index !== 0 && <div className="absolute left-0 top-5 w-1/2 h-0.5 bg-gray-300"></div>}
              {index !== arr.length - 1 && <div className="absolute right-0 top-5 w-1/2 h-0.5 bg-gray-300"></div>}
              <div
                className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-full border-2 bg-white
                  ${index === 0 ? "border-pink-500 text-pink-500" : "border-gray-300 text-gray-400"}
                `}
              >
                {index + 1}
              </div>
              <span className="mt-2 text-sm text-gray-600">{step}</span>
            </div>
          ))}
        </div>

        {/* Prompt Input */}
        <div className="mb-6">
          <label className="text-gray-700 font-medium">Prompt</label>
          <textarea
            className="w-full mt-2 border rounded-lg p-3 h-24 focus:ring-2 focus:ring-pink-400 focus:outline-none"
            placeholder="Eg: Motivating video on the benefits of eating healthy diet and exercising"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        {/* Duration Slider */}
        <div className="mb-6">
          <label className="text-gray-700 font-medium">Duration: {duration} seconds</label>
          <input
            type="range"
            min="10"
            max="60"  // max 1 minute
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full mt-2"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-8">
          <label className="text-gray-700 font-medium">Upload Images (.jpg/.png)</label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            multiple
            onChange={handleFileChange}
            className="mt-2 w-full"
          />

          {/* Preview Selected Images */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              {images.map((img, index) => (
                <div key={index} className="w-full h-32 border rounded overflow-hidden">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`preview-${index}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
            Skip and create
          </button>

          <Link
            to="/step2"
            state={{ prompt, images, duration }} // pass data to next page
          >
            <button className="px-6 py-2 rounded-lg bg-pink-500 text-white shadow hover:bg-pink-600">
              Next →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
