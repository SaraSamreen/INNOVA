import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Users,
  FileText,
  Edit,
  Palette,
  Video,
  Menu,
  Sparkles,
  Image,
  Plus,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: "/logo-generator", icon: Sparkles, label: "Logo Generator" },
    { path: "/poster-generator", icon: Image, label: "Poster Generator" },
    { path: "/team-collaboration", icon: Users, label: "Team Collaboration" },
    { path: "/drafts", icon: FileText, label: "Your Drafts" },
    { path: "/video-editor", icon: Edit, label: "Video Editor" },
  ];

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-20"
      } bg-white h-screen fixed left-0 top-0 flex flex-col p-4 gap-6 transition-all duration-300 ease-in-out border-r border-border/50 z-50 shadow-card`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        {isOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              INNOVA
            </span>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Create Ad Button */}
      <Link to="/create/step2" className="no-underline">
        <button className="w-full px-4 py-3 bg-gradient-primary text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-glow hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" />
          {isOpen && <span>Create Ad</span>}
        </button>
      </Link>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link key={item.path} to={item.path} className="no-underline">
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-gradient-primary text-white shadow-glow"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
