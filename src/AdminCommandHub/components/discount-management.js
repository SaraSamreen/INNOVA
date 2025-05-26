import React from "react"
import { useState } from "react"
import "../../Styles/AdminCommandHub.css"

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
      prev.map((discount) => (discount.id === id ? { ...discount, active: !discount.active } : discount)),
    )
  }

  const handleDeleteDiscount = (id) => {
    setDiscounts((prev) => prev.filter((discount) => discount.id !== id))
  }

  return (
    <div className="discount-management">
      <div className="discount-header">
        <h2>Discount Codes & Promotional Offers</h2>
        <button className="add-discount-btn" onClick={() => setShowAddForm(true)}>
          Create New Discount
        </button>
      </div>

      <div className="discounts-table">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Status</th>
              <th>Expiry Date</th>
              <th>Usage Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((discount) => (
              <tr key={discount.id}>
                <td className="discount-code">{discount.code}</td>
                <td>{discount.type}</td>
                <td>{discount.type === "percentage" ? `${discount.value}%` : `$${discount.value}`}</td>
                <td>
                  <span className={`status-badge ${discount.active ? "active" : "inactive"}`}>
                    {discount.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>{discount.expiryDate}</td>
                <td>{discount.usageCount}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className={`toggle-btn ${discount.active ? "deactivate" : "activate"}`}
                      onClick={() => handleToggleDiscount(discount.id)}
                    >
                      {discount.active ? "Deactivate" : "Activate"}
                    </button>
                    <button className="delete-btn" onClick={() => handleDeleteDiscount(discount.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <div className="add-discount-modal">
          <div className="modal-content">
            <h3>Create New Discount Code</h3>
            <div className="form-group">
              <label>Discount Code:</label>
              <input
                type="text"
                value={newDiscount.code}
                onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                placeholder="Enter discount code"
              />
            </div>
            <div className="form-group">
              <label>Type:</label>
              <select
                value={newDiscount.type}
                onChange={(e) => setNewDiscount({ ...newDiscount, type: e.target.value })}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div className="form-group">
              <label>Value:</label>
              <input
                type="number"
                value={newDiscount.value}
                onChange={(e) => setNewDiscount({ ...newDiscount, value: e.target.value })}
                placeholder={newDiscount.type === "percentage" ? "Enter percentage" : "Enter amount"}
              />
            </div>
            <div className="form-group">
              <label>Expiry Date:</label>
              <input
                type="date"
                value={newDiscount.expiryDate}
                onChange={(e) => setNewDiscount({ ...newDiscount, expiryDate: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleAddDiscount} className="save-btn">
                Create Discount
              </button>
              <button onClick={() => setShowAddForm(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DiscountManagement
