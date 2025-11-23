import React, { useState, useEffect } from "react";
import { Search, UserX, Trash2, Shield, User } from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });

  // Fetch users from backend
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/admin/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and plan
  useEffect(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by plan
    if (filterPlan !== "all") {
      filtered = filtered.filter((user) => user.plan === filterPlan);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, filterPlan, users]);

  // Suspend user account
  const handleSuspendUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/suspend/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to suspend user");
      }

      // Refresh users list
      fetchUsers();
      alert("User suspended successfully");
    } catch (err) {
      console.error("Error suspending user:", err);
      alert("Failed to suspend user: " + err.message);
    }
  };

  // Activate suspended user
  const handleActivateUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/activate/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to activate user");
      }

      // Refresh users list
      fetchUsers();
      alert("User activated successfully");
    } catch (err) {
      console.error("Error activating user:", err);
      alert("Failed to activate user: " + err.message);
    }
  };

  // Delete user permanently
  const handleDeleteUser = async () => {
    if (!deleteModal.user) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/delete/${deleteModal.user._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      // Refresh users list
      fetchUsers();
      setDeleteModal({ show: false, user: null });
      alert("User deleted successfully");
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user: " + err.message);
    }
  };

  const openDeleteModal = (user) => {
    setDeleteModal({ show: true, user });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading users...</div>
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
        <h2 className="text-xl font-semibold">User Management</h2>
        <div className="text-sm text-gray-500">
          Total Users: <span className="font-semibold">{users.length}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl shadow">
          <h3 className="text-sm text-gray-500">Active Users</h3>
          <div className="text-2xl font-bold text-green-600">
            {users.filter((u) => !u.suspended).length}
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <h3 className="text-sm text-gray-500">Suspended Users</h3>
          <div className="text-2xl font-bold text-red-600">
            {users.filter((u) => u.suspended).length}
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <h3 className="text-sm text-gray-500">Premium Users</h3>
          <div className="text-2xl font-bold text-purple-600">
            {users.filter((u) => u.plan === "premium").length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Plan Filter */}
        <select
          className="border rounded-lg px-4 py-2"
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
        >
          <option value="all">All Plans</option>
          <option value="freemium">Freemium</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-3">User</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id} className="border-t text-sm hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <span className="font-medium">{user.name || "N/A"}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded text-xs capitalize ${
                        user.plan === "premium"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.plan || "freemium"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        user.suspended
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.suspended ? "Deleted" : "Active"}
                    </span>
                  </td>
                  <td>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="space-x-2">
                    {user.suspended ? (
                      <button
                        onClick={() => handleActivateUser(user._id)}
                        className="px-3 py-1 rounded bg-green-500 text-white text-xs hover:bg-green-600 inline-flex items-center gap-1"
                      >
                        <Shield className="w-3 h-3" />
                        Activate
                      </button>
                    ) : (
                       <button
                      onClick={() => openDeleteModal(user)}
                      className="px-3 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600 inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-2">
              Are you sure you want to permanently delete{" "}
              <strong>{deleteModal.user?.name || deleteModal.user?.email}</strong>?
            </p>
            
            {/* Show premium user warning */}
            {deleteModal.user?.plan === "premium" && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800 font-semibold">⚠️ Premium User</p>
                <p className="text-xs text-yellow-700 mt-1">
                  This user has an active premium subscription. Deleting this account will remove all premium benefits and transaction history.
                </p>
              </div>
            )}
            
            <p className="text-gray-600 text-sm mb-6">
              This action cannot be undone and will remove all user data from the database including:
            </p>
            <ul className="text-sm text-gray-600 mb-6 list-disc list-inside space-y-1">
              <li>User profile information</li>
              <li>All purchase history and transactions</li>
              <li>Account settings and preferences</li>
            </ul>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ show: false, user: null })}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;