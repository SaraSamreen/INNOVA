import React, { useEffect, useState } from 'react';
import "../Styles/Teams.css"

function TeamsPage() {  
  const [teams, setTeams] = useState([]);
  const [showJoin, setShowJoin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const generateCode = () => Math.random().toString(36).substr(2, 6).toUpperCase();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const res = await fetch('/api/teams');
    const data = await res.json();
    setTeams(data);
  };

  const createTeam = async () => {
    const code = generateCode();
    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: teamName, description: teamDesc, code }),
    });

    const result = await res.json();
    if (res.ok) {
      alert("Team created! Code: " + result.code);
      fetchTeams();
      setShowCreate(false);
    } else {
      alert("Error: " + result.error);
    }
  };

  const joinTeam = async () => {
    const res = await fetch(`/api/teams/join/${joinCode}`, { method: 'POST' });
    const result = await res.json();
    if (res.ok) {
      alert("Joined team: " + result.name);
    } else {
      alert("Error: " + result.error);
    }
  };

  return (
    <div className="container">
      <h1>Innova Teams</h1>

      <div id="teamsList">
        {teams.length === 0 ? (
          <p>No teams created yet.</p>
        ) : (
          teams.map((team, index) => (
            <div key={index} className="team-card">
              <strong>{team.name}</strong><br />
              {team.description}<br />
              <small>Code: {team.code}</small>
            </div>
          ))
        )}
      </div>

      <div className="button-group">
        <button onClick={() => { setShowJoin(true); setShowCreate(false); }}>Join Team</button>
        <button onClick={() => { setShowCreate(true); setShowJoin(false); }}>Create Team</button>
      </div>

      {showJoin && (
        <div id="joinTeamSection">
          <h3>Join a Team</h3>
          <input type="text" placeholder="Enter team code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
          <button onClick={joinTeam}>Join</button>
        </div>
      )}

      {showCreate && (
        <div id="createTeamSection">
          <h3>Create a New Team</h3>
          <input type="text" placeholder="Team name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
          <textarea placeholder="Team description" value={teamDesc} onChange={(e) => setTeamDesc(e.target.value)} />
          <button onClick={createTeam}>Create Team</button>
        </div>
      )}
    </div>
  );
}

export default TeamsPage;
