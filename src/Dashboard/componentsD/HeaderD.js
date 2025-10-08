import React, { useEffect, useState } from 'react';
import { FiBell, FiCalendar, FiSearch, FiSettings } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import '../../Styles/HeaderD.css';

export default function HeaderD() {
  const [userInitial, setUserInitial] = useState(null);

  useEffect(() => {
    // Try to load user info from localStorage (where you likely stored it after login/signup)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const name = parsedUser.name || parsedUser.email || 'U';
      setUserInitial(name.charAt(0).toUpperCase()); // Take first letter
    }
  }, []);

  return (
    <header className="header-container">
      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input type="text" placeholder="Search your videos...." />
      </div>

      <div className="header-icons">
        <FiCalendar className="icon" />
        <FiBell className="icon" />

        <Link to="/User" className="profile-container">
          {userInitial ? (
            <div className="profile-initial">
              {userInitial}
            </div>
          ) : (
            <img src="/avatar.png" alt="User" className="profile-pic" />
          )}
        </Link>

        <Link to="/profile-settings">
          <FiSettings className="icon" />
        </Link>
      </div>
    </header>
  );
}
