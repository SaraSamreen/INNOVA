import { Bell } from 'lucide-react';
export default function Topbar({ projectTitle = 'DesignMind / New Concept' }) {
  return (
    <header className="flex items-center justify-between px-6 h-14 border-b border-slate-100 bg-white">
      <div className="flex items-center gap-4">
        {/* Add ml-4 here to push the title a bit right */}
        <h2 className="text-lg font-semibold text-slate-800 ml-16">{projectTitle}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative p-2 rounded-md hover:bg-slate-50 cursor-pointer">
          <Bell className="w-5 h-5 text-slate-600" />
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm">W</div>
      </div>
    </header>
  );
}
