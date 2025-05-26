import React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Bell, Settings, Users } from "lucide-react"

const TeamHeader = ({ activeTeam, onInviteClick, notifications }) => {
  const [showNotifications, setShowNotifications] = useState(false)

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="team-header">
      <div className="team-header-left">
        {activeTeam ? (
          <>
            <h2>{activeTeam.name}</h2>
            <div className="team-members-count">
              <Users size={16} />
              <span>{activeTeam.members} members</span>
            </div>
          </>
        ) : (
          <h2>Team Collaboration</h2>
        )}
      </div>

      <div className="team-header-actions">
        {activeTeam && (
          <button className="invite-btn" onClick={onInviteClick}>
            + Invite Member
          </button>
        )}

        <div className="notification-container">
          <button className="notification-btn" onClick={toggleNotifications}>
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                <button className="mark-all-read">Mark all as read</button>
              </div>

              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={notification.id} className={`notification-item ${!notification.read ? "unread" : ""}`}>
                      <p>{notification.message}</p>
                      <span className="notification-time">{notification.time}</span>
                    </div>
                  ))
                ) : (
                  <p className="no-notifications">No notifications</p>
                )}
              </div>
            </div>
          )}
        </div>

        <Link to="/profile-settings" className="team-settings-btn">
          <Settings size={20} />
        </Link>
      </div>
    </div>
  )
}

export default TeamHeader
