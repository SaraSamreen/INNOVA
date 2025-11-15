import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../../Dashboard/componentsD/Topbar';
import { Square, Type, Move, Droplet, Undo2, Redo2, Save } from 'lucide-react';

export default function DesignMindEditor() {
  const [selectedTool, setSelectedTool] = useState('select');

  const tools = [
    { id: 'select', label: 'Select', icon: Move },
    { id: 'shape', label: 'Shape', icon: Square },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'color', label: 'Color', icon: Droplet },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar active="editor" />
      <div className="flex-1 flex flex-col">
        <Topbar projectTitle="Design Editor" />

        <main className="flex-1 flex">
          {/* Tool Panel */}
          <div className="w-20 bg-white border-r border-slate-100 py-6 flex flex-col items-center gap-6">
            {tools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer border ${selectedTool === tool.id ? 'bg-indigo-50 border-indigo-300' : 'border-slate-100 hover:bg-slate-50'}`}
              >
                <tool.icon className="w-5 h-5 text-slate-700" />
              </div>
            ))}
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <button className="px-3 py-1 border rounded-md flex items-center gap-1 text-sm"><Undo2 className="w-4 h-4" /> Undo</button>
                <button className="px-3 py-1 border rounded-md flex items-center gap-1 text-sm"><Redo2 className="w-4 h-4" /> Redo</button>
              </div>

              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:shadow-md flex items-center gap-2 text-sm">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>

            <div className="flex-1 bg-white border rounded-2xl shadow-inner flex items-center justify-center text-slate-400">
              <p>Your editable design canvas goes here.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
