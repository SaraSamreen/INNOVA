"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../Styles/Createvidpg2.css";
import { API_BASE } from "../../api/config";

const VOICES = [
  { id: "voice-a", name: "Nova (Warm, Female)", description: "Clear, friendly tone suitable for explainers.", voiceCode: "nova" },
  { id: "voice-b", name: "Orion (Confident, Male)", description: "Authoritative and engaging for announcements.", voiceCode: "orion" },
  { id: "voice-c", name: "Lyra (Calm, Female)", description: "Soft and relaxed for meditative content.", voiceCode: "lyra" },
  { id: "voice-d", name: "Atlas (Energetic, Male)", description: "High energy for promos and ads.", voiceCode: "atlas" },
  { id: "voice-e", name: "Iris (Neutral, Female)", description: "Balanced delivery for tutorials.", voiceCode: "iris" },
  { id: "voice-f", name: "Cedar (Natural, Male)", description: "Warm and natural for storytelling.", voiceCode: "cedar" },
];

function VoiceCard({ id, name, description, selected, onSelect, onPlay, onStop, isPlaying }) {
  const handleCardClick = () => onSelect(id);
  const handlePlayClick = (e) => {
    e.stopPropagation();
    isPlaying ? onStop() : onPlay();
  };

  return (
    <div
      className={`v2-card ${selected ? "selected" : ""} ${isPlaying ? "playing" : ""}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
    >
      <div className="v2-card-head">
        <h3 className="v2-name">{name}</h3>
        {selected && <span className="v2-badge">Selected</span>}
      </div>
      <p className="v2-desc">{description}</p>

      <button className="v2-play" onClick={handlePlayClick}>
        {isPlaying ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
            <span>Stop</span>
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Preview</span>
          </>
        )}
      </button>
    </div>
  );
}

export default function Createvidpg2() {
  const navigate = useNavigate();
  const location = useLocation();

  const storedData = JSON.parse(localStorage.getItem("create_video_payload")) || {};
  const step1Data = location.state || storedData;
  // Script removed from destructuring
  const { actor, background, videoType, inputText } = step1Data;

  const [selected, setSelected] = useState(JSON.parse(localStorage.getItem("selectedVoice"))?.id || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    return () => {
      if (audio) audio.pause();
    };
  }, [audio]);

  const playVoicePreview = async (voice) => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    try {
      setIsPlaying(true);
      const res = await fetch(`${API_BASE}/preview-voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "This is a short preview of the selected voice.",
          voice: voice.voiceCode,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch voice preview");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audioEl = new Audio(url);
      setAudio(audioEl);
      audioEl.play();
      audioEl.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
    } catch (err) {
      console.error("Preview error:", err);
      alert("Failed to load voice preview.");
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (!selected) {
      alert("Please select a voice before continuing.");
      return;
    }

    const selectedVoice = VOICES.find((v) => v.id === selected);
    localStorage.setItem("selectedVoice", JSON.stringify(selectedVoice));

    navigate("/create/step3", {
      state: { ...step1Data, selectedVoice },
    });
  };

  const handleBack = () => navigate(-1);

  return (
    <div className="v2-shell">
      <header className="v2-header">
        <div>
          <h1 className="v2-title">Choose Your Voice</h1>
          <p className="v2-subtitle">Preview and select a voice to continue to Step 2.</p>
        </div>
        <button onClick={handleBack} className="v2-back">← Back</button>
      </header>

      <section className="v2-grid">
        {VOICES.map((voice) => (
          <VoiceCard
            key={voice.id}
            id={voice.id}
            name={voice.name}
            description={voice.description}
            selected={selected === voice.id}
            onSelect={setSelected}
            onPlay={() => playVoicePreview(voice)}
            onStop={stopAudio}
            isPlaying={isPlaying && selected === voice.id}
          />
        ))}
      </section>

      <footer className="v2-footer">
        <div className="v2-status">
          {selected ? (
            <span>
              Selected: <strong className="v2-selected">{VOICES.find(v => v.id === selected).name}</strong>
            </span>
          ) : (
            <span>No voice selected</span>
          )}
        </div>
        <div className="v2-actions">
          <button className="btn btn-outline" onClick={handleBack}>← Back</button>
          <button className="btn btn-primary" onClick={handleNext} disabled={!selected}>
            Next ➝
          </button>
        </div>
      </footer>
    </div>
  );
}
