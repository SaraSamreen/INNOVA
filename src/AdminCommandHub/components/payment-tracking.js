import React from "react"
import { useState } from "react"
import "../../Styles/AdminCommandHub.css"

const PaymentTracking = () => {
  const [transactions] = useState([
    { id: 1, user: "TechCorp Inc.", amount: 19.99, status: "completed", date: "2024-01-25", plan: "Pro" },
    { id: 2, user: "Marketing Pro", amount: 9.99, status: "pending", date: "2024-01-24", plan: "Basic" },
    { id: 3, user: "Digital Solutions", amount: 49.99, status: "failed", date: "2024-01-23", plan: "Enterprise" },
    { id: 4, user: "StartupXYZ", amount: 19.99, status: "completed", date: "2024-01-22", plan: "Pro" },
    { id: 5, user: "CreativeAgency", amount: 49.99, status: "completed", date: "2024-01-21", plan: "Enterprise" },
  ])

  const [statusFilter, setStatusFilter] = useState("all")

  const filteredTransactions = transactions.filter(
    (transaction) => statusFilter === "all" || transaction.status === statusFilter,
  )

  const totalRevenue = transactions.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.amount, 0)

  const pendingAmount = transactions.filter((t) => t.status === "pending").reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="payment-tracking">
      <div className="tracking-header">
        <h2>Payment Status & Transactions</h2>
        <div className="revenue-stats">
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <span className="amount">${totalRevenue.toFixed(2)}</span>
          </div>
          <div className="stat-card">
            <h3>Pending Payments</h3>
            <span className="amount pending">${pendingAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="tracking-controls">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Transactions</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>User/Company</th>
              <th>Amount</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>#{transaction.id.toString().padStart(6, "0")}</td>
                <td>{transaction.user}</td>
                <td>${transaction.amount}</td>
                <td>{transaction.plan}</td>
                <td>
                  <span className={`status-badge ${transaction.status}`}>{transaction.status}</span>
                </td>
                <td>{transaction.date}</td>
                <td>
                  <button className="view-details-btn">View Details</button>
                  {transaction.status === "failed" && <button className="retry-btn">Retry</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PaymentTracking
