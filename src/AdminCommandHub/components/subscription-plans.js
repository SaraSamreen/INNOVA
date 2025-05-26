import React from "react"
import { useState } from "react"
import "../../Styles/AdminCommandHub.css"

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([
    {
      id: 1,
      name: "Basic",
      price: 9.99,
      features: ["5 Reels/month", "Basic Templates", "Standard Support"],
      active: true,
    },
    {
      id: 2,
      name: "Pro",
      price: 19.99,
      features: ["25 Reels/month", "Premium Templates", "Priority Support", "AI Features"],
      active: true,
    },
    {
      id: 3,
      name: "Enterprise",
      price: 49.99,
      features: ["Unlimited Reels", "Custom Templates", "24/7 Support", "Advanced AI", "Team Collaboration"],
      active: true,
    },
  ])

  const [editingPlan, setEditingPlan] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const handleEditPlan = (plan) => {
    setEditingPlan({ ...plan })
  }

  const handleSavePlan = () => {
    setPlans((prev) => prev.map((plan) => (plan.id === editingPlan.id ? editingPlan : plan)))
    setEditingPlan(null)
  }

  const handleTogglePlan = (id) => {
    setPlans((prev) => prev.map((plan) => (plan.id === id ? { ...plan, active: !plan.active } : plan)))
  }

  return (
    <div className="subscription-plans">
      <div className="plans-header">
        <h2>Subscription Plans & Pricing</h2>
        <button className="add-plan-btn" onClick={() => setShowAddForm(true)}>
          Add New Plan
        </button>
      </div>

      <div className="plans-grid">
        {plans.map((plan) => (
          <div key={plan.id} className={`plan-card ${!plan.active ? "inactive" : ""}`}>
            <div className="plan-header">
              <h3>{plan.name}</h3>
              <div className="plan-price">${plan.price}/month</div>
            </div>
            <div className="plan-features">
              {plan.features.map((feature, index) => (
                <div key={index} className="feature-item">
                  ✓ {feature}
                </div>
              ))}
            </div>
            <div className="plan-actions">
              <button className="edit-btn" onClick={() => handleEditPlan(plan)}>
                Edit
              </button>
              <button
                className={`toggle-btn ${plan.active ? "deactivate" : "activate"}`}
                onClick={() => handleTogglePlan(plan.id)}
              >
                {plan.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingPlan && (
        <div className="edit-modal">
          <div className="modal-content">
            <h3>Edit Plan: {editingPlan.name}</h3>
            <div className="form-group">
              <label>Plan Name:</label>
              <input
                type="text"
                value={editingPlan.name}
                onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Price ($):</label>
              <input
                type="number"
                step="0.01"
                value={editingPlan.price}
                onChange={(e) => setEditingPlan({ ...editingPlan, price: Number.parseFloat(e.target.value) })}
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleSavePlan} className="save-btn">
                Save
              </button>
              <button onClick={() => setEditingPlan(null)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SubscriptionPlans
