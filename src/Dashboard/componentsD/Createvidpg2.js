// "use client" needed if used in Next.js App Router
"use client"

import React  from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import "../../Styles/Createvidpg2.css"

const VOICES = [
  {
    id: "voice-a",
    name: "Nova (Warm, Female)",
    description: "Clear, friendly tone suitable for explainers.",
    script:
      "Hello! I'm Nova. I have a warm and friendly tone that's perfect for explaining complex topics in an approachable way.",
    voiceName: "Google US English",
    rate: 0.9,
    pitch: 1.1,
    lang: "en-US",
  },
  {
    id: "voice-b",
    name: "Orion (Confident, Male)",
    description: "Authoritative and engaging for announcements.",
    script:
      "Greetings. I'm Orion. My confident and authoritative voice is ideal for announcements and professional presentations.",
    voiceName: "Google UK English Male",
    rate: 0.95,
    pitch: 0.9,
    lang: "en-GB",
  },
  {
    id: "voice-c",
    name: "Lyra (Calm, Female)",
    description: "Soft and relaxed for meditative content.",
    script:
      "Welcome. I'm Lyra. My calm and soothing voice creates a peaceful atmosphere for meditation and relaxation content.",
    voiceName: "Google US English",
    rate: 0.8,
    pitch: 1.0,
    lang: "en-US",
  },
  {
    id: "voice-d",
    name: "Atlas (Energetic, Male)",
    description: "High energy for promos and ads.",
    script:
      "Hey there! I'm Atlas! My energetic and dynamic voice brings excitement to your promotional content and advertisements!",
    voiceName: "Google UK English Male",
    rate: 1.1,
    pitch: 1.0,
    lang: "en-GB",
  },
  {
    id: "voice-e",
    name: "Iris (Neutral, Female)",
    description: "Balanced delivery for tutorials.",
    script:
      "Hi, I'm Iris. My neutral and balanced voice provides clear instruction for tutorials and educational content.",
    voiceName: "Google US English",
    rate: 0.95,
    pitch: 1.0,
    lang: "en-US",
  },
  {
    id: "voice-f",
    name: "Cedar (Natural, Male)",
    description: "Warm and natural for storytelling.",
    script:
      "Hello friend, I'm Cedar. My warm and natural voice brings stories to life with an authentic, engaging quality.",
    voiceName: "Google UK English Male",
    rate: 0.9,
    pitch: 0.95,
    lang: "en-GB",
  },
]

function VoiceCard({ id, name, description, selected, onSelect, onPlay, onStop, isPlaying }) {
  const handleCardClick = () => onSelect(id)
  const handlePlayClick = (e) => {
    e.stopPropagation()
    if (isPlaying) onStop()
    else onPlay()
  }

  
  return (
    <div
      className={`v2-card ${selected ? "selected" : ""} ${isPlaying ? "playing" : ""}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleCardClick()}
      aria-pressed={selected}
      aria-label={`Voice option: ${name}`}
    >
      <div className="v2-card-head">
        <h3 className="v2-name">{name}</h3>
        {selected && <span className="v2-badge">Selected</span>}
      </div>
      <p className="v2-desc">{description}</p>
      <button className="v2-play" onClick={handlePlayClick} aria-label={isPlaying ? "Stop preview" : "Play preview"}>
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
  )
}

export default function Createvidpg2() {
  const navigate = useNavigate()
  const location = useLocation()
  const step1Data = location.state || {}
  const { script, actor, background, videoType, inputText } = step1Data
  const [selected, setSelected] = React.useState(null)
  const [voices, setVoices] = React.useState([])
  const [currentlyPlaying, setCurrentlyPlaying] = React.useState(null)


  React.useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices()
      setVoices(available)
    }
    loadVoices()
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
    return () => window.speechSynthesis.cancel()
  }, [])

  React.useEffect(() => {
    const savedVoice = JSON.parse(localStorage.getItem("selectedVoice"))
    if (savedVoice) setSelected(savedVoice.id)
  }, [])

  const playSceneAudio = (voiceConfig) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(voiceConfig.script)
    utterance.rate = voiceConfig.rate
    utterance.pitch = voiceConfig.pitch
    utterance.lang = voiceConfig.lang

    const match = voices.find(
      (v) =>
        v.name.includes(voiceConfig.voiceName) ||
        (voiceConfig.name.includes("Female") && v.name.toLowerCase().includes("female")) ||
        (voiceConfig.name.includes("Male") && v.name.toLowerCase().includes("male")),
    )
    if (match) utterance.voice = match

    setCurrentlyPlaying(voiceConfig.id)
    utterance.onend = () => setCurrentlyPlaying(null)
    utterance.onerror = () => setCurrentlyPlaying(null)
    window.speechSynthesis.speak(utterance)
  }

  const stopAudio = () => {
    window.speechSynthesis.cancel()
    setCurrentlyPlaying(null)
  }

  const handleNext = () => {
    if (!selected) {
      alert("Please select a voice before proceeding to Step 3.")
      return
    }
    
    const selectedVoice = VOICES.find((v) => v.id === selected)
    localStorage.setItem("selectedVoice", JSON.stringify(selectedVoice))
    navigate("/create/step3", {
      state: {
        ...step1Data,
        selectedVoice,
        voiceId: selected,
      },
    })
  }

  return (
    <div className="v2-shell">
      <header className="v2-header">
        <div>
          <h1 className="v2-title">Choose Your Voice</h1>
          <p className="v2-subtitle">Preview samples and select one to continue to Step 3.</p>
        </div>
        <Link to="/" className="v2-back">
          Back to Start
        </Link>
      </header>

      <section className="v2-grid" aria-label="Voice samples">
        {VOICES.map((voice) => (
          <VoiceCard
            key={voice.id}
            id={voice.id}
            name={voice.name}
            description={voice.description}
            selected={selected === voice.id}
            onSelect={setSelected}
            onPlay={() => playSceneAudio(voice)}
            onStop={stopAudio}
            isPlaying={currentlyPlaying === voice.id}
          />
        ))}
      </section>

      <footer className="v2-footer">
        <div className="v2-status">
          {selected ? (
            <span>
              Selected: <strong className="v2-selected">{selected}</strong>
            </span>
          ) : (
            <span>No voice selected</span>
          )}
        </div>
        <div className="v2-actions">
          <Link to="/" className="btn btn-outline">
            Back
          </Link>
          <button className="btn btn-primary" onClick={handleNext} disabled={!selected}>
            Move to Step 3 ➝
          </button>
        </div>
      </footer>
    </div>
  )
}