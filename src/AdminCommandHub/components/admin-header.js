import React from "react"
import { useNavigate } from "react-router-dom"

const AdminHeader = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate("/login")
  }

  return (
    <header className="flex items-center justify-between bg-white shadow p-4 rounded-xl">
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold">Admin Command Hub</h1>
        <span className="text-sm text-gray-500">Manage your platform efficiently</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
          AU
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  )
}

export default AdminHeader