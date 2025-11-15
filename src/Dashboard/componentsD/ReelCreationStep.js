"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ReelCreationStep() {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const navigate = useNavigate();

  const handleSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleContinue = () => {
    switch (selectedMethod) {
      case "ai-assistant":
        navigate("/create/step2");
        break;
      case "template":
        navigate("/template-browser");
        break;
      case "quick-reel":
        navigate("/quick-reel");
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 relative overflow-hidden">
      {/* Floating shapes */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-blue-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>

      <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-800 text-center">
        Choose Reel Creation Method
      </h1>
      <p className="text-gray-600 text-lg mb-10 text-center max-w-xl">
        Select one of the methods below to start creating your AI-powered ad reel quickly and efficiently.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
        {/* AI Assistant */}
        <button
          onClick={() => handleSelect("ai-assistant")}
          className={`p-6 rounded-2xl shadow-md text-lg font-medium transition-all duration-300 transform ${
            selectedMethod === "ai-assistant"
              ? "bg-blue-600 text-white scale-105 shadow-lg"
              : "bg-white hover:bg-blue-50 hover:scale-105 text-gray-800"
          }`}
        >
          AI Assistant
        </button>

        {/* Template Browser */}
        <button
          onClick={() => handleSelect("template")}
          className={`p-6 rounded-2xl shadow-md text-lg font-medium transition-all duration-300 transform ${
            selectedMethod === "template"
              ? "bg-blue-600 text-white scale-105 shadow-lg"
              : "bg-white hover:bg-blue-50 hover:scale-105 text-gray-800"
          }`}
        >
          Template Browser
        </button>

        {/* Quick Reel */}
        <button
          onClick={() => handleSelect("quick-reel")}
          className={`p-6 rounded-2xl shadow-md text-lg font-medium transition-all duration-300 transform ${
            selectedMethod === "quick-reel"
              ? "bg-blue-600 text-white scale-105 shadow-lg"
              : "bg-white hover:bg-blue-50 hover:scale-105 text-gray-800"
          }`}
        >
          Quick Reel
        </button>
      </div>

      <button
        onClick={handleContinue}
        disabled={!selectedMethod}
        className={`mt-12 px-10 py-4 rounded-full text-white font-semibold transition-all duration-300 ${
          selectedMethod
            ? "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl"
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        Continue
      </button>
    </div>
  );
}
