"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE } from "../../api/config";

const PRESET_COLORS = [
  "#FFFFFF", "#000000", "#1E293B", "#0F172A", "#1E40AF", "#7C3AED",
  "#EC4899", "#F59E0B", "#10B981", "#06B6D4", "#8B5CF6", "#F43F5E"
];

const BACKGROUND_TEMPLATES = [
  { id: "studio-01", name: "Modern Studio", thumbnail: "https://cdn.heygen.com/backgrounds/studio-01.jpg" },
  { id: "office-02", name: "Corporate Office", thumbnail: "https://cdn.heygen.com/backgrounds/office-02.jpg" },
  { id: "gradient-blue", name: "Blue Gradient", thumbnail: "https://cdn.heygen.com/backgrounds/gradient-blue.jpg" },
  { id: "podcast-room", name: "Podcast Room", thumbnail: "https://cdn.heygen.com/backgrounds/podcast.jpg" },
  { id: "green-screen", name: "Green Screen", thumbnail: "https://cdn.heygen.com/backgrounds/green-screen.jpg" },
];

export default function Createvidpg4() {
  const navigate = useNavigate();
  const location = useLocation();

  const [script, setScript] = useState("");
  const [videoURL, setVideoURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pollingId, setPollingId] = useState(null);
  const [error, setError] = useState(null);

  const [selectedVoice, setSelectedVoice] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedBackground, setSelectedBackground] = useState({ type: "color", value: "#FFFFFF" });

  // Background selection state
  const [bgTab, setBgTab] = useState("color");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [bgTemplate, setBgTemplate] = useState(null);
  const [bgCustomUrl, setBgCustomUrl] = useState("");
  const [uploadingBg, setUploadingBg] = useState(false);

  // Load all saved data
  useEffect(() => {
    const voice = JSON.parse(localStorage.getItem("selectedVoice") || "null");
    const avatar = JSON.parse(localStorage.getItem("selectedAvatar") || "null");
    const savedBg = JSON.parse(localStorage.getItem("selectedBackground") || `{"type":"color","value":"#FFFFFF"}`);
    const savedScript = localStorage.getItem("draftScript") || "";

    setSelectedVoice(voice);
    setSelectedAvatar(avatar);
    setSelectedBackground(savedBg);
    setScript(savedScript);

    // Restore background tab state
    if (savedBg.type === "color") {
      setBgTab("color");
      setBgColor(savedBg.value);
    } else if (savedBg.type === "template") {
      setBgTab("template");
      setBgTemplate(savedBg.value);
    } else if (savedBg.type === "image") {
      setBgTab("custom");
      setBgCustomUrl(savedBg.value);
    }

    if (!voice || !avatar) {
      navigate("/create/step2", { replace: true });
    }
  }, []);

  // Auto-save script
  useEffect(() => {
    if (script) localStorage.setItem("draftScript", script);
  }, [script]);

  // Auto-save background
  useEffect(() => {
    const bg = bgTab === "color" ? { type: "color", value: bgColor }
             : bgTab === "template" ? { type: "template", value: bgTemplate }
             : bgTab === "custom" && bgCustomUrl ? { type: "image", value: bgCustomUrl }
             : null;

    if (bg) {
      setSelectedBackground(bg);
      localStorage.setItem("selectedBackground", JSON.stringify(bg));
    }
  }, [bgTab, bgColor, bgTemplate, bgCustomUrl]);

  // Polling
  useEffect(() => {
    if (!pollingId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/video-status?video_id=${pollingId}`, { credentials: "include" });
        const data = await res.json();
        const status = (data?.data?.status || data?.status || "").toLowerCase();
        const url = data?.data?.video_url || data?.video_url;

        if (["completed", "succeeded", "done"].includes(status) && url) {
          setVideoURL(url);
          setPollingId(null);
          setLoading(false);
          localStorage.removeItem("draftScript");
        } else if (["failed", "error"].includes(status)) {
          setError("Video generation failed. Please try again.");
          setPollingId(null);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [pollingId]);

  const generateVideo = async () => {
    if (!script.trim()) return alert("Please write a script!");

    setLoading(true);
    setError(null);
    setVideoURL(null);

    try {
      const payload = {
        text: script.trim(),
        avatar_id: selectedAvatar.id,
        voice_id: selectedVoice.id,
        background: selectedBackground, // ← Sent to backend!
      };

      const res = await fetch(`${API_BASE}/generate-heygen-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok || res.status === 202) {
        if (data.video_url) {
          setVideoURL(data.video_url);
          setLoading(false);
        } else if (data.video_id) {
          setPollingId(data.video_id);
        }
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const uploadCustomBg = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingBg(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload-background`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (data.url) {
        setBgCustomUrl(data.url);
        setBgTab("custom");
      }
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploadingBg(false);
    }
  };

  const handleBack = () => navigate(-1);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <button
        onClick={handleBack}
        className="mb-6 px-4 py-2 rounded-lg border bg-white text-blue-600 font-semibold hover:bg-gray-50"
      >
        ← Back
      </button>

      <h1 className="text-4xl font-bold text-gray-900 mb-3">Create Your Video</h1>
      <p className="text-xl text-gray-600 mb-10">Script, background, and generate — all in one place</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 shadow">
          <p className="text-sm font-semibold text-gray-500">Voice</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
              {selectedVoice?.name?.[0]}
            </div>
            <div>
              <p className="font-bold">{selectedVoice?.name}</p>
              <p className="text-xs text-gray-500">{selectedVoice?.language}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <p className="text-sm font-semibold text-gray-500">Avatar</p>
          <div className="flex items-center gap-4 mt-3">
            <img src={selectedAvatar?.preview_image} alt="" className="w-12 h-12 rounded-full object-cover" />
            <p className="font-bold">{selectedAvatar?.name}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <p className="text-sm font-semibold text-gray-500">Background</p>
          <div className="flex items-center gap-3 mt-3">
            {selectedBackground.type === "color" && (
              <div className="w-12 h-12 rounded-full border-4 border-gray-300" style={{ backgroundColor: selectedBackground.value }} />
            )}
            {selectedBackground.type === "template" && (
              <div className="text-sm font-medium">HeyGen Scene</div>
            )}
            {selectedBackground.type === "image" && (
              <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-dashed" />
            )}
            <p className="font-bold capitalize">{selectedBackground.type}</p>
          </div>
        </div>
      </div>

      {/* Background Selector */}
      <div className="bg-white rounded-3xl p-8 shadow-lg mb-10">
        <h2 className="text-2xl font-bold mb-6">Choose Background</h2>

        <div className="flex gap-8 mb-8 border-b pb-2">
          {["color", "template", "custom"].map((tab) => (
            <button
              key={tab}
              onClick={() => setBgTab(tab)}
              className={`pb-3 px-1 font-semibold capitalize transition
                ${bgTab === tab ? "text-blue-600 border-b-4 border-blue-600" : "text-gray-500"}
              `}
            >
              {tab === "color" ? "Color" : tab === "template" ? "HeyGen Scenes" : "Upload Image"}
            </button>
          ))}
        </div>

        {bgTab === "color" && (
          <div className="grid grid-cols-8 gap-4">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setBgColor(c)}
                className={`w-16 h-16 rounded-xl border-4 transition hover:scale-110 ${
                  bgColor === c ? "border-blue-500 shadow-xl" : "border-gray-300"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}

        {bgTab === "template" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {BACKGROUND_TEMPLATES.map((t) => (
              <div
                key={t.id}
                onClick={() => setBgTemplate(t.id)}
                className={`rounded-xl overflow-hidden cursor-pointer border-4 transition ${
                  bgTemplate === t.id ? "border-blue-500 shadow-2xl" : "border-gray-200"
                }`}
              >
                <div className="aspect-video">
                  <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover" />
                </div>
                <p className="p-3 text-center text-sm font-medium">{t.name}</p>
              </div>
            ))}
          </div>
        )}

        {bgTab === "custom" && (
          <div className="text-center py-10">
            {bgCustomUrl ? (
              <div>
                <img src={bgCustomUrl} alt="Custom BG" className="max-h-64 mx-auto rounded-xl shadow-2xl" />
                <button
                  onClick={() => setBgCustomUrl("")}
                  className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="cursor-pointer inline-block">
                <div className="border-4 border-dashed border-gray-300 rounded-2xl p-10 hover:border-blue-400 transition">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-xl font-semibold">Upload Background Image</p>
                  <p className="text-sm text-gray-500 mt-2">JPG, PNG • Max 10MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadCustomBg}
                  className="hidden"
                  disabled={uploadingBg}
                />
              </label>
            )}
            {uploadingBg && <p className="mt-4 text-blue-600">Uploading...</p>}
          </div>
        )}
      </div>

      {/* Script Input */}
      <div className="bg-white rounded-3xl p-8 shadow-lg mb-10">
        <label className="block text-2xl font-bold mb-4">Your Script</label>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Write your script here...

Example:
Hi, I'm Alex! Welcome to our new AI video platform. Today we're showing you how easy it is to create professional videos in seconds."
          className="w-full h-64 p-6 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none resize-none"
        />
        <p className="mt-4 text-right text-gray-600">
          {script.trim().split(/\s+/).length} words • ~{Math.round(script.trim().split(/\s+/).length / 1.8)}s
        </p>
      </div>

      {error && (
        <div className="p-6 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 mb-8">
          <strong>Error:</strong> {error}
        </div>
      )}

      <button
        onClick={generateVideo}
        disabled={loading || !script.trim()}
        className={`w-full py-6 rounded-3xl text-2xl font-bold text-white transition transform
          ${loading || !script.trim()
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:scale-105"
          }`}
      >
        {loading ? "Generating Video..." : "Generate Video"}
      </button>

      {/* Processing */}
      {loading && pollingId && (
        <div className="mt-12 p-10 bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl text-center border-2 border-amber-300">
          <div className="inline-block animate-spin rounded-full h-20 w-20 border-8 border-amber-500 border-t-transparent mb-6"></div>
          <h3 className="text-3xl font-bold text-amber-900">Creating your masterpiece...</h3>
          <p className="mt-4 text-lg">This takes 30–90 seconds. Hang tight!</p>
        </div>
      )}

      {/* Success */}
      {videoURL && (
        <div className="mt-12 p-12 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl text-center border-4 border-emerald-300">
          <div className="text-8xl mb-8">Checkmark</div>
          <h2 className="text-4xl font-bold text-emerald-900 mb-8">Your Video is Ready!</h2>

          <video
            src={videoURL}
            controls
            className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl"
            poster={selectedAvatar?.preview_image}
          />

          <div className="mt-10 flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href={videoURL}
              download
              className="px-12 py-5 bg-emerald-600 text-white text-xl font-bold rounded-2xl hover:bg-emerald-700 shadow-xl"
            >
              Download Video
            </a>
            <button
              onClick={() => {
                setScript("");
                setVideoURL(null);
                setPollingId(null);
                setLoading(false);
              }}
              className="px-12 py-5 bg-white border-2 border-emerald-600 text-emerald-600 text-xl font-bold rounded-2xl hover:bg-emerald-50"
            >
              Create Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}