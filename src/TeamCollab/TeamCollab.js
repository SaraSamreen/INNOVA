import React from "react"
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ChatInterface from './components/chat-interface';
import FileSharing from './components/file-sharing';
import InviteTeamModel from './components/invite-team-model';
import TeamHeader from './components/team-header';
import TeamSidebar from './components/team-sidebar';
import TeamNotification from './components/team-notification';
import '../Styles/TeamCollab.css';

const TeamCollab = () => {
  const [activeTeam, setActiveTeam] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [teams, setTeams] = useState([
    { id: 1, name: 'Marketing Team', members: 5, unreadMessages: 3 },
    { id: 2, name: 'Design Team', members: 3, unreadMessages: 0 },
    { id: 3, name: 'Development Team', members: 4, unreadMessages: 2 }
  ]);

  useEffect(() => {
    // In a real app, you would fetch teams from an API
    console.log('TeamCollab component mounted');
    
    // Simulate receiving a notification
    const timer = setTimeout(() => {
      addNotification({
        id: Date.now(),
        message: 'John shared a new file in Marketing Team',
        time: new Date().toLocaleTimeString(),
        read: false
      });
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const handleTeamSelect = (team) => {
    setActiveTeam(team);
  };

  const toggleInviteModal = () => {
    setShowInviteModal(!showInviteModal);
  };

  const handleInviteTeamMember = (email, role) => {
    console.log(`Invited ${email} as ${role}`);
    // In a real app, you would send an API request to invite the user
    toggleInviteModal();
    
    // Add a notification
    addNotification({
      id: Date.now(),
      message: `Invitation sent to ${email}`,
      time: new Date().toLocaleTimeString(),
      read: false
    });
  };

  return (
    <div className="team-collab-container">
      <TeamHeader 
        activeTeam={activeTeam} 
        onInviteClick={toggleInviteModal} 
        notifications={notifications}
      />
      
      <div className="team-collab-content">
        <TeamSidebar 
          teams={teams} 
          activeTeam={activeTeam} 
          onTeamSelect={handleTeamSelect} 
        />
        
        <div className="team-collab-main">
          {activeTeam ? (
            <>
              <ChatInterface teamId={activeTeam.id} teamName={activeTeam.name} />
              <FileSharing teamId={activeTeam.id} />
            </>
          ) : (
            <div className="team-collab-placeholder">
              <h2>Select a team to start collaborating</h2>
              <p>Or create a new team to invite members</p>
              <button className="create-team-btn" onClick={toggleInviteModal}>
                + Create New Team
              </button>
            </div>
          )}
        </div>
      </div>
      
      {showInviteModal && (
        <InviteTeamModel 
          onClose={toggleInviteModal} 
          onInvite={handleInviteTeamMember} 
        />
      )}
      
      <TeamNotification 
        notifications={notifications} 
        setNotifications={setNotifications} 
      />
    </div>
  );
};

export default TeamCollab;
