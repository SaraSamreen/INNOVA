import React from "react"
import { useState } from "react"
import "../../Styles/AdminCommandHub.css"

const AdvertiserManagement = () => {
  const [advertisers, setAdvertisers] = useState([
    { id: 1, name: "TechCorp Inc.", email: "contact@techcorp.com", status: "active", joinDate: "2024-01-15" },
    { id: 2, name: "Marketing Pro", email: "info@marketingpro.com", status: "pending", joinDate: "2024-01-20" },
    { id: 3, name: "Digital Solutions", email: "hello@digitalsol.com", status: "suspended", joinDate: "2024-01-10" },
  ])

  const [filter, setFilter] = useState("all")

  const handleStatusChange = (id, newStatus) => {
    setAdvertisers((prev) =>
      prev.map((advertiser) => (advertiser.id === id ? { ...advertiser, status: newStatus } : advertiser)),
    )
  }

  const filteredAdvertisers = advertisers.filter((advertiser) => filter === "all" || advertiser.status === filter)

  return (
    <div className="advertiser-management">
      <div className="management-header">
        <h2>Advertiser Management</h2>
        <div className="filter-controls">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Advertisers</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="advertisers-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdvertisers.map((advertiser) => (
              <tr key={advertiser.id}>
                <td>{advertiser.name}</td>
                <td>{advertiser.email}</td>
                <td>
                  <span className={`status-badge ${advertiser.status}`}>{advertiser.status}</span>
                </td>
                <td>{advertiser.joinDate}</td>
                <td>
                  <div className="action-buttons">
                    {advertiser.status === "pending" && (
                      <button className="approve-btn" onClick={() => handleStatusChange(advertiser.id, "active")}>
                        Approve
                      </button>
                    )}
                    {advertiser.status === "active" && (
                      <button className="suspend-btn" onClick={() => handleStatusChange(advertiser.id, "suspended")}>
                        Suspend
                      </button>
                    )}
                    {advertiser.status === "suspended" && (
                      <button className="reactivate-btn" onClick={() => handleStatusChange(advertiser.id, "active")}>
                        Reactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdvertiserManagement
