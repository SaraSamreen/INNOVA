import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Createvidpg2() {
  const location = useLocation();
  const { prompt, images, duration } = location.state || {};

  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prompt) {
      // Call backend to enhance the prompt
      setLoading(true);
      fetch("http://localhost:5000/enhance-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.script) {
            setScript(data.script);
          } else {
            setScript(prompt); // fallback
          }
        })
        .catch((err) => {
          console.error("Error enhancing script", err);
          setScript(prompt);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [prompt]);

  return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 border overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Idea (prompt) to video</h2>
          <button className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
        </div>

        {/* Steps */}
        <div className="flex justify-between items-center mb-10">
          {["Prompt", "Script", "Customization"].map((step, index, arr) => (
            <div key={index} className="flex flex-col items-center text-center relative w-1/4">
              {index !== 0 && <div className="absolute left-0 top-5 w-1/2 h-0.5 bg-gray-300" />}
              {index !== arr.length - 1 && <div className="absolute right-0 top-5 w-1/2 h-0.5 bg-gray-300" />}
              <div
                className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-full border-2 bg-white
                  ${index === 2 ? "border-pink-500 text-pink-500" : "border-gray-300 text-gray-400"}`}
              >
                {index + 1}
              </div>
              <span className="mt-2 text-sm text-gray-600">{step}</span>
            </div>
          ))}
        </div>

        {/* Info */}
        <p className="text-gray-600 mb-6">
          {loading ? "Generating script…" : "Review and edit your voiceover script before generating your video."}
        </p>

        {/* Script Box */}
        <div className="h-96 overflow-y-auto border rounded-xl p-4">
          <textarea
            className="w-full h-full resize-none p-4 border rounded-lg focus:ring-2 focus:ring-pink-400"
            value={script}
            onChange={(e) => setScript(e.target.value)}
          />
        </div>

        {/* Bottom Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <Link to="/step1">
            <button className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">Back</button>
          </Link>
          <Link to="/step3" state={{ prompt, images, duration, script }}>
            <button className="px-6 py-2 rounded-lg bg-pink-500 text-white shadow hover:bg-pink-600">
              Next →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
