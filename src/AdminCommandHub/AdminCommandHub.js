import React, { useState } from "react";
import AdminHeader from "./components/admin-header";
import AdminSidebar from "./components/admin-sidebar";
import AdvertiserManagement from "./components/advertiser-management";
import ActivityLogs from "./components/activity-logs";
import SubscriptionPlans from "./components/subscription-plans";
import PaymentTracking from "./components/payment-tracking";
import DiscountManagement from "./components/discount-management";

const AdminCommandHub = () => {
  const [activeTab, setActiveTab] = useState("advertisers");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "advertisers":
        return <AdvertiserManagement />;
      case "activity-logs":
        return <ActivityLogs />;
      case "subscription-plans":
        return <SubscriptionPlans />;
      case "payment-tracking":
        return <PaymentTracking />;
      case "discount-management":
        return <DiscountManagement />;
      default:
        return <AdvertiserManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <AdminHeader />

      {/* MAIN LAYOUT BELOW HEADER */}
      <div className="flex w-full">
        {/* SIDEBAR */}
        <div
          className={`transition-all duration-300 ${
            sidebarCollapsed ? "w-16" : "w-64"
          } bg-white shadow-md border-r h-[calc(100vh-70px)] fixed top-[70px] left-0`}
        >
          <AdminSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />
        </div>

        {/* CONTENT AREA */}
        <div
          className={`flex-1 ml-${sidebarCollapsed ? "16" : "64"} p-6 transition-all duration-300`}
        >
          {renderActiveComponent()}
        </div>
      </div>
    </div>
  );
};

export default AdminCommandHub;
