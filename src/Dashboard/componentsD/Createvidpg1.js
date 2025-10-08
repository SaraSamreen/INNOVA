"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom" // ✅ add this
import "../../Styles/Createvidpg1.css"

export default function Createvidpg1() {
  const [inputText, setInputText] = useState("")
  const [charCount, setCharCount] = useState(0)
  const [actor, setActor] = useState("")
  const [background, setBackground] = useState("")
  const [videoType, setVideoType] = useState("")
  const [script, setScript] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const text = e.target.value
    setInputText(text)
    setCharCount(text.length)
  }

  const generateScript = async () => {
    if (!inputText.trim() || !actor || !background || !videoType) {
      alert("Please fill in Actor, Background, Video Type, and description before generating.")
      return
    }

    setLoading(true)
    setScript("")

    try {
      const response = await fetch("http://localhost:5001/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputText,
          actor,
          background,
          videoType,
        }),
      })

      const data = await response.json()

      if (data?.success && data?.enhanced_script) {
        setScript(data.enhanced_script)
        console.log(`✅ Generated using ${data.model}`)
      } else {
        setScript("No script generated. Try again.")
        console.warn("⚠️ Unexpected response:", data)
      }
    } catch (error) {
      console.error("❌ Error generating script:", error)
      setScript("Error connecting to server. Make sure http://localhost:5001 is running.")
    } finally {
      setLoading(false)
    }
  }

  const moveToStep2 = () => {
    if (!actor || !background || !videoType) {
      alert("Please select Actor, Background, and Video Type.")
      return
    }
    if (!script || script.trim() === "") {
      alert("Please generate the script first before moving to Step 2.")
      return
    }

    const payload = {
      script,
      actor,
      background,
      videoType,
      inputText,
    }

    // optional backup
    localStorage.setItem("script", script)
    localStorage.setItem("actor", actor)
    localStorage.setItem("background", background)
    localStorage.setItem("videoType", videoType)
    localStorage.setItem("inputText", inputText)

    // ✅ navigate with state
    navigate("/create/step2", { state: payload })
  }

  const videoTypes = ["product-ad", "service-promo", "brand-awareness", "social-reel"]

  return (
    <main className="cv1-wrapper">
      <header className="cv1-header">
        <h1 className="cv1-title">AI Content Creator</h1>
        <p className="cv1-subtitle">Step 1 — Describe your idea and set options</p>
      </header>

      <section className="cv1-card">
        {/* Actor */}
        <div className="cv1-group">
          <label className="cv1-label">Choose Actor</label>
          <div className="cv1-pills">
            <button
              type="button"
              className={`cv1-pill ${actor === "male" ? "is-active" : ""}`}
              onClick={() => setActor("male")}
            >
              Male
            </button>
            <button
              type="button"
              className={`cv1-pill ${actor === "female" ? "is-active" : ""}`}
              onClick={() => setActor("female")}
            >
              Female
            </button>
          </div>
        </div>

        {/* Background */}
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

        {/* Video Type */}
        <div className="cv1-group">
          <label className="cv1-label">Ad Reel Type</label>
          <div className="cv1-grid">
            {videoTypes.map((type) => {
              const active = videoType === type
              const label = type.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())
              return (
                <button
                  key={type}
                  type="button"
                  className={`cv1-option ${active ? "is-active" : ""}`}
                  onClick={() => setVideoType(type)}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Script Input */}
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
          <button className="cv1-btn cv1-primary" onClick={generateScript} disabled={loading}>
            {loading ? "Generating Script..." : "Generate Script with AI"}
          </button>
          <button className="cv1-btn cv1-secondary" onClick={moveToStep2}>
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
            <p className="cv1-output-text">{script}</p>
          </div>
        )}
      </section>
    </main>
  )
}
