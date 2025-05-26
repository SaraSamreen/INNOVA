import React from "react";
import { useState } from "react";
import { User, Mail, Phone, Lock, Trash2, Save } from "lucide-react";
import'../Styles/ProfileSettings.css';

export default function ProfileSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    twitter: "",
    facebook: "",
    instagram: "",
    password: "",
    twoFactorAuth: false,
    dataSharing: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // await save logic here
      alert("Settings saved successfully!");
    } catch (err) {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      // perform delete
      alert("Account deleted");
    }
  };

  return (
    <div className="profile-settings-container">
      {/* Left column with vertical tabs */}
      <nav className="settings-sidebar">
        <button
          className={`sidebar-button ${activeTab === "workspace" ? "active" : ""}`}
          onClick={() => setActiveTab("workspace")}
        >
          Workspace settings
        </button>
        <button
          className={`sidebar-button ${activeTab === "members" ? "active" : ""}`}
          onClick={() => setActiveTab("members")}
        >
          Members
        </button>
        <button
          className={`sidebar-button ${activeTab === "subscription" ? "active" : ""}`}
          onClick={() => setActiveTab("subscription")}
        >
          Subscription
        </button>
        <button
          className={`sidebar-button ${activeTab === "usage" ? "active" : ""}`}
          onClick={() => setActiveTab("usage")}
        >
          Usage
        </button>
        <button
          className={`sidebar-button ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button
          className={`sidebar-button ${activeTab === "account" ? "active" : ""}`}
          onClick={() => setActiveTab("account")}
        >
          Manage account
        </button>
      </nav>

      {/* Right column with tab content */}
      <div className="settings-content">
        {activeTab === "workspace" && (
          <div className="settings-section">
            <h2 className="section-title">Workspace settings</h2>
            
            <div className="form-group">
              <div className="form-row">
                <div className="form-field">
                  <label>Workspace name</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      name="workspaceName"
                      placeholder="Sara's Workspace"
                      className="text-input"
                    />
                    <button className="save-button">Save</button>
                  </div>
                </div>
                <div className="form-field">
                  <label>Workspace handle</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      name="workspaceHandle"
                      placeholder="Sara-867625"
                      className="text-input"
                    />
                    <button className="save-button">Save</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <div className="toggle-row">
                <div>
                  <h3>Beta features <span className="beta-icon">🧪</span></h3>
                  <p className="description">Get early access to experimental new features that may change during development</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" name="betaFeatures" />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <div className="toggle-row">
                <div>
                  <h3>Show multiplayer cursors</h3>
                  <p className="description">When enabled, you'll see the cursors of other collaborators in the same session.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" name="multiplayer" />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <div className="visibility-selector">
                <h3>Default export visibility</h3>
                <p className="description">Sets the default visibility for exports, you can also modify this setting for each export</p>
                
                <div className="visibility-option">
                  <div className="visibility-content">
                    <span className="visibility-icon">👁️</span>
                    <div>
                      <div className="visibility-title">Public</div>
                      <div className="visibility-description">Available to any anonymous user</div>
                    </div>
                  </div>
                  <span className="dropdown-arrow">▼</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="settings-section">
            <h2 className="section-title">Profile</h2>
            
            <div className="form-group">
              <div className="form-row">
                <div className="form-field">
                  <label>Username</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      name="username"
                      placeholder="saras-fba72477"
                      className="text-input"
                    />
                    <button className="save-button">Save</button>
                  </div>
                </div>
                <div className="form-field">
                  <label>Full name</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Sara Samreen"
                      className="text-input"
                    />
                    <button className="save-button">Save</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label>Connect account</label>
              <div className="connect-account">
                <div className="account-info">
                  <div className="discord-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v21.528l-2.58-2.28-1.452-1.344-1.536-1.428.636 2.22h-13.608c-1.356 0-2.46-1.104-2.46-2.472v-16.224c0-1.368 1.104-2.472 2.46-2.472h16.08z" />
                    </svg>
                  </div>
                  <span>Discord</span>
                </div>
                <button className="connect-button">Connect</button>
              </div>
            </div>
            
            <div className="form-group">
              <label>Influencer</label>
              <button className="influencer-button">
                Become an influencer
              </button>
            </div>
            
            <div className="form-group">
              <label>Date of birth</label>
              <div className="date-field">
                <span>2004-01-01</span>
                <span className="edit-icon">✏️</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "account" && (
          <div className="settings-section">
            <h2 className="section-title">Workspaces</h2>
            
            <div className="workspaces-table">
              <div className="table-header">
                <div className="table-cell">Name</div>
                <div className="table-cell">Owner</div>
                <div className="table-cell">Status</div>
                <div className="table-cell"></div>
              </div>
              
              <div className="table-row">
                <div className="table-cell">Sara's Workspace</div>
                <div className="table-cell">You</div>
                <div className="table-cell">Active</div>
                <div className="table-cell">
                  <button className="delete-button">
                    <span className="trash-icon">🗑️</span> Delete
                  </button>
                </div>
              </div>
            </div>
            
            <button className="delete-account-button">
              <span className="trash-icon">🗑️</span> Delete Account
            </button>
          </div>
        )}

        {activeTab === "members" && (
          <div className="settings-section">
            <h2 className="section-title">Members</h2>
            <p>Manage team members and permissions.</p>
          </div>
        )}

        {activeTab === "subscription" && (
          <div className="settings-section">
            <h2 className="section-title">Subscription</h2>
            <p>Manage your subscription and billing details.</p>
          </div>
        )}

        {activeTab === "usage" && (
          <div className="settings-section">
            <h2 className="section-title">Usage</h2>
            <p>View your account usage statistics.</p>
          </div>
        )}

        {activeTab === "delete" && (
          <div className="settings-section danger">
            <h2 className="section-title">Delete Account</h2>
            <p>This action is irreversible. Please proceed with caution.</p>
            <button
              onClick={confirmDeleteAccount}
              className="delete-account-button"
            >
              <Trash2 size={16} className="icon" />
              Delete My Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}