import React, { useState } from "react";
import { X } from "lucide-react";

const InviteTeamModel = ({ onClose, onInvite }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple email validation
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    
    onInvite(email, role);
    setEmail("");
    setError("");
  };

  return (
    <div className="modal-overlay">
      <div className="invite-modal">
        <div className="modal-header">
          <h3>Invite Team Member</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              required
            />
            {error && <p className="error-message">{error}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="member">Team Member</option>
              <option value="admin">Team Admin</option>
              <option value="viewer">Viewer (Read-only)</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="invite-btn">
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteTeamModel;