import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Download, Trash2, ArrowLeft } from "lucide-react";

export default function Drafts() {
  const location = useLocation();
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    // Load existing drafts from localStorage
    const savedDrafts = JSON.parse(localStorage.getItem("productDrafts") || "[]");
    
    // If there's a new draft from navigation state, add it
    if (location.state?.newDraft) {
      const newDrafts = [location.state.newDraft, ...savedDrafts];
      setDrafts(newDrafts);
      localStorage.setItem("productDrafts", JSON.stringify(newDrafts));
      
      // Clear the navigation state to prevent re-adding on refresh
      window.history.replaceState({}, document.title);
    } else {
      setDrafts(savedDrafts);
    }
  }, [location.state]);

  const deleteDraft = (timestamp) => {
    const updatedDrafts = drafts.filter((draft) => draft.timestamp !== timestamp);
    setDrafts(updatedDrafts);
    localStorage.setItem("productDrafts", JSON.stringify(updatedDrafts));
  };

  const downloadDraft = (draft) => {
    const link = document.createElement("a");
    link.href = draft.image;
    link.download = `draft-${draft.timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">My Drafts</h1>
            <p className="text-gray-600 mt-1">
              {drafts.length} {drafts.length === 1 ? "draft" : "drafts"} saved
            </p>
          </div>
        </div>

        {/* Drafts Grid */}
        {drafts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No drafts yet
            </h2>
            <p className="text-gray-500 mb-6">
              Create product showcases and save them here for later
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.map((draft) => (
              <div
                key={draft.timestamp}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Image */}
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={draft.image}
                    alt="Draft"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info & Actions */}
                <div className="p-4">
                  <div className="text-sm text-gray-500 mb-3">
                    {formatDate(draft.timestamp)}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadDraft(draft)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => deleteDraft(draft.timestamp)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}