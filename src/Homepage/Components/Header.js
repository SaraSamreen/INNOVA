import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../Styles/Header.css";
import Drawer from "./Drawer";
import { FaBars } from "react-icons/fa";

function Header() {
  const [showAIDropdown, setShowAIDropdown] = useState(false);
  const [showStudioDropdown, setShowStudioDropdown] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <header className="sticky-header">
      <Link to="/" className="INNOVA">INNOVA</Link>


      <div className="main-nav-container">
        
        <div 
          className="dropdown-container"
          onMouseEnter={() => setShowAIDropdown(true)}
          onMouseLeave={() => setShowAIDropdown(false)}
        >
          <span className="dropdown-trigger">INNOVA AI▾</span>
          {showAIDropdown && (
            <div className="dropdown">
              <Link to="/explore" className="dropdown-item">AI video generator</Link>
              <Link to="/create" className="dropdown-item">AI Image generator</Link>
              <Link to="/trending" className="dropdown-item">AI subtitle generator</Link>
              <Link to="/custom-ai" className="dropdown-item">Voiceover generator</Link>
            </div>
          )}
        </div>

        {/* Studio Dropdown */}
        <div 
          className="dropdown-container"
          onMouseEnter={() => setShowStudioDropdown(true)}
          onMouseLeave={() => setShowStudioDropdown(false)}
        >
          <span className="dropdown-trigger">INNOVA Studio▾</span>
          {showStudioDropdown && (
            <div className="dropdown studio-dropdown">
              <div className="dropdown-columns">
                <div className="dropdown-column">
                  <div className="dropdown-heading">Studio</div>
                  <Link to="/video-editor" className="dropdown-item">Video Editor</Link>
                  <Link to="/picture-video" className="dropdown-item">Picture To Video Maker</Link>
                  <Link to="/add-text" className="dropdown-item">Add Text to Video</Link>
                  <Link to="/compressor" className="dropdown-item">MP4 Compressor</Link>
                  <Link to="/compressor" className="dropdown-item">Video Trimmer</Link>
                </div>
                <div className="dropdown-column">
                  <div className="dropdown-heading">Templates</div>
                  <Link to="/business-template" className="dropdown-item">Business Video Template</Link>
                  <Link to="/slideshow-template" className="dropdown-item">Slideshow Template</Link>
                  <Link to="/social-template" className="dropdown-item">Social Media Video Template</Link>
                  <Link to="/ad-template" className="dropdown-item">Advertisement Video Template</Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Regular navigation items */}
        
        <Link to="/teamsH" className="nav-link">Team Work</Link> 
        <Link to="/pricingH" className="nav-link">Pricing</Link>
      </div>

      {/* Auth links - separate on the right */}
      <div className="auth-nav-container">
        <Link to="/signup" className="auth-link">Signup</Link>
        <Link to="/login" className="auth-link">Login</Link>
      </div>

      {/* Mobile menu */}
      <div className="mobile-nav">
        <button className="bar-icon" onClick={toggleDrawer}>
          <FaBars />
        </button>
      </div>

      {isDrawerOpen && <Drawer toggleDrawer={toggleDrawer} />}
    </header>
  );
}

export default Header;