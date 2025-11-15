import React, { useState } from 'react';
import { Trash2, ChevronRight } from 'lucide-react';

export default function DesignMindPrompt() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Template Styles
  const templateStyles = [
    "Minimalist Product Shot",
    "Luxury Aesthetic",
    "Futuristic Neon",
    "Eco-friendly Craft Style",
    "Realistic Photography",
  ];

  // Quick suggestion chips
  const suggestions = [
    'Minimalist smart water bottle with temp display',
    'Luxury perfume bottle with glass and gold cap',
    'Futuristic over-ear headphones with LED accents',
    'Eco-friendly cereal box with unique opening mechanism'
  ];

  const clearPrompt = () => setPrompt('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt first.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/design/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();
      const sessionId = data.session_id || data.id || 'design_local_' + Date.now();

      window.location.href = `/designmind/preview?session_id=${encodeURIComponent(sessionId)}`;
    } catch (err) {
      console.error(err);
      alert('Failed to create design job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <div className="flex-1 flex flex-col">

        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">

              {/* Header */}
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h1 className="text-2xl font-semibold">Start Your Product Concept</h1>
                  <p className="mt-2 text-sm text-slate-500">
                    Describe the product you want DesignMind to visualize. Be as specific as possible for better results.
                  </p>
                </div>

                {/* Template Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="px-3 py-1 rounded-md border border-slate-100 text-sm bg-white hover:bg-slate-50"
                  >
                    Template
                  </button>

                  {showTemplates && (
                    <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg border border-slate-100 z-50">
                      {templateStyles.map((style) => (
                        <button
                          key={style}
                          onClick={() => {
                            setPrompt(style);
                            setShowTemplates(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100"
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Text Input Area */}
              <div className="mt-6">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`e.g. "A minimalist smart water bottle with integrated temperature display and matte finish, primary color: charcoal, accent: rose gold"`}
                  className="w-full min-h-[220px] resize-y rounded-xl border border-slate-100 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />

                {/* Controls Row */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">

                    {/* Clear */}
                    <button onClick={clearPrompt} className="p-2 rounded-md hover:bg-slate-50">
                      <Trash2 className="w-4 h-4 text-slate-600" />
                    </button>

                    {/* Suggestion Chips */}
                    <div className="flex gap-2 flex-wrap">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => setPrompt(s)}
                          className="text-xs px-3 py-1 rounded-full border border-slate-100 bg-slate-50 hover:bg-slate-100"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Word Count + Generate */}
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-500">
                      {prompt.trim().split(/\s+/).filter(Boolean).length} words
                    </div>
                    <button
                      onClick={handleGenerate}
                      disabled={loading}
                      className="flex items-center gap-2 bg-indigo-600 disabled:opacity-60 text-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md"
                    >
                      {loading ? 'Generating...' : 'Generate Concept Design'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 text-xs text-slate-400">
                  Tip: include materials, colors, scale, intended audience, and a short description of the brand vibe for better results.
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
              <div>
                Model: <span className="text-slate-700">ImageGen v3 (default)</span>
              </div>
              <div>
                Advanced: <button className="underline">Open settings</button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
