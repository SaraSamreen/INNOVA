"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
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
      {
        id: 4,
        title: "Service Promotion",
        thumbnail: "/service-promotion-advertisement-video-template.jpg",
        category: "Advertisement",
      },
    
    ],
    Ecommerce: [
      {
        id: 5,
        title: "Product Showcase",
        thumbnail: "/ecommerce-product-showcase-video-template.jpg",
        category: "Ecommerce",
      },
      {
        id: 6,
        title: "Sale Announcement",
        thumbnail: "/ecommerce-sale-announcement-video-template.jpg",
        category: "Ecommerce",
      },
      {
        id: 7,
        title: "Customer Review",
        thumbnail: "/ecommerce-customer-review-video-template.jpg",
        category: "Ecommerce",
      },

    
    ],
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    navigate("/template-editor", { state: { template } })
  }

  const handleBackToCreation = () => {
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
