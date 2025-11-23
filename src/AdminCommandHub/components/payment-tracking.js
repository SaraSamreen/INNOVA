import React, { useState, useEffect } from "react";

const PaymentTracking = () => {
  const [transactions, setTransactions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch transactions from backend
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/admin/transactions", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}` // If you're using JWT
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const data = await response.json();
        setTransactions(data.transactions || data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

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
              <th>Email</th>
              <th>Amount</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              filteredTransactions.map((t) => (
                <tr key={t._id || t.id} className="border-t text-sm">
                  <td className="p-3">
                    #{(t.transactionId || t._id).toString().slice(-6)}
                  </td>
                  <td>{t.userName || t.user?.name || "N/A"}</td>
                  <td>{t.userEmail || t.user?.email || "N/A"}</td>
                  <td>${t.amount.toFixed(2)}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded text-xs capitalize ${
                        t.status === "completed"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {t.status === "completed" ? "Premium" : "Freemium"}
                    </span>
                  </td>

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

                  <td>{new Date(t.date || t.createdAt).toLocaleDateString()}</td>

                  <td>
                    {t.status === "failed" && (
                      <button className="px-3 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600">
                        Retry
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentTracking;