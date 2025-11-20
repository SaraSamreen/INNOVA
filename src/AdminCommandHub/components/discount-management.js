import React, { useState } from "react"

const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState([
    { id: 1, code: "WELCOME20", type: "percentage", value: 20, active: true, expiryDate: "2024-12-31", usageCount: 45 },
    { id: 2, code: "SAVE10", type: "fixed", value: 10, active: true, expiryDate: "2024-06-30", usageCount: 23 },
    { id: 3, code: "NEWUSER", type: "percentage", value: 15, active: false, expiryDate: "2024-03-31", usageCount: 12 },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [newDiscount, setNewDiscount] = useState({
    code: "",
    type: "percentage",
    value: "",
    expiryDate: "",
    active: true,
  })

  const handleAddDiscount = () => {
    const discount = {
      id: Date.now(),
      ...newDiscount,
      value: Number.parseFloat(newDiscount.value),
      usageCount: 0,
    }

    setDiscounts([...discounts, discount])
    setNewDiscount({ code: "", type: "percentage", value: "", expiryDate: "", active: true })
    setShowAddForm(false)
  }

  const handleToggleDiscount = (id) => {
    setDiscounts((prev) =>
      prev.map((discount) =>
        discount.id === id ? { ...discount, active: !discount.active } : discount
      )
    )
  }

  const handleDeleteDiscount = (id) => {
    setDiscounts((prev) => prev.filter((discount) => discount.id !== id))
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Discount Codes & Promotional Offers</h2>

        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          Create New Discount
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-sm">Code</th>
              <th className="text-left px-4 py-3 font-semibold text-sm">Type</th>
              <th className="text-left px-4 py-3 font-semibold text-sm">Value</th>
              <th className="text-left px-4 py-3 font-semibold text-sm">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-sm">Expiry Date</th>
              <th className="text-left px-4 py-3 font-semibold text-sm">Usage Count</th>
              <th className="text-left px-4 py-3 font-semibold text-sm">Actions</th>
            </tr>
          </thead>

          <tbody>
            {discounts.map((discount) => (
              <tr key={discount.id} className="border-b">
                <td className="px-4 py-3 font-medium">{discount.code}</td>
                <td className="px-4 py-3 capitalize">{discount.type}</td>
                <td className="px-4 py-3">
                  {discount.type === "percentage"
                    ? `${discount.value}%`
                    : `$${discount.value}`}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium
                      ${
                        discount.active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                  >
                    {discount.active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="px-4 py-3">{discount.expiryDate}</td>
                <td className="px-4 py-3">{discount.usageCount}</td>

                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleDiscount(discount.id)}
                      className={`px-3 py-1 rounded-md text-xs text-white
                        ${
                          discount.active
                            ? "bg-yellow-600 hover:bg-yellow-700"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                    >
                      {discount.active ? "Deactivate" : "Activate"}
                    </button>

                    <button
                      onClick={() => handleDeleteDiscount(discount.id)}
                      className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Create New Discount Code</h3>

            {/* Code */}
            <div className="mb-4">
              <label className="block text-sm mb-1">Discount Code:</label>
              <input
                type="text"
                value={newDiscount.code}
                onChange={(e) =>
                  setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })
                }
                placeholder="Enter discount code"
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>

            {/* Type */}
            <div className="mb-4">
              <label className="block text-sm mb-1">Type:</label>
              <select
                value={newDiscount.type}
                onChange={(e) => setNewDiscount({ ...newDiscount, type: e.target.value })}
                className="w-full border px-3 py-2 rounded-md"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            {/* Value */}
            <div className="mb-4">
              <label className="block text-sm mb-1">Value:</label>
              <input
                type="number"
                value={newDiscount.value}
                onChange={(e) =>
                  setNewDiscount({ ...newDiscount, value: e.target.value })
                }
                placeholder={
                  newDiscount.type === "percentage" ? "Enter percentage" : "Enter amount"
                }
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>

            {/* Expiry Date */}
            <div className="mb-4">
              <label className="block text-sm mb-1">Expiry Date:</label>
              <input
                type="date"
                value={newDiscount.expiryDate}
                onChange={(e) =>
                  setNewDiscount({ ...newDiscount, expiryDate: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-300 text-sm rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={handleAddDiscount}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                Create Discount
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default DiscountManagement
