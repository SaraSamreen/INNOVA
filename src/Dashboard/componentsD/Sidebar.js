import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaImage, FaUsers, FaShieldAlt, FaClosedCaptioning, FaMicrophone, FaFileAlt, FaVolumeUp, FaCut, FaEdit, FaBars, FaPalette, FaPhotoVideo } from "react-icons/fa";
import "../../Styles/Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      {/* Toggle Button */}
      <div className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        <FaBars />
      </div>

      {/* Logo */}
      {isOpen && <h1 className="INNOVA">INNOVA</h1>}

      {/* Nav Items */}
      <div className="sidebar-nav">
        <div className="nav-item">
          <FaImage />
          {isOpen && <span>Create image</span>}
        </div>

        <Link to="/logo-generator">
          <div className="nav-item">
            <FaPalette />
            {isOpen && <span>Logo Generator</span>}
          </div>
        </Link>

        <div className="nav-item">
          <FaPhotoVideo />
          {isOpen && <span>Poster Generator</span>}
        </div>

        <Link to="/create-script">
          <button className="createreel">{isOpen ? "+ Create Ad" : "+"}</button>
        </Link>

        <Link to="/team-collaboration">
          <div className="nav-item">
            <FaUsers />
            {isOpen && <span>Team Collaboration</span>}
          </div>
        </Link>

        <Link to="/admin">
          <div className={`nav-item ${location.pathname === "/admin" ? "active" : ""}`}>
            <FaShieldAlt />
            {isOpen && <span>Admin Panel</span>}
          </div>
        </Link>

        <div className="nav-item">
          <FaClosedCaptioning />
          {isOpen && <span>Create Subtitles</span>}
        </div>

        <div className="nav-item">
          <FaMicrophone />
          {isOpen && <span>Create voice over</span>}
        </div>

        <div className="nav-item">
          <FaFileAlt />
          {isOpen && <span>Your Drafts</span>}
        </div>

        <div className="nav-item">
          <FaVolumeUp />
          {isOpen && <span>Add Voice to video</span>}
        </div>

        <div className="nav-item">
          <FaCut />
          {isOpen && <span>Video Trimmer</span>}
        </div>

        <div className="nav-item">
          <FaEdit />
          {isOpen && <span>Editor</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;