import { Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ projectTitle = 'DesignMind / New Concept' }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Optional: Clear any stored authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Navigate to login page
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between px-6 h-14 border-b border-slate-100 bg-white">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-800 ml-16">{projectTitle}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative p-2 rounded-md hover:bg-slate-50 cursor-pointer">
          <Bell className="w-5 h-5 text-slate-600" />
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm">W</div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
}