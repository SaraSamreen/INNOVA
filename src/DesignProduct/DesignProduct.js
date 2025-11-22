import React, { useState, useRef, useEffect } from "react"; 
import { Send, Loader2, TrendingUp, Search } from "lucide-react";

export default function MarketResearch() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "assistant",
      text: `Hello! I'm your Market Research Assistant. Tell me about any product, and I'll analyze its market demand, competition, trends, and opportunities.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), from: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    const productQuery = input;
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5002/api/market/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: productQuery }),
      });

      const data = await response.json();
      const assistantText = data.analysis || "Unable to fetch market data. Please try again.";

      const assistantMsg = { id: Date.now() + 1, from: "assistant", text: assistantText };
      setMessages((m) => [...m, assistantMsg]);
    } catch (err) {
      console.error("Market API Error:", err);
      const errorMsg = {
        id: Date.now() + 1,
        from: "assistant",
        text: "Sorry, I couldn't connect to the market research service. Please check your backend.",
      };
      setMessages((m) => [...m, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const sampleProducts = [
    "Smart water bottle",
    "Eco-friendly phone case",
    "Scented candles",
    "Wireless earbuds"
  ];

  function Message({ from, children }) {
    const isUser = from === "user";
    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
        <div className={`px-5 py-3 rounded-2xl max-w-[75%] ${isUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"}`}>
          <div className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="flex flex-col w-full h-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden bg-white">
        
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-bold">Market Research AI</h2>
              <p className="mt-1 text-sm text-blue-100">
                Real-time market analysis for any product idea
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div ref={containerRef} className="flex-1 overflow-auto p-6 bg-white">
          {messages.map((m) => (
            <Message key={m.id} from={m.from}>
              {m.text}
            </Message>
          ))}
          {loading && (
            <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              <span>Analyzing market data...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t bg-gray-50">
          {/* Sample Products */}
          <div className="flex flex-wrap gap-2 mb-4">
            {sampleProducts.map((product) => (
              <button
                key={product}
                onClick={() => setInput(product)}
                className="text-sm px-4 py-2 rounded-full bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700 transition-all"
              >
                {product}
              </button>
            ))}
          </div>

          {/* Input Field */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Enter product name or idea..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 bg-white"
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={loading}
              className="px-6 py-4 rounded-xl bg-blue-500 text-white font-medium flex items-center gap-2 hover:bg-blue-600 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}