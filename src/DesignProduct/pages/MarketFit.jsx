import React, { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../../Dashboard/componentsD/Topbar';

function ScorePill({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

export default function MarketFit() {
  const [aesthetics, setAesthetics] = useState(7);
  const [sustainability, setSustainability] = useState(6);
  const [priceSensitivity, setPriceSensitivity] = useState(5);
  const [usability, setUsability] = useState(7);
  const [novelty, setNovelty] = useState(6);

  // Mock small "trained" evaluator function (client-side heuristic)
  const marketScore = useMemo(() => {
    // Weighted sum heuristic
    const score = (
      aesthetics * 0.25 +
      sustainability * 0.2 +
      (10 - priceSensitivity) * 0.15 + // lower price sensitivity -> better fit
      usability * 0.25 +
      novelty * 0.15
    );
    return Math.round((score / 10) * 100); // 0-100
  }, [aesthetics, sustainability, priceSensitivity, usability, novelty]);

  const recommendation = useMemo(() => {
    if (marketScore > 80) return 'High fit: strong appeal and market readiness.';
    if (marketScore > 60) return 'Moderate fit: consider optimizing price or sustainability.';
    if (marketScore > 40) return 'Low fit: revise positioning and improve usability.';
    return 'Poor fit: major redesign or market pivot recommended.';
  }, [marketScore]);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar active="market" />
      <div className="flex-1 flex flex-col">
        <Topbar projectTitle="Market Fit Evaluator" />

        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <h1 className="text-2xl font-semibold">Market Fit Evaluator</h1>
              <p className="text-sm text-slate-500 mt-1">Estimate customer appeal quickly using design attributes. This uses a lightweight heuristic model — connect to server-side model later for production.</p>

              <div className="mt-6 grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block text-sm text-slate-600">Aesthetics</label>
                  <input type="range" min="0" max="10" value={aesthetics} onChange={(e)=>setAesthetics(Number(e.target.value))} />

                  <label className="block text-sm text-slate-600">Sustainability</label>
                  <input type="range" min="0" max="10" value={sustainability} onChange={(e)=>setSustainability(Number(e.target.value))} />

                  <label className="block text-sm text-slate-600">Price Sensitivity (0 = low sensitivity)</label>
                  <input type="range" min="0" max="10" value={priceSensitivity} onChange={(e)=>setPriceSensitivity(Number(e.target.value))} />

                  <label className="block text-sm text-slate-600">Usability</label>
                  <input type="range" min="0" max="10" value={usability} onChange={(e)=>setUsability(Number(e.target.value))} />

                  <label className="block text-sm text-slate-600">Novelty</label>
                  <input type="range" min="0" max="10" value={novelty} onChange={(e)=>setNovelty(Number(e.target.value))} />
                </div>

                <div className="bg-slate-50 rounded-xl p-6 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm text-slate-600">Estimated Market Score</h3>
                    <div className="text-2xl font-bold">{marketScore}</div>
                  </div>

                  <div className="w-full bg-white rounded-lg p-3 border">
                    <div className="text-sm text-slate-500">Recommendation</div>
                    <div className="mt-2 text-sm text-slate-700">{recommendation}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <ScorePill label="Aesthetics" value={aesthetics} />
                    <ScorePill label="Sustainability" value={sustainability} />
                    <ScorePill label="Price Sens" value={priceSensitivity} />
                    <ScorePill label="Usability" value={usability} />
                  </div>

                  <div>
                    <h4 className="text-sm text-slate-600">Actionable Suggestions</h4>
                    <ul className="mt-2 text-sm text-slate-700 list-disc list-inside space-y-1">
                      {marketScore < 60 ? (
                        <>
                          <li>Revisit pricing strategy — consider a lower-cost material or modular offering.</li>
                          <li>Boost usability: reduce steps to core functionality.</li>
                        </>
                      ) : (
                        <>
                          <li>Consider limited edition or premium finishes to capture higher margins.</li>
                          <li>Highlight sustainability claims in product marketing.</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="px-4 py-2 border rounded-md">Save Evaluation</button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md">Run Detailed Analysis</button>
              </div>
            </div>

            <div className="mt-6 text-xs text-slate-400">Note: This is a client-side mock evaluator for quick iteration. For production, connect to a trained scoring model (server-side) and A/B test against user data.</div>
          </div>
        </main>
      </div>
    </div>
  );
}