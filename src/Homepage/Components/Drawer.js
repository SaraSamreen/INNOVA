import React from "react";
import { Link } from "react-router-dom";
import "../../Styles/Drawer.css"; 
import { FaTimes } from "react-icons/fa";

const Drawer = ({ toggleDrawer }) => {
  return (
    <div className="drawer-overlay">
      <div className="drawer">
        <button className="close-btn" onClick={toggleDrawer}>
          <FaTimes />
        </button>
        <nav className="drawer-nav">
          <Link to="/" onClick={toggleDrawer}>Home</Link>
          <Link to="/explore" onClick={toggleDrawer}>Explore Prompts</Link>
          <Link to="/create" onClick={toggleDrawer}>Create Prompt</Link>
          <Link to="/trending" onClick={toggleDrawer}>Trending Reels</Link>
          <Link to="/custom-ai" onClick={toggleDrawer}>Custom AI Models</Link>
          <Link to="/about" onClick={toggleDrawer}>About</Link>
          <Link to="/contact" onClick={toggleDrawer}>Contact</Link>
          
        </nav>
      </div>
    </div>
  );
};

export default Drawer;
