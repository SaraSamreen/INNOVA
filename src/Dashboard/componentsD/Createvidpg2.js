// Createvidpg2.js  (Pure JavaScript – works everywhere)
import React, { useState } from "react";
import axios from "axios";

function Createvidpg2() {
  const [topic, setTopic] = useState("");
  const [settings, setSettings] = useState({
    length: "Medium (10–15 min)",
    tone: "Engaging/Interactive",
    difficulty: "High School",
    language: "English",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generate = async () => {
    if (!topic.trim()) {
      alert("Please enter a lesson topic first!");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post("http://localhost:5000/generate-script", {
        topic: topic,
        length: settings.length,
        tone: settings.tone,
        difficulty: settings.difficulty,
        language: settings.language,
      });

      setResult(res.data);
    } catch (err) {
      const errorMsg =
        (err.response && err.response.data && err.response.data.error) ||
        err.message ||
        "Something went wrong";
      alert("Error: " + errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-10">
          AI Script Generator
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* ===== LEFT: Input Panel ===== */}
          <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-10 border border-indigo-100">
            <textarea
              placeholder="e.g., The Water Cycle for 5th graders | Python Loops for beginners"
              className="w-full h-40 p-6 text-lg border-2 border-indigo-200 rounded-2xl focus:border-indigo-500 outline-none resize-none"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-5 mt-8">
              <select
                className="p-4 border rounded-xl text-gray-700"
                value={settings.length}
                onChange={(e) => setSettings({ ...settings, length: e.target.value })}
              >
                <option>Short (5–8 min)</option>
                <option>Medium (10–15 min)</option>
                <option>Long (20–30 min)</option>
              </select>

              <select
                className="p-4 border rounded-xl"
                value={settings.tone}
                onChange={(e) => setSettings({ ...settings, tone: e.target.value })}
              >
                <option>Engaging/Interactive</option>
                <option>Storytelling</option>
                <option>Formal</option>
                <option>Casual</option>
              </select>

              <select
                className="p-4 border rounded-xl"
                value={settings.difficulty}
                onChange={(e) => setSettings({ ...settings, difficulty: e.target.value })}
              >
                <option>Elementary</option>
                <option>Middle School</option>
                <option>High School</option>
                <option>University</option>
                <option>Professional</option>
              </select>

              <select
                className="p-4 border rounded-xl"
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>Hindi</option>
                <option>Arabic</option>
                <option>Chinese</option>
              </select>
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="mt-10 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xl py-6 rounded-2xl shadow-xl transition disabled:opacity-70"
            >
              {loading ? "Generating Your Script..." : "Generate Script"}
            </button>
          </div>

          {/* ===== RIGHT: Result Panel ===== */}
          <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-10 overflow-y-auto max-h-screen border border-purple-100">
            {result ? (
              <>
                <h2 className="text-3xl font-bold text-indigo-700 mb-6">
                  Your Script is Ready!
                </h2>

                {result.sections.map((s, i) => (
                  <div key={i} className="mb-10 pb-8 border-b border-gray-200 last:border-0">
                    <h3 className="text-2xl font-semibold text-purple-700">
                      {s.title.replace(/===/g, "").trim()}
                      <span className="ml-3 text-lg font-normal text-gray-500">
                        {s.timing}
                      </span>
                    </h3>
                    <p className="mt-4 text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {s.content}
                    </p>
                  </div>
                ))}

                {result.quiz && (
                  <div className="mt-10 p-8 bg-amber-50 rounded-2xl border-2 border-amber-200">
                    <h3 className="text-2xl font-bold text-amber-800 mb-4">Mini Quiz</h3>
                    <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                      {result.quiz}
                    </pre>
                  </div>
                )}

                <div className="mt-10 p-8 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
                  <h4 className="text-xl font-bold text-emerald-800 mb-3">
                    Slide Summary (Ready for Slide Generator)
                  </h4>
                  <pre className="text-sm text-emerald-700 whitespace-pre-wrap">
                    {result.slideSummary}
                  </pre>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <p className="text-3xl">Your generated script will appear here</p>
                <p className="mt-4 text-lg">Enter a topic and click Generate!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Createvidpg2;