import React, { useState, useEffect, useRef } from "react"; 
import { Send, Loader2 } from "lucide-react";

export default function EduRAGChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "assistant",
      text: `Hello! I'm your Lesson Assistant. Ask me any question based on your uploaded course material, and I will provide accurate explanations, examples, or summaries.`,
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
    const userQuestion = input;
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuestion, context_type: "course_material" }),
      });

      const data = await response.json();
      const assistantText =
        data.response || data.answer || "I couldn't find relevant information in your course materials. Try rephrasing your question.";

      const assistantMsg = { id: Date.now() + 1, from: "assistant", text: assistantText };
      setMessages((m) => [...m, assistantMsg]);
    } catch (err) {
      console.error("RAG API Error:", err);
      const errorMsg = {
        id: Date.now() + 1,
        from: "assistant",
        text: "Sorry, I encountered an error connecting to the course material database. Please ensure the RAG backend is running and try again.",
      };
      setMessages((m) => [...m, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "Explain photosynthesis in simple terms",
    "Summarize Chapter 3 of my biology textbook",
    "What are Newton's three laws of motion?",
    "Give examples of chemical reactions for grade 10 students"
  ];

  function Message({ from, children }) {
    const isUser = from === "user";
    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
        <div className={`px-4 py-3 rounded-xl max-w-[70%] ${isUser ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
          <div className="text-base sm:text-lg whitespace-pre-wrap">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="flex flex-col w-full h-full max-w-4xl rounded-2xl shadow-md overflow-hidden bg-white">
        {/* Header */}
        <div className="p-6 border-b bg-white">
          <h2 className="text-xl font-semibold text-gray-800">Educational RAG Assistant</h2>
          <p className="mt-1 text-sm text-gray-500">
            Ask questions based on your uploaded course books, notes, or lecture material.
          </p>
        </div>

        {/* Chat Messages */}
        <div ref={containerRef} className="flex-1 overflow-auto p-6 bg-white">
          {messages.map((m) => (
            <Message key={m.id} from={m.from}>
              {m.text}
            </Message>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Fetching relevant content...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t bg-white">
          <div className="flex flex-wrap gap-2 mb-3">
            {sampleQuestions.map((q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                className="text-sm px-4 py-2 rounded-full border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask a question from your course materials..."
              className="flex-1 p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="px-5 py-3 rounded-xl bg-blue-500 text-white font-medium flex items-center gap-2 hover:bg-blue-600 disabled:opacity-60"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
