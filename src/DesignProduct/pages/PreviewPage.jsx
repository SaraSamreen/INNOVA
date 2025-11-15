import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../../Dashboard/componentsD/Topbar';
import { Loader2, RefreshCw, ChevronRight } from 'lucide-react';

export default function DesignMindPreview() {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);

  // mock loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setImages([
        'https://placehold.co/600x600?text=AI+Preview+1',
        'https://placehold.co/600x600?text=AI+Preview+2'
      ]);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar active="preview" />
      <div className="flex-1 flex flex-col">
        <Topbar projectTitle="Design Preview" />

        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-semibold">Your AI-Generated Concept Designs</h1>
            <p className="text-sm text-slate-500 mt-2">Select a design to continue editing. You can regenerate anytime.</p>

            <div className="mt-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="mt-4 text-sm">Generating your design...</p>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 gap-6">
                    {images.map((img, index) => (
                      <div key={index} className="bg-white rounded-xl shadow-sm border overflow-hidden cursor-pointer hover:shadow-lg transition">
                        <img src={img} className="w-full h-auto" alt="preview" />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between mt-8">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-sm">
                      <RefreshCw className="w-4 h-4" /> Regenerate Designs
                    </button>

                    <button
                      className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:shadow-md">
                      Continue to Editor <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}