import React, { useState } from "react";

const PaymentTracking = () => {
  const [transactions] = useState([
    { id: 1, user: "TechCorp Inc.", amount: 19.99, status: "completed", date: "2024-01-25", plan: "Pro" },
    { id: 2, user: "Marketing Pro", amount: 9.99, status: "pending", date: "2024-01-24", plan: "Basic" },
    { id: 3, user: "Digital Solutions", amount: 49.99, status: "failed", date: "2024-01-23", plan: "Enterprise" },
    { id: 4, user: "StartupXYZ", amount: 19.99, status: "completed", date: "2024-01-22", plan: "Pro" },
    { id: 5, user: "CreativeAgency", amount: 49.99, status: "completed", date: "2024-01-21", plan: "Enterprise" },
  ]);

  const [statusFilter, setStatusFilter] = useState("all");

  const filteredTransactions = transactions.filter(
    (transaction) =>
      statusFilter === "all" || transaction.status === statusFilter
  );

  const totalRevenue = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = transactions
    .filter((t) => t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Payment Status & Transactions</h2>

        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Transactions</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-xl shadow">
          <h3 className="text-sm text-gray-500">Total Revenue</h3>
          <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <h3 className="text-sm text-gray-500">Pending Payments</h3>
          <div className="text-2xl font-bold text-yellow-600">
            ${pendingAmount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-3">Transaction ID</th>
              <th>User</th>
              <th>Amount</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.map((t) => (
              <tr key={t.id} className="border-t text-sm">
                <td className="p-3">#{t.id.toString().padStart(6, "0")}</td>
                <td>{t.user}</td>
                <td>${t.amount}</td>
                <td>{t.plan}</td>

                <td>
                  <span
                    className={`px-2 py-1 rounded text-xs capitalize ${
                      t.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : t.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>

                <td>{t.date}</td>

                <td className="space-x-2">
                  <button className="px-3 py-1 rounded bg-blue-500 text-white text-xs">
                    View Details
                  </button>

                  {t.status === "failed" && (
                    <button className="px-3 py-1 rounded bg-red-500 text-white text-xs">
                      Retry
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default PaymentTracking;
