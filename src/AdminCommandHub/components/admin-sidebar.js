import React from "react"
import "../../Styles/AdminCommandHub.css"

const AdminSidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const menuItems = [
    { id: "advertisers", label: "Advertiser Management", icon: "👥" },
    { id: "activity-logs", label: "Activity Logs", icon: "📊" },
    { id: "subscription-plans", label: "Subscription Plans", icon: "💳" },
    { id: "payment-tracking", label: "Payment Tracking", icon: "💰" },
    { id: "discount-management", label: "Discount Management", icon: "🎫" },
  ]

  return (
    <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
        <span>{collapsed ? "→" : "←"}</span>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-label">{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default AdminSidebar
