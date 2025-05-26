import React from "react"
import { useState } from "react"
import "../../Styles/AdminCommandHub.css"

const ActivityLogs = () => {
  const [logs] = useState([
    { id: 1, user: "john@example.com", action: "Created new reel", timestamp: "2024-01-25 14:30:00", type: "user" },
    {
      id: 2,
      user: "TechCorp Inc.",
      action: "Updated subscription plan",
      timestamp: "2024-01-25 13:45:00",
      type: "advertiser",
    },
    { id: 3, user: "sarah@example.com", action: "Downloaded reel", timestamp: "2024-01-25 12:15:00", type: "user" },
    { id: 4, user: "Marketing Pro", action: "Payment processed", timestamp: "2024-01-25 11:30:00", type: "advertiser" },
    {
      id: 5,
      user: "admin@innova.com",
      action: "Suspended advertiser account",
      timestamp: "2024-01-25 10:00:00",
      type: "admin",
    },
  ])

  const [filterType, setFilterType] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLogs = logs.filter((log) => {
    const matchesType = filterType === "all" || log.type === filterType
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  return (
    <div className="activity-logs">
      <div className="logs-header">
        <h2>Activity Logs</h2>
        <div className="logs-controls">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Activities</option>
            <option value="user">User Activities</option>
            <option value="advertiser">Advertiser Activities</option>
            <option value="admin">Admin Activities</option>
          </select>
        </div>
      </div>

      <div className="logs-table">
        <table>
          <thead>
            <tr>
              <th>User/Entity</th>
              <th>Action</th>
              <th>Type</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td>{log.user}</td>
                <td>{log.action}</td>
                <td>
                  <span className={`type-badge ${log.type}`}>{log.type}</span>
                </td>
                <td>{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ActivityLogs
