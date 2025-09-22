"use client"
import React from "react"
import { useState, useRef } from "react"
import "../../Styles/Createvidpg1.css"

export default function Createvidpg1() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedModel, setSelectedModel] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [script, setScript] = useState("")
  const [avatarName, setAvatarName] = useState("")
  const [avatarAge, setAvatarAge] = useState("")
  const [avatarGender, setAvatarGender] = useState("")
  const [playingVoice, setPlayingVoice] = useState(null)

  const fileInputRef = useRef()

  const voices = [
    { id: "luna", name: "Lovely Luna", accent: "Casual", age: "Young", flag: "🇺🇸" },
    { id: "tahlia", name: "Tahlia Brooks", accent: "Casual", age: "Young", flag: "🇺🇸" },
    { id: "annie", name: "Little Annie", accent: "Childish", age: "Young", flag: "🇺🇸" },
    { id: "marcus", name: "Marcus Stone", accent: "Professional", age: "Adult", flag: "🇺🇸" },
    { id: "sophia", name: "Sophia Chen", accent: "Elegant", age: "Adult", flag: "🇺🇸" },
  ]

  const handleUploadClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      console.log("User selected file:", file)
      setUploadedFile(file)
      setSelectedModel("custom")
    }
  }

  const handleModelSelect = (modelIndex) => {
    setSelectedModel(modelIndex)
    setUploadedFile(null)
  }

  const handleVoiceSelect = (voiceId) => {
    setSelectedVoice(voiceId)
  }

  const handleVoicePlay = (voiceId) => {
    if (playingVoice === voiceId) {
      setPlayingVoice(null)
    } else {
      setPlayingVoice(voiceId)
      setTimeout(() => setPlayingVoice(null), 3000)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedModel !== null
      case 2:
        return selectedVoice !== null
      case 3:
        return script.trim().length > 0
      case 4:
        return avatarName.trim().length > 0
      default:
        return true
    }
  }

  const nextStep = () => {
    if (canProceed() && currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const generateAvatar = () => {
    const avatarData = {
      model: selectedModel,
      uploadedFile,
      voice: selectedVoice,
      script,
      name: avatarName,
      age: avatarAge,
      gender: avatarGender,
    }
    console.log("Generating avatar with data:", avatarData)
    alert("Avatar generation started! Check console for data.")
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Step 1: Choose Your AI Model"
      case 2:
        return "Step 2: Choose VoiceOver"
      case 3:
        return "Step 3: Write Script"
      case 4:
        return "Step 4: Customize Avatar"
      case 5:
        return "Step 5: Preview & Generate"
      default:
        return ""
    }
  }

  const getButtonText = () => {
    switch (currentStep) {
      case 1:
        return "Next: Choose voiceover →"
      case 2:
        return "Next: Write script →"
      case 3:
        return "Next: Customize →"
      case 4:
        return "Next: Preview →"
      case 5:
        return "Generate Avatar"
      default:
        return "Next →"
    }
  }

  return (
    <div className="create-video-wrapper">
      {/* Step Timeline */}
      <div className="step-timeline">
        <div className={`step ${currentStep === 1 ? "active" : currentStep > 1 ? "completed" : ""}`}>
          1. Choose Model
        </div>
        <div className={`line ${currentStep > 1 ? "completed" : ""}`}></div>
        <div className={`step ${currentStep === 2 ? "active" : currentStep > 2 ? "completed" : ""}`}>
          2. Choose VoiceOver
        </div>
        <div className={`line ${currentStep > 2 ? "completed" : ""}`}></div>
        <div className={`step ${currentStep === 3 ? "active" : currentStep > 3 ? "completed" : ""}`}>
          3. Write Script
        </div>
        <div className={`line ${currentStep > 3 ? "completed" : ""}`}></div>
        <div className={`step ${currentStep === 4 ? "active" : currentStep > 4 ? "completed" : ""}`}>4. Customize</div>
        <div className={`line ${currentStep > 4 ? "completed" : ""}`}></div>
        <div className={`step ${currentStep === 5 ? "active" : ""}`}>5. Preview & Generate</div>
      </div>

      {/* Content Area */}
      <div className="content-area">
        <h2 className="main-heading">{getStepTitle()}</h2>

        {/* Step 1: Choose Model */}
        {currentStep === 1 && (
          <div className="face-grid">
            {[1, 2, 3, 4, 5, 6, 7].map((index) => (
              <img
                key={index}
                src={`./videos/face${index}.png`}
                alt={`Face ${index}`}
                className={selectedModel === index ? "selected" : ""}
                onClick={() => handleModelSelect(index)}
              />
            ))}
            <div className="upload-box" onClick={handleUploadClick}>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <p>Upload Model</p>
              <span className="plus-sign">+</span>
              {uploadedFile && <span className="file-name">{uploadedFile.name}</span>}
            </div>
          </div>
        )}

        {/* Step 2: Choose VoiceOver */}
        {currentStep === 2 && (
          <div className="voice-selection">
            <div className="voice-header">
              <h3>Smart Voice Match</h3>
              <span className="recommended-badge">Recommended</span>
              <p>We've chosen voices that best match your avatar</p>
            </div>
            <div className="voice-list">
              {voices.map((voice) => (
                <div
                  key={voice.id}
                  className={`voice-item ${selectedVoice === voice.id ? "selected" : ""}`}
                  onClick={() => handleVoiceSelect(voice.id)}
                >
                  <div className="voice-info">
                    <button
                      className="play-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleVoicePlay(voice.id)
                      }}
                    >
                      {playingVoice === voice.id ? "⏸️" : "▶️"}
                    </button>
                    <div className="voice-details">
                      <span className="voice-flag">{voice.flag}</span>
                      <span className="voice-name">{voice.name}</span>
                    </div>
                  </div>
                  <div className="voice-tags">
                    <span className="voice-tag">{voice.accent}</span>
                    <span className="voice-tag">{voice.age}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Write Script */}
        {currentStep === 3 && (
          <div className="script-section">
            <div className="script-input">
              <label>Enter your script or prompt</label>
              <textarea
                placeholder="Enter your script here... For example: 'Hi, I'm your AI assistant. I'm here to help you with any questions you might have.'"
                value={script}
                onChange={(e) => setScript(e.target.value)}
                rows="8"
              />
              <p className="character-count">Character count: {script.length} / 1000</p>
            </div>
            <div className="script-tips">
              <h4>💡 Script Tips:</h4>
              <ul>
                <li>Keep sentences clear and conversational</li>
                <li>Add natural pauses with commas and periods</li>
                <li>Avoid complex technical jargon</li>
                <li>Consider your audience and tone</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 4: Customize */}
        {currentStep === 4 && (
          <div className="customize-section">
            <div className="customize-form">
              <div className="form-group">
                <label>Avatar Name *</label>
                <input
                  type="text"
                  placeholder="What do you want to name your avatar?"
                  value={avatarName}
                  onChange={(e) => setAvatarName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Age</label>
                <select value={avatarAge} onChange={(e) => setAvatarAge(e.target.value)}>
                  <option value="">Select age range</option>
                  <option value="18-25">18-25</option>
                  <option value="26-35">26-35</option>
                  <option value="36-45">36-45</option>
                  <option value="46-55">46-55</option>
                  <option value="55+">55+</option>
                </select>
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select value={avatarGender} onChange={(e) => setAvatarGender(e.target.value)}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>
            <div className="avatar-preview">
              <h4>Avatar Preview</h4>
              <div className="preview-card">
                <div className="preview-avatar"></div>
                <p className="preview-name">{avatarName || "Your Avatar"}</p>
                <p className="preview-details">
                  {avatarAge && `Age: ${avatarAge}`}
                  <br />
                  Voice: {voices.find((v) => v.id === selectedVoice)?.name || "Not selected"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Preview & Generate */}
        {currentStep === 5 && (
          <div className="preview-section">
            <div className="summary-card">
              <h4>Avatar Summary</h4>
              <div className="summary-item">
                <span>Model:</span>
                <span>{selectedModel === "custom" ? "Custom Upload" : `Face ${selectedModel}`}</span>
              </div>
              <div className="summary-item">
                <span>Voice:</span>
                <span>{voices.find((v) => v.id === selectedVoice)?.name}</span>
              </div>
              <div className="summary-item">
                <span>Name:</span>
                <span>{avatarName}</span>
              </div>
              <div className="summary-item">
                <span>Script Length:</span>
                <span>{script.length} characters</span>
              </div>
            </div>
            <div className="script-preview">
              <h4>Script Preview</h4>
              <p>
                "{script.substring(0, 200)}
                {script.length > 200 ? "..." : ""}"
              </p>
            </div>
            <div className="video-preview">
              <h4>Video Preview</h4>
              <div className="preview-placeholder">
                <div className="play-icon">▶️</div>
                <p>Preview will be generated</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="button-container">
          {currentStep > 1 && (
            <button className="prev-button" onClick={prevStep}>
              ← Previous
            </button>
          )}
          <button
            className={`step-button ${!canProceed() ? "disabled" : ""}`}
            onClick={currentStep === 5 ? generateAvatar : nextStep}
            disabled={!canProceed()}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  )
}
