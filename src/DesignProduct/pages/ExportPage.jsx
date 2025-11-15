import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../../Dashboard/componentsD/Topbar';
import { Download, Image as ImageIcon, FileArchive } from 'lucide-react';

export default function DesignMindExport() {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar active="export" />
      <div className="flex-1 flex flex-col">
        <Topbar projectTitle="Export Design" />

        <main className="flex-1 p-8">
          <div className="max-w-3xl mx-auto bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
            <h1 className="text-2xl font-semibold">Export Your Design</h1>
            <p className="text-slate-500 text-sm mt-2">Choose your preferred format.</p>

            <div className="mt-10 grid grid-cols-2 gap-6">
              <div className="p-6 border rounded-xl hover:bg-slate-50 cursor-pointer flex flex-col items-center gap-3">
                <ImageIcon className="w-8 h-8 text-slate-600" />
                <p className="font-medium">Export PNG</p>
              </div>

              <div className="p-6 border rounded-xl hover:bg-slate-50 cursor-pointer flex flex-col items-center gap-3">
                <FileArchive className="w-8 h-8 text-slate-600" />
                <p className="font-medium">Export 3D Model</p>
              </div>
            </div>

            <div className="mt-10 text-right">
              <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 shadow hover:shadow-md">
                <Download className="w-4 h-4" /> Download All
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
