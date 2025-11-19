import React from "react";
import { Users, Plus } from "lucide-react";

const TeamSidebar = ({ teams, activeTeam, onTeamSelect, onCreateTeam }) => {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold">Your Teams</h3>
        <button className="p-1.5 hover:bg-gray-200 rounded transition">
          <Plus size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {teams.map(team => (
          <div 
            key={team.id} 
            onClick={() => onTeamSelect(team)}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-1 transition ${
              activeTeam && activeTeam.id === team.id ? 'bg-blue-50' : 'hover:bg-gray-100'
            }`}
          >
            <div className="w-9 h-9 bg-gray-200 rounded-lg flex items-center justify-center">
              <Users size={18} className="text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{team.name}</div>
              <div className="text-xs text-gray-500">{team.members} members</div>
            </div>
            {team.unreadMessages > 0 && (
              <div className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {team.unreadMessages}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={onCreateTeam}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          <Plus size={16} />
          <span>Create New Team</span>
        </button>
      </div>
    </div>
  );
};
export default TeamSidebar;