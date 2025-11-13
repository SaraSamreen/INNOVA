"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/Createvidpg1.css";
import { API_BASE } from "../../api/config";

export default function Createvidpg1() {
  const [inputText, setInputText] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [actor, setActor] = useState("");
  const [background, setBackground] = useState("");
  const [videoType, setVideoType] = useState("");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);
    setCharCount(text.length);
  };

  // Call backend to generate script via Gemini
  const generateScript = async () => {
    if (!inputText.trim() || !actor || !background || !videoType) {
      alert("Please fill in Actor, Background, Video Type, and description before generating.");
      return;
    }

    setLoading(true);
    setScript("");

    try {
      const res = await fetch(`${API_BASE}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate_script",
          keywords: `${inputText}, actor: ${actor}, background: ${background}, type: ${videoType}`,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        throw new Error(txt || `Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data?.success && data?.output) {
        setScript(data.output);
        console.log(`✅ Script generated using ${data.model || "unknown model"}`);
      } else {
        setScript("No script generated. Try again.");
      }
    } catch (error) {
      console.error("❌ Error generating script:", error);
      setScript("Error connecting to backend. Ensure it's running.");
      alert("Failed to generate script. Check backend and console for details.");
    } finally {
      setLoading(false);
    }
  };

  const moveToStep2 = () => {
    if (!actor || !background || !videoType) {
      alert("Please select Actor, Background, and Video Type.");
      return;
    }
    if (!script || script.trim() === "") {
      alert("Please generate the script first before moving to Step 2.");
      return;
    }

    const payload = { script, actor, background, videoType, inputText };
    localStorage.setItem("create_video_payload", JSON.stringify(payload));
    navigate("/create/step2", { state: payload });
  };

  const videoTypes = ["product-ad", "service-promo", "brand-awareness", "social-reel"];

  return (
    <main className="cv1-wrapper">
      <header className="cv1-header">
        <h1 className="cv1-title">AI Content Creator</h1>
        <p className="cv1-subtitle">Step 1 — Describe your idea and set options</p>
      </header>

      <section className="cv1-card">
        {/* Actor selection */}


        {/* Background selection */}
        <div className="cv1-group">
          <label className="cv1-label" htmlFor="bg-select">
            Select Background
          </label>
          <div className="cv1-select-wrap">
            <select
              id="bg-select"
              className="cv1-select"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
            >
              <option value="">Select Background</option>
              <option value="studio">Studio</option>
              <option value="office">Office</option>
              <option value="nature">Nature</option>
              <option value="portrait">Portrait</option>
              <option value="abstract">Abstract</option>
            </select>
          </div>
        </div>

        {/* Video type */}
        <div className="cv1-group">
          <label className="cv1-label">Ad Reel Type</label>
          <div className="cv1-grid">
            {videoTypes.map((type) => (
              <button
                key={type}
                type="button"
                className={`cv1-option ${videoType === type ? "is-active" : ""}`}
                onClick={() => setVideoType(type)}
              >
                {type.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Idea input */}
        <div className="cv1-group">
          <label className="cv1-label" htmlFor="idea-input">
            Describe your idea
          </label>
          <div className="cv1-textarea-wrap">
            <textarea
              id="idea-input"
              className="cv1-textarea"
              value={inputText}
              onChange={handleInputChange}
              placeholder="e.g., Promote eco-friendly shoes for Gen Z audience..."
              maxLength={32000}
              rows={6}
            />
            <div className="cv1-counter">{charCount}/32000</div>
          </div>
        </div>

        {/* Actions */}
        <div className="cv1-actions">
          <button
            className="cv1-btn cv1-primary"
            onClick={generateScript}
            disabled={loading}
          >
            {loading ? "Generating Script..." : "Generate Script with AI"}
          </button>

          <button
            className="cv1-btn cv1-secondary"
            onClick={moveToStep2}
            disabled={!script || script.trim() === ""}
            title={!script ? "Generate script first" : "Go to Step 2"}
          >
            Move to Step 2 →
          </button>
        </div>

        {/* Output */}
        {script && (
          <div className="cv1-output">
            <div className="cv1-output-head">
              <span className="cv1-dot" aria-hidden="true"></span>
              <h3 className="cv1-output-title">Enhanced Ad Script</h3>
            </div>
            <p className="cv1-output-text" style={{ whiteSpace: "pre-wrap" }}>
              {script}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
