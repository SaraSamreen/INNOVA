"use client"

// File: ReelCreationStep.js
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom";
import "../../Styles/ReelCreationStep.css"

export default function ReelCreationStep() {
  const [selectedMethod, setSelectedMethod] = useState("")
  const navigate = useNavigate()

  const handleMethodSelect = (method) => {
    setSelectedMethod(method)
  }

  const handleContinue = () => {
    if (!selectedMethod) {
      alert(" Please select a creation method to continue.")
      return
    }

    switch (selectedMethod) {
      case "ai-assistant":
        navigate("/create-video")
        break
      case "template":
        navigate("/template-browser")
        break
      case "quick-reel":
        navigate("/quick-reel") // replace with actual route
        break
      default:
        break
    }
  }

  return (
    <div className="reel-creation-container">
      <div className="content">
        <h2 className="prompt-text">How do you want to start?</h2>
        <p className="subtitle">Choose your preferred creation method to get started</p>

        <div className="method-cards">

          {/* AI Assistant Card */}
          <div
            className={`method-card ${selectedMethod === "ai-assistant" ? "selected" : ""}`}
            onClick={() => handleMethodSelect("ai-assistant")}
          >
            <div className="card-icon ai-icon"></div>
            <h3 className="card-title">AI Assistant</h3>
            <p className="card-description">
              Let AI guide you step by step through the creation process
            </p>
            <Link to="/create/step2">
              <button className="card-button">Get Started</button>
            </Link>
          </div>

          {/* Template Card */}
          <div
            className={`method-card ${selectedMethod === "template" ? "selected" : ""}`}
            onClick={() => handleMethodSelect("template")}
          >
            <div className="card-icon template-icon"></div>
            <h3 className="card-title">Template</h3>
            <p className="card-description">Browse ready-made templates and customize them</p>
            <button className="card-button">Browse Templates</button>
          </div>

          {/* Quick Reel Card */}
          <div
            className={`method-card ${selectedMethod === "quick-reel" ? "selected" : ""}`}
            onClick={() => handleMethodSelect("quick-reel")}
          >
            <div className="card-icon quick-icon"></div>
            <h3 className="card-title">Quick Reel</h3>
            <p className="card-description">Upload product & create fast with minimal setup</p>
            <button className="card-button">Quick Create</button>
          </div>

        </div>

        <div className="navigation-buttons">
          <button className="continue-button" onClick={handleContinue}>
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}