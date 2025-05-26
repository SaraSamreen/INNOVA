import React from "react"
import "../../Styles/AdminCommandHub.css"


const AdminHeader = () => {
  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <h1 className="admin-title">Admin Command Hub</h1>
        <span className="admin-subtitle">Manage your platform efficiently</span>
      </div>
      <div className="admin-header-right">
        <div className="admin-profile">
          <img src="/placeholder.svg?height=40&width=40" alt="Admin" className="admin-avatar" />
          <span className="admin-name">Admin User</span>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
