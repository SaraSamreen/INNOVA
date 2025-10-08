"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
<<<<<<< HEAD
=======
import { videoTemplates } from "../../data/videoTemplates"
>>>>>>> eaba22a5103fc87954126ff6adf3a1d93509d776
import "../../Styles/TemplateBrowser.css"

export default function TemplateBrowser() {
  const [activeCategory, setActiveCategory] = useState("Advertisement")
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()

  const handleTemplateSelect = (template) => {
    // Pass the full template object with all necessary data
    navigate("/template-editor", { 
      state: { 
        template: {
          ...template,
          // Ensure all necessary data is included
          videoUrl: template.videoUrl || "",
          defaultScript: template.defaultScript,
          scenes: template.scenes || []
        }
      } 
    })
  }

  const handleBackToCreation = () => {
    navigate("/reel-creation")
  }

  const filteredTemplates = videoTemplates[activeCategory].filter((template) =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="template-browser-container">
      {/* Header */}
      <div className="template-header">
        <div className="header-left">
          <button className="back-button" onClick={handleBackToCreation}>
            <span role="img" aria-label="arrow-left">←</span> Back
          </button>
          <div className="library-info">
            <h1 className="library-title">Video Template Library</h1>
            <span className="template-count">
              {Object.values(videoTemplates).flat().length} templates available
            </span>
          </div>
        </div>

        <div className="header-right">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search video templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        <button
          className={`category-tab ${activeCategory === "Advertisement" ? "active" : ""}`}
          onClick={() => setActiveCategory("Advertisement")}
        >
          Advertisement ({videoTemplates.Advertisement.length})
        </button>
        <button
          className={`category-tab ${activeCategory === "Ecommerce" ? "active" : ""}`}
          onClick={() => setActiveCategory("Ecommerce")}
        >
          Ecommerce ({videoTemplates.Ecommerce.length})
        </button>
      </div>

      {/* Templates Grid */}
      <div className="templates-grid">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="template-card" onClick={() => handleTemplateSelect(template)}>
            <div className="template-thumbnail">
              <img src={template.thumbnail || "/placeholder.svg"} alt={template.title} />
              <div className="template-overlay">
                <button className="use-template-btn">
                  <span role="img" aria-label="film-camera">🎬</span> Customize & Edit
                </button>
                <div className="template-features">
                  <span className="feature-tag">
                    <span role="img" aria-label="pencil">✏️</span> Editable Script
                  </span>
                  <span className="feature-tag">
                    <span role="img" aria-label="musical-note">🎵</span> AI Voice
                  </span>
                  <span className="feature-tag">
                    <span role="img" aria-label="video-camera">🎥</span> HD Template
                  </span>
                </div>
              </div>
            </div>
            <div className="template-info">
              <h3 className="template-title">{template.title}</h3>
              <span className="template-category">{template.category}</span>
              <p className="template-description">
                {template.defaultScript.substring(0, 80)}...
              </p>
              <div className="template-stats">
                <span className="stat">
                  <span role="img" aria-label="clock">⏱️</span> {template.scenes?.length || 3} scenes
                </span>
                <span className="stat">
                  <span role="img" aria-label="speech-balloon">💬</span> Custom script
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="no-results">
          <div className="no-results-content">
            <span role="img" aria-label="magnifying-glass" className="no-results-icon">🔍</span>
            <h3>No templates found</h3>
            <p>No video templates found matching "{searchQuery}"</p>
            <p>Try searching for different keywords or browse other categories.</p>
            <button 
              className="clear-search-btn" 
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </button>
          </div>
        </div>
      )}
    </div>
  )
}