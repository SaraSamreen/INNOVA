// src/components/Chatbot.js
import React, { useState } from "react";
import "../../Styles/Chatbot.css";  

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! I'm your AI assistant. Ask me about content ideas, video scripts, or brainstorming!" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Updated to use the same backend as script generation (port 5000)
  const BACKEND_URL = "http://127.0.0.1:5000";

  async function handleBrainstorm(action, product, tone) {
    console.log("Sending request:", { action, product, tone });
    console.log("Backend URL:", `${BACKEND_URL}/api/chat/brainstorm`);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/brainstorm`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          action: action, 
          product_name: product, 
          tone: tone 
        }),
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response data:", data);
      
      if (data.result) {
        setMessages((prev) => [...prev, { from: "bot", text: data.result }]);
      } else if (data.answer) {
        setMessages((prev) => [...prev, { from: "bot", text: data.answer }]);
      } else {
        throw new Error("No result or answer in response");
      }
      
    } catch (error) {
      console.error("Error in handleBrainstorm:", error);
      
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        setMessages((prev) => [
          ...prev, 
          { 
            from: "bot", 
            text: `⚠️ Cannot connect to AI backend. Please make sure your Flask server is running on port 5000.` 
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev, 
          { 
            from: "bot", 
            text: `Sorry, I encountered an error. Please try again.` 
          }
        ]);
      }
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    setIsLoading(true);
    
    // Add user message to state
    setMessages((prev) => [...prev, { from: "user", text: input }]);
    
    const userInput = input;
    setInput(""); // clear input immediately
    
    try {
      // Call brainstorm with user input as product name
      await handleBrainstorm("idea", userInput, "friendly");
    } catch (error) {
      console.error("Error in sendMessage:", error);
      setMessages((prev) => [
        ...prev, 
        { from: "bot", text: "Sorry, something went wrong. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {/* Toggle button */}
      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        <img
          src="/videos/chatbot.jpg"
          alt="User"
          className="chatbot-toggle-image"
        />
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="chatbot-box">
          <div className="chatbot-header">
            INNOVA AI Assistant
            <span style={{
              fontSize: '10px',
              marginLeft: '10px',
              opacity: 0.8
            }}>
              (Powered by GPT-Neo)
            </span>
            <button 
              className="close-btn" 
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                float: 'right'
              }}
            >
              ×
            </button>
          </div>
          
          <div className="chatbot-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chatbot-message ${msg.from === "user" ? "user" : "bot"}`}
              >
                <div className="chatbot-message-content">
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="chatbot-message bot">
                <div className="chatbot-message-content">
                  <div className="typing-indicator">
                    <span>AI is thinking</span>
                    <span className="dots">...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="chatbot-footer">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  sendMessage();
                }
              }}
              placeholder="Ask me anything about content creation..."
              className="chatbot-input"
              disabled={isLoading}
            />
            <button 
              onClick={sendMessage} 
              className="chatbot-send"
              disabled={isLoading || !input.trim()}
              style={{
                opacity: (isLoading || !input.trim()) ? 0.5 : 1,
                cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}