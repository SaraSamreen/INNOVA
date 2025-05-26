import React from "react"
import { useState } from "react"
import AdminHeader from "./components/admin-header"
import AdminSidebar from "./components/admin-sidebar"
import AdvertiserManagement from "./components/advertiser-management"
import ActivityLogs from "./components/activity-logs"
import SubscriptionPlans from "./components/subscription-plans"
import PaymentTracking from "./components/payment-tracking"
import DiscountManagement from "./components/discount-management"
import "../Styles/AdminCommandHub.css"

const AdminCommandHub = () => {
  const [activeTab, setActiveTab] = useState("advertisers")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "advertisers":
        return <AdvertiserManagement />
      case "activity-logs":
        return <ActivityLogs />
      case "subscription-plans":
        return <SubscriptionPlans />
      case "payment-tracking":
        return <PaymentTracking />
      case "discount-management":
        return <DiscountManagement />
      default:
        return <AdvertiserManagement />
    }
  }

  return (
    <div className="admin-command-hub">
      <AdminHeader />
      <div className="admin-main-content">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        <div className={`admin-content-area ${sidebarCollapsed ? "expanded" : ""}`}>{renderActiveComponent()}</div>
      </div>
    </div>
  )
}

export default AdminCommandHub
