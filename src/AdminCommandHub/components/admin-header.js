import React from "react"

const AdminHeader = () => {
  return (
    <header className="flex items-center justify-between bg-white shadow p-4 rounded-xl">
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold">Admin Command Hub</h1>
        <span className="text-sm text-gray-500">Manage your platform efficiently</span>
      </div>

      <div className="flex items-center gap-3">
        <img
          src="/placeholder.svg?height=40&width=40"
          alt="Admin"
          className="w-10 h-10 rounded-full object-cover"
        />
        <span className="text-gray-700 font-medium">Admin User</span>
      </div>
    </header>
  )
}

export default AdminHeader
