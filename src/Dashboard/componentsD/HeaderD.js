import React from 'react';
import { FiBell, FiCalendar, FiSearch, FiSettings } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import '../../Styles/HeaderD.css';

export default function HeaderD() {
  return (
    <header className="header-container">
      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search your videos...."
        />
      </div>
      
      <div className="header-icons">
      
        <FiBell className="icon" />
        
        <Link to="/profile-settings">
          <FiSettings className="icon" />
        </Link>
      </div>
    </header>
  );
}
