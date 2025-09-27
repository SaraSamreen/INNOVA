"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../../Styles/TemplateBrowser.css"

export default function TemplateBrowser() {
  const [activeCategory, setActiveCategory] = useState("Advertisement")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const navigate = useNavigate()

  // Sample template data - only Advertisement and Ecommerce
  const templates = {
    Advertisement: [
      {
        id: 1,
        title: "Product Launch Ad",
        thumbnail: "/product-launch-advertisement-video-template.jpg",
        category: "Advertisement",
      },
      {
        id: 2,
        title: "Brand Awareness",
        thumbnail: "/brand-awareness-advertisement-video-template.jpg",
        category: "Advertisement",
      },
      {
        id: 3,
        title: "Social Media Ad",
        thumbnail: "/social-media-advertisement-video-template.jpg",
        category: "Advertisement",
      },
      
    ],
    Ecommerce: [
      {
        id: 4,
        title: "Product Showcase",
        thumbnail: "/ecommerce-product-showcase-video-template.jpg",
        category: "Ecommerce",
      },
      {
        id: 5,
        title: "Sale Announcement",
        thumbnail: "/ecommerce-sale-announcement-video-template.jpg",
        category: "Ecommerce",
      },
      
      {
        id: 6,
        title: "Shopping Guide",
        thumbnail: "/ecommerce-shopping-guide-video-template.jpg",
        category: "Ecommerce",
      },
    ],
    Others: [
      {
        id: 7,
        title: "Training Workshop",
        thumbnail: "/other-product-showcase-video-template.jpg",
        category: "Others",
      },
      
    ],
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    // Navigate to the next step or show template editor
    // You can replace this with your actual next route
    alert(`✅ Selected template: ${template.title} (hook this to your template editor)`)
  }

  const handleBackToCreation = () => {
    // Navigate back to the reel creation step
    navigate("/reel-creation")
  }

  const filteredTemplates = templates[activeCategory].filter((template) =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="template-browser-container">
      {/* Header */}
      <div className="template-header">
        <div className="header-left">
          <button className="back-button" onClick={handleBackToCreation}>
            ← Back
          </button>
          <div className="library-info">
            <h1 className="library-title">Template Library</h1>
            <span className="template-count">{Object.values(templates).flat().length}</span>
          </div>
        </div>

        <div className="header-right">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search templates"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        <button
          className={`category-tab ${activeCategory === "Advertisement" ? "active" : ""}`}
          onClick={() => setActiveCategory("Advertisement")}
        >
          Advertisement
        </button>
        <button
          className={`category-tab ${activeCategory === "Ecommerce" ? "active" : ""}`}
          onClick={() => setActiveCategory("Ecommerce")}
        >
          Ecommerce
        </button>
        <button
          className={`category-tab ${activeCategory === "Others" ? "active" : ""}`}
          onClick={() => setActiveCategory("Others")}
        >
          Others
        </button>
      </div>

      {/* Templates Grid */}
      <div className="templates-grid">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="template-card" onClick={() => handleTemplateSelect(template)}>
            <div className="template-thumbnail">
              <img src={template.thumbnail || "/placeholder.svg"} alt={template.title} />
              <div className="template-overlay">
                <button className="use-template-btn">Use Template</button>
              </div>
            </div>
            <div className="template-info">
              <h3 className="template-title">{template.title}</h3>
              <span className="template-category">{template.category}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="no-results">
          <p>No templates found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  )
}