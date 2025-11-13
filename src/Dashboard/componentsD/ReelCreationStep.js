"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function ReelCreationStep() {
  const [selectedMethod, setSelectedMethod] = useState(null)
  const navigate = useNavigate()

  const handleSelect = (method) => {
    setSelectedMethod(method)
  }

  const handleContinue = () => {
    switch (selectedMethod) {
      case "ai-assistant":
        navigate("/create/step2")
        break
      case "template":
        navigate("/template-browser")
        break
      case "quick-reel":
        navigate("/quick-reel")
        break
      default:
        break
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Choose Reel Creation Method
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
        {/* AI Assistant */}
        <button
          onClick={() => handleSelect("ai-assistant")}
          className={`p-6 rounded-2xl shadow-md text-lg font-medium transition-all ${
            selectedMethod === "ai-assistant"
              ? "bg-blue-600 text-white scale-105"
              : "bg-white hover:bg-blue-50 text-gray-800"
          }`}
        >
          AI Assistant
        </button>

        {/* Template Browser */}
        <button
          onClick={() => handleSelect("template")}
          className={`p-6 rounded-2xl shadow-md text-lg font-medium transition-all ${
            selectedMethod === "template"
              ? "bg-blue-600 text-white scale-105"
              : "bg-white hover:bg-blue-50 text-gray-800"
          }`}
        >
          Template Browser
        </button>

        {/* Quick Reel */}
        <button
          onClick={() => handleSelect("quick-reel")}
          className={`p-6 rounded-2xl shadow-md text-lg font-medium transition-all ${
            selectedMethod === "quick-reel"
              ? "bg-blue-600 text-white scale-105"
              : "bg-white hover:bg-blue-50 text-gray-800"
          }`}
        >
          Quick Reel
        </button>
      </div>

      <button
        onClick={handleContinue}
        disabled={!selectedMethod}
        className={`mt-10 px-8 py-3 rounded-full text-white font-medium transition-all ${
          selectedMethod
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        Continue
      </button>
    </div>
  )
}
