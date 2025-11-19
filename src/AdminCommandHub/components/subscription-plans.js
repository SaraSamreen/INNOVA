import React, { useState } from "react";

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
      features: [
        "Unlimited Reels",
        "Custom Templates",
        "24/7 Support",
        "Advanced AI",
        "Team Collaboration",
      ],
      active: true,
    },
  ]);

  const [editingPlan, setEditingPlan] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleEditPlan = (plan) => {
    setEditingPlan({ ...plan });
  };

  const handleSavePlan = () => {
    setPlans((prev) =>
      prev.map((p) => (p.id === editingPlan.id ? editingPlan : p))
    );
    setEditingPlan(null);
  };

  const handleTogglePlan = (id) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, active: !p.active } : p
      )
    );
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Subscription Plans & Pricing</h2>

        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
        >
          Add New Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`p-5 rounded-xl shadow bg-white border ${
              !plan.active ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <span className="text-xl font-bold">${plan.price}/mo</span>
            </div>

            <div className="space-y-2 mt-3 text-sm">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  {feature}
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                className="px-3 py-1 text-sm bg-gray-100 rounded"
                onClick={() => handleEditPlan(plan)}
              >
                Edit
              </button>

              <button
                onClick={() => handleTogglePlan(plan.id)}
                className={`px-3 py-1 text-sm rounded text-white ${
                  plan.active ? "bg-red-500" : "bg-green-600"
                }`}
              >
                {plan.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Edit Plan: {editingPlan.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Plan Name:</label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, name: e.target.value })
                  }
                  className="w-full mt-1 border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Price ($):</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingPlan.price}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      price: parseFloat(e.target.value),
                    })
                  }
                  className="w-full mt-1 border rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg"
                onClick={() => setEditingPlan(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                onClick={handleSavePlan}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Plan Modal (if you want later) */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-md shadow-lg text-center">
            <p className="text-sm">Add Plan form coming soon</p>
            <button
              onClick={() => setShowAddForm(false)}
              className="mt-4 px-4 py-2 bg-gray-200 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
