import React, { useState } from "react";
import { X, Bell } from "lucide-react";

const TeamNotification = ({ notifications, setNotifications }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
    
    // Mark all as read when opening
    if (!isOpen && notifications.some(n => !n.read)) {
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true
      }));
      setNotifications(updatedNotifications);
    }
  };

  const clearNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setIsOpen(false);
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <div className="notification-container">
      <button 
        className="notification-btn"
        onClick={toggleNotifications}
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>
      
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button 
                className="clear-all-btn"
                onClick={clearAllNotifications}
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-content">
                    <p>{notification.message}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                  <button 
                    className="clear-notification-btn"
                    onClick={() => clearNotification(notification.id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="no-notifications">
                <p>No notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamNotification;