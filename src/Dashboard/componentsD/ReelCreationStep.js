"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function ReelCreationStep() {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const navigate = useNavigate();

  const handleSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleContinue = () => {
    switch (selectedMethod) {
      case "ai-assistant":
        navigate("/step1");
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
    <div className="flex min-h-screen bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col items-center justify-center flex-1 p-6">
        {/* Floating shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-20 right-20 w-48 h-48 bg-blue-300/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>

        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-800 text-center">
          Choose Reel Creation Method
        </h1>
        <p className="text-gray-600 text-lg mb-10 text-center max-w-xl">
          Select one of the methods below to start creating your AI-powered ad reel quickly and efficiently.
        </p>

        {/* Buttons grid */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
  {/* AI Assistant - tallest */}
  <button
    onClick={() => handleSelect("ai-assistant")}
    className={`p-6 rounded-2xl shadow-md text-3xl font-bold transition-all duration-300 transform h-60 flex items-center justify-center bg-gradient-to-b from-green-400 via-teal-400 to-blue-400 ${
      selectedMethod === "ai-assistant"
        ? "scale-105 shadow-lg text-white"
        : "hover:scale-110 text-white"
    }`}
  >
    AI Assistant
  </button>

  {/* Template Browser - medium */}
  <button
    onClick={() => handleSelect("template")}
    className={`p-6 rounded-2xl shadow-md text-3xl font-bold transition-all duration-300 transform h-60 flex items-center justify-center bg-gradient-to-b from-blue-400 via-teal-400 to-green-400 ${
      selectedMethod === "template"
        ? "scale-105 shadow-lg text-white"
        : "hover:scale-110 text-white"
    }`}
  >
    Template Browser
  </button>

  {/* Quick Reel - shortest */}
  <button
    onClick={() => handleSelect("quick-reel")}
    className={`p-6 rounded-2xl shadow-md text-3xl font-bold transition-all duration-300 transform h-60 flex items-center justify-center bg-gradient-to-b from-green-400 via-teal-400 to-blue-400 ${
      selectedMethod === "quick-reel"
        ? "scale-105 shadow-lg text-white"
        : "hover:scale-110 text-white"
    }`}
  >
    Quick Reel
  </button>
</div>

        {/* Continue button */}
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
    </div>
  );
}
