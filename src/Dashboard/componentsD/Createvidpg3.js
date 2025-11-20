"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE } from "../../api/config";

function AvatarCard({ avatar, selected, onSelect, onPlay, onStop, isPlaying }) {
  const handleCardClick = () => onSelect(avatar.id);
  const handlePlayClick = (e) => {
    e.stopPropagation();
    isPlaying ? onStop() : onPlay();
  };

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      className={`relative rounded-xl border-2 overflow-hidden transition-all cursor-pointer
        ${selected ? "border-blue-500 shadow-2xl ring-4 ring-blue-100" : "border-gray-200 hover:border-gray-400"}
        ${isPlaying ? "border-green-500 ring-4 ring-green-100" : "hover:shadow-xl hover:-translate-y-2"}
      `}
    >
      {/* Preview Image/Video */}
      <div className="aspect-video bg-gray-100 relative">
        {avatar.preview_video ? (
          <video
            src={avatar.preview_video}
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <img
            src={avatar.preview_image || "/avatar-placeholder.png"}
            alt={avatar.name}
            className="w-full h-full object-cover"
          />
        )}

        {/* Play Button Overlay */}
        {avatar.preview_video && (
          <button
            onClick={handlePlayClick}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition"
          >
            <div className={`p-4 rounded-full ${isPlaying ? "bg-green-500" : "bg-white"} shadow-lg`}>
              {isPlaying ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-gray-900">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4 bg-white">
        <h3 className="font-bold text-gray-900 text-center">{avatar.name}</h3>
        <div className="flex justify-center gap-2 mt-2">
          {avatar.gender && (
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
              {avatar.gender === "male" ? "Male" : "Female"}
            </span>
          )}
          {avatar.is_public !== undefined && (
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              {avatar.is_public ? "Public" : "Premium"}
            </span>
          )}
        </div>

        {selected && (
          <div className="mt-3 text-center">
            <span className="inline-block bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold">
              Selected
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Createvidpg3() {
  const navigate = useNavigate();
  const location = useLocation();

  const storedData = JSON.parse(localStorage.getItem("create_video_payload")) || {};
  const step1Data = location.state || storedData;

  const [avatars, setAvatars] = useState([]);
  const [loadingAvatars, setLoadingAvatars] = useState(true);
  const [selected, setSelected] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingAvatar, setCurrentPlayingAvatar] = useState(null);
  const [videoEl, setVideoEl] = useState(null);
  const [error, setError] = useState(null);

  // Fetch avatars from HeyGen API
  useEffect(() => {
    fetchAvatars();
  }, []);

  const fetchAvatars = async () => {
    try {
      setLoadingAvatars(true);
      setError(null);

      const response = await fetch(`${API_BASE}/list-avatars`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch avatars from HeyGen");
      }

      const data = await response.json();
      let fetchedAvatars = data.avatars || [];

      // Optional: Filter only public avatars or high-quality ones
      fetchedAvatars = fetchedAvatars
        .filter(a => a.preview_image || a.preview_video)
        .filter(a => a.is_public !== false); // Prefer public

      setAvatars(fetchedAvatars);

      // Auto-select first avatar or restore from storage
      if (fetchedAvatars.length > 0 && !selected) {
        const savedAvatar = JSON.parse(localStorage.getItem("selectedAvatar") || "null");
        if (savedAvatar && fetchedAvatars.find(a => a.id === savedAvatar.id)) {
          setSelected(savedAvatar.id);
        } else {
          setSelected(fetchedAvatars[0].id);
        }
      }

      setLoadingAvatars(false);
    } catch (err) {
      console.error("Failed to fetch avatars:", err);
      setError("Failed to load avatars from HeyGen. Please check your API key.");
      setLoadingAvatars(false);
    }
  };

  // Cleanup video on unmount
  useEffect(() => {
    return () => {
      if (videoEl) {
        videoEl.pause();
        videoEl.src = "";
      }
    };
  }, [videoEl]);

  const playAvatarPreview = (avatar) => {
    if (isPlaying && currentPlayingAvatar === avatar.id) {
      stopPreview();
      return;
    }

    if (!avatar.preview_video) return;

    stopPreview(); // Stop any previous

    setIsPlaying(true);
    setCurrentPlayingAvatar(avatar.id);

    const video = document.querySelector(`video[src="${avatar.preview_video}"]`);
    if (video) {
      video.muted = false;
      video.play().catch(() => {
        setError("Preview failed to play");
        setIsPlaying(false);
      });

      video.onended = () => {
        setIsPlaying(false);
        setCurrentPlayingAvatar(null);
      };
    }
  };

  const stopPreview = () => {
    if (currentPlayingAvatar) {
      const video = document.querySelector(`video[src*="${currentPlayingAvatar}"]`);
      if (video) {
        video.pause();
        video.muted = true;
      }
      setIsPlaying(false);
      setCurrentPlayingAvatar(null);
    }
  };

  const handleNext = async () => {
    if (!selected) {
      alert("Please select an avatar");
      return;
    }

    const selectedAvatar = avatars.find((a) => a.id === selected);
    if (!selectedAvatar) {
      alert("Selected avatar not found");
      return;
    }

    try {
      setError(null);

      // Save to localStorage
      localStorage.setItem("selectedAvatar", JSON.stringify(selectedAvatar));

      // Save to backend
      try {
        await fetch(`${API_BASE}/save-selected-avatar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar_id: selectedAvatar.id }),
          credentials: "include",
        });
      } catch (e) {
        console.warn("Failed to save avatar to backend (continuing)", e);
      }

      // Navigate to video generation page
      navigate("/create/step4", {
        state: {
          ...step1Data,
          selectedAvatar,
          selectedVoice: JSON.parse(localStorage.getItem("selectedVoice") || "null"),
        },
      });
    } catch (err) {
      setError("Failed to proceed");
    }
  };

  const handleBack = () => navigate(-1);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen flex flex-col">
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Choose Your Avatar</h1>
          <p className="text-lg text-gray-600 mt-2">Pick a realistic talking avatar from HeyGen</p>
        </div>
        <button
          onClick={handleBack}
          className="px-4 py-2 rounded-lg border bg-white text-blue-600 font-semibold hover:bg-gray-50 transition"
        >
          ← Back
        </button>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {loadingAvatars ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-6"></div>
            <p className="text-xl text-gray-700">Loading avatars from HeyGen...</p>
          </div>
        </div>
      ) : avatars.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-10 bg-yellow-50 border border-yellow-300 rounded-xl">
            <p className="text-2xl font-bold text-yellow-900 mb-4">No avatars available</p>
            <p className="text-yellow-700 mb-6">
              Your HeyGen API key might be invalid or have no access to avatars.
            </p>
            <button
              onClick={fetchAvatars}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Retry Loading Avatars
            </button>
          </div>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 flex-1">
            {avatars.map((avatar) => (
              <AvatarCard
                key={avatar.id}
                avatar={avatar}
                selected={selected === avatar.id}
                onSelect={setSelected}
                onPlay={() => playAvatarPreview(avatar)}
                onStop={stopPreview}
                isPlaying={isPlaying && currentPlayingAvatar === avatar.id}
              />
            ))}
          </section>

          <footer className="mt-8 bg-white p-6 border-t rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-lg">
              {selected ? (
                <>
                  Selected Avatar: <strong className="text-blue-600">
                    {avatars.find(a => a.id === selected)?.name}
                  </strong>
                </>
              ) : (
                <span className="text-gray-500">No avatar selected</span>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={!selected}
              className={`px-8 py-4 rounded-lg font-bold text-lg transition ${
                selected
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Generate Video →
            </button>
          </footer>
        </>
      )}
    </div>
  );
}