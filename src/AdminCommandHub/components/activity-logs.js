import React, { useState } from "react";

const ActivityLogs = () => {
  const [logs] = useState([
    { id: 1, user: "john@example.com", action: "Created new reel", timestamp: "2024-01-25 14:30:00", type: "user" },
    { id: 2, user: "TechCorp Inc.", action: "Updated subscription plan", timestamp: "2024-01-25 13:45:00", type: "advertiser" },
    { id: 3, user: "sarah@example.com", action: "Downloaded reel", timestamp: "2024-01-25 12:15:00", type: "user" },
    { id: 4, user: "Marketing Pro", action: "Payment processed", timestamp: "2024-01-25 11:30:00", type: "advertiser" },
    { id: 5, user: "admin@innova.com", action: "Suspended advertiser account", timestamp: "2024-01-25 10:00:00", type: "admin" },
  ]);

  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = logs.filter((log) => {
    const matchesType = filterType === "all" || log.type === filterType;
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const typeColors = {
    user: "bg-blue-100 text-blue-800",
    advertiser: "bg-green-100 text-green-800",
    admin: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-xl font-semibold mb-2 md:mb-0">Activity Logs</h2>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Activities</option>
            <option value="user">User Activities</option>
            <option value="advertiser">Advertiser Activities</option>
            <option value="admin">Admin Activities</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">User/Entity</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Action</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Type</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-800">{log.user}</td>
                <td className="px-4 py-2 text-sm text-gray-800">{log.action}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${typeColors[log.type]}`}>
                    {log.type}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityLogs;
