import React from "react"
import {
  Users,
  BarChart3,
  CreditCard,
  Wallet,
  TicketPercent,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

const AdminSidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const HEADER_HEIGHT = "84px" // adjust if your header is different

  const menuItems = [
    { id: "advertisers", label: "Advertiser Management", icon: Users },
    { id: "activity-logs", label: "Activity Logs", icon: BarChart3 },
    { id: "subscription-plans", label: "Subscription Plans", icon: CreditCard },
    { id: "payment-tracking", label: "Payment Tracking", icon: Wallet },
    { id: "discount-management", label: "Discount Management", icon: TicketPercent },
  ]

  return (
    <aside
      className={`fixed left-0 bg-white shadow-lg transition-all duration-300
      ${collapsed ? "w-16" : "w-64"} flex flex-col`}
      style={{
        top: HEADER_HEIGHT,                    // place sidebar below header
        height: `calc(110vh - ${HEADER_HEIGHT})` // full height minus header
      }}
    >
      {/* Toggle */}
      <div
        className="flex items-center justify-center py-3 cursor-pointer hover:bg-gray-100"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-1 px-2 mt-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                transition-colors
                ${activeTab === item.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default AdminSidebar
