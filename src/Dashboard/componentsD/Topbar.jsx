import React, { useState, useEffect } from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ projectTitle = 'DesignMind / New Concept' }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    avatar: null
  });
  const [loading, setLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        // First, try to get from localStorage for immediate display
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserData({
            name: user.name || '',
            email: user.email || '',
            avatar: user.avatar || null
          });
        }

        // Then fetch fresh data from API if token exists
        if (token) {
          const res = await fetch('http://localhost:5000/api/auth/profile', {
            headers: {
              'x-auth-token': token
            }
          });

          if (res.ok) {
            const data = await res.json();
            const updatedUser = {
              name: data.user.name || '',
              email: data.user.email || '',
              avatar: data.user.avatar || null
            };
            setUserData(updatedUser);
            // Update localStorage with fresh data
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        }
      } catch (err) {
        console.error('Failed to load user data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = () => {
    // Clear stored authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Navigate to login page
    navigate('/login');
  };
  const handleNotifications = () => {
    navigate('/simple-chat');
    };

  // Get user initials from name
  const getUserInitials = () => {
    if (!userData.name) return 'U';
    const names = userData.name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <header className="flex items-center justify-between px-6 h-14 border-b border-slate-100 bg-white">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-800 ml-16">{projectTitle}</h2>
      </div>

      <div className="flex items-center gap-4">
      
       <button
  onClick={handleNotifications}
  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors"
  title="Notifications"
>
  <Bell className="w-6 h-6" />
</button>

        
        {/* User Avatar and Name */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
          ) : (
            <>
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-sm font-semibold text-white shadow-sm">
                {userData.avatar ? (
                  <img 
                    src={userData.avatar} 
                    alt={userData.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getUserInitials()
                )}
              </div>
              
              {/* User Name */}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-800 leading-tight">
                  {userData.name || 'User'}
                </span>
              </div>
            </>
          )}
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
}