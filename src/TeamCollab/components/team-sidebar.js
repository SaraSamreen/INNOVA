import React from "react";
import { Users, Plus } from "lucide-react";

const TeamSidebar = ({ teams, activeTeam, onTeamSelect }) => {
  return (
    <div className="team-sidebar">
      <div className="sidebar-header">
        <h3>Your Teams</h3>
        <button className="add-team-btn">
          <Plus size={16} />
        </button>
      </div>
      
      <div className="teams-list">
        {teams.map(team => (
          <div 
            key={team.id} 
            className={`team-item ${activeTeam && activeTeam.id === team.id ? 'active' : ''}`}
            onClick={() => onTeamSelect(team)}
          >
            <div className="team-avatar">
              <Users size={18} />
            </div>
            <div className="team-info">
              <div className="team-name">{team.name}</div>
              <div className="team-meta">{team.members} members</div>
            </div>
            {team.unreadMessages > 0 && (
              <div className="unread-badge">{team.unreadMessages}</div>
            )}
          </div>
        ))}
      </div>
      
      <div className="sidebar-footer">
        <button className="create-team-btn">
          <Plus size={16} />
          <span>Create New Team</span>
        </button>
      </div>
    </div>
  );
};

export default TeamSidebar;