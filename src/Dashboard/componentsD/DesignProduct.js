import React, { useState } from "react";

const DesignProduct = () => {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("modern");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");

  const styles = ["modern", "luxury", "futuristic", "eco", "minimalist"];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setGeneratedImage(null);

    try {
      const res = await fetch("http://localhost:5000/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style }),
      });

      const data = await res.json();
      if (data.success && data.image) {
        setGeneratedImage(`data:image/png;base64,${data.image}`);
      } else {
        alert(data.message || "Failed to generate design.");
      }
    } catch (err) {
      console.error("Error generating design:", err);
      alert("Failed to generate design. Try again!");
    }
    setLoading(false);
  };

  const handleChatSend = async () => {
    if (!userMessage.trim()) return;
    const newMessage = { role: "user", content: userMessage };
    setChatMessages([...chatMessages, newMessage]);
    setUserMessage("");

    const res = await fetch("http://localhost:5000/api/ai/refine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage, currentImage: generatedImage }),
    });

    const data = await res.json();
    if (data.response) {
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    }
    if (data.updatedImage) {
      setGeneratedImage(`data:image/png;base64,${data.updatedImage}`);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = "ai-design.png";
    link.click();
  };

  return (
    <div className="min-h-screen bg-bg text-text p-6 md:p-12 font-sans">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2">DesignMind Studio</h1>
        <p className="text-text-dim text-lg">Transform your product ideas into visuals with AI ✨</p>
      </header>

      {/* Section 1: Input Panel */}
      <section className="max-w-4xl mx-auto bg-surface rounded-custom shadow-light p-8 mb-12 space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-3">Describe Your Product</h2>
          <textarea
            className="w-full h-32 p-4 rounded-custom border border-border bg-muted text-text resize-none placeholder-text-dim focus:outline-none focus:ring-2 focus:ring-accent"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: a minimalist smart lamp with touch control and gold accents"
          />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">Choose Style</h3>
          <div className="flex flex-wrap gap-3">
            {styles.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`px-4 py-2 rounded-custom font-medium border-2 transition 
                  ${
                    style === s
                      ? "bg-accent text-white border-accent-700 shadow-md"
                      : "bg-muted text-text-dim border-border hover:bg-accent hover:text-white"
                  }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-3 rounded-custom bg-accent hover:bg-accent-600 text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Designing..." : "Generate Design"}
        </button>
      </section>

      {/* Section 2: Canvas + Preview */}
      {generatedImage && (
        <section className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">
          {/* Canvas Area */}
          <div className="flex-1 bg-surface rounded-custom shadow-light p-6 space-y-4">
            <h3 className="text-xl font-semibold text-text-dim">Your Generated Design</h3>
            <div className="relative border border-border rounded-custom overflow-hidden">
              <img src={generatedImage} alt="AI Design" className="w-full rounded-custom" />
              {/* Overlay tools */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                {["Resize", "Recolor", "Add Label"].map((tool) => (
                  <button
                    key={tool}
                    className="bg-accent text-white px-3 py-1 rounded-md text-sm hover:bg-accent-700 transition"
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Co-Designer Chat */}
          <div className="flex-1 bg-surface rounded-custom shadow-light p-6 flex flex-col">
            <h3 className="text-xl font-semibold mb-4 text-text-dim">AI Co-Designer</h3>

            <div className="flex-1 overflow-y-auto border border-border rounded-custom p-4 space-y-3 bg-muted">
              {chatMessages.length === 0 && (
                <p className="text-text-dim italic">Chat with AI to refine your design...</p>
              )}
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-accent-600 text-white self-end"
                      : "bg-white text-text-dim self-start"
                  }`}
                >
                  <strong>{msg.role === "user" ? "You: " : "AI: "}</strong>
                  {msg.content}
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="e.g., make it metallic with a matte finish"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                className="flex-1 p-3 rounded-custom border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                onClick={handleChatSend}
                className="bg-accent hover:bg-accent-700 text-white px-6 rounded-custom font-semibold transition"
              >
                Send
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Section 4: Export & Insights */}
      {generatedImage && (
        <section className="max-w-6xl mx-auto mt-10 flex flex-col md:flex-row items-center justify-between gap-6 bg-surface rounded-custom shadow-light p-6">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleDownload}
              className="px-6 py-3 border border-accent rounded-custom text-accent font-semibold hover:bg-accent hover:text-white transition"
            >
              Download Design
            </button>
            <button className="px-6 py-3 bg-accent hover:bg-accent-700 text-white rounded-custom font-semibold transition">
              Save to Collection
            </button>
          </div>
          <div className="bg-muted p-4 rounded-custom text-text-dim max-w-xs text-center">
            <h4 className="font-semibold mb-2 text-text">AI Insights</h4>
            <p>
              Estimated Market Trend Fit: <strong>87%</strong> | Sustainability Score: <strong>A-</strong>
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default DesignProduct;
