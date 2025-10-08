import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import "../Styles/ProfileSettings.css";
import axios from "axios";

export default function ProfileSettings() {
  const [activeTab, setActiveTab] = useState("profile");
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

  const token = localStorage.getItem("token"); // however you store JWT

  // ----------------- Update profile -----------------
  const handleProfileUpdate = async () => {
    try {
      const response = await axios.put(
        "http://localhost:5000/api/auth/update-profile",
        formData,
        { headers: { "x-auth-token": token } }
      );
      alert("Profile updated successfully!");
      console.log(response.data);
    } catch (error) {
      console.error(error);
      alert("Failed to update profile");
    }
  };

  // ----------------- Delete account -----------------
  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure? This cannot be undone.")) {
      try {
        await axios.delete("http://localhost:5000/api/auth/delete-account", {
          headers: { "x-auth-token": token },
        });
        alert("Account deleted successfully!");
        localStorage.removeItem("token");
        window.location.href = "/"; // redirect to home/login
      } catch (error) {
        console.error(error);
        alert("Failed to delete account");
      }
    }
  };

  // ----------------- Confirm delete (not used anymore but you can keep) -----------------
  const confirmDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      alert("Account deleted");
    }
  };

  // ----------------- Render UI -----------------
  return (
    <div className="profile-settings-container">
      {/* Sidebar */}
      <nav className="settings-sidebar">
        {["workspace", "members", "subscription", "usage", "profile", "account"].map(
          (tab) => (
            <button
              key={tab}
              className={`sidebar-button ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          )
        )}
      </nav>

      {/* Content */}
      <div className="settings-content">
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
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      placeholder="saras-fba72477"
                      className="text-input"
                    />
                    <button className="save-button" onClick={handleProfileUpdate}>
                      Save
                    </button>
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
          </div>
        )}

        {activeTab === "account" && (
          <div className="settings-section">
            <h2 className="section-title">Manage Account</h2>
            <button className="delete-account-button" onClick={handleDeleteAccount}>
              <Trash2 size={16} /> Delete Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
