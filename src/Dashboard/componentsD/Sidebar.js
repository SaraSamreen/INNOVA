import React from "react"
import { Link, useLocation } from "react-router-dom"
import "../../Styles/Sidebar.css"

const Sidebar = () => {
  const location = useLocation() // You need to call the hook inside the component

  return (
    <div className="sidebar">
      <h1 className="INNOVA">INNOVA</h1>

      <div className="sidebar-nav">
        <p className="nav-item">Create image</p>

        <Link to="/create-video">
          <button className="createreel">+ Create Ad</button>
        </Link>

        <Link to="/team-collaboration">
          <p className="nav-item cursor-pointer">Team Collaboration</p>
        </Link>

        <Link to="/admin">
          <p className={`nav-item cursor-pointer ${location.pathname === "/admin" ? "active" : ""}`}>🛡️ Admin Panel</p>
        </Link>

        <p className="nav-item">Create Subtitles</p>
        <p className="nav-item">Create voice over</p>
        <p className="nav-item">Create picture To video</p>
        <p className="nav-item">Check Leads on Social media</p>
        <p className="nav-item">Post on Social Media with captions</p>
        <p className="nav-item">Your Drafts</p>
        <p className="nav-item">Add Text to video</p>
        <p className="nav-item">MP4 compressor</p>
        <p className="nav-item">Video Trimmer</p>
        <p className="nav-item">Editor</p>
      </div>
    </div>
  )
}

export default Sidebar
