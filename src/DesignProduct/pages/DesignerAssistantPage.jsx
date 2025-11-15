import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../../Dashboard/componentsD/Topbar';
import CoDesignerChat from '../components/DesignerChat';

export default function DesignerAssistantPage() {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar active="assistant" />
      <div className="flex-1 flex flex-col">
        <Topbar projectTitle="AI Co-Designer" />

        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <div className="bg-white border rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Current Design</h2>
                <p className="text-sm text-slate-500 mt-1">Preview and select parts of the design to apply suggested edits.</p>

                <div className="mt-6 bg-slate-50 h-72 rounded-lg flex items-center justify-center text-slate-400">Editable design preview area</div>

                <div className="mt-4 flex items-center gap-3">
                  <button className="px-3 py-1 border rounded-md">Select Variant</button>
                  <button className="px-3 py-1 border rounded-md">Annotate</button>
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <CoDesignerChat />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}