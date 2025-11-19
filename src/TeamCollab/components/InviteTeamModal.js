import React, { useState } from "react";
import InviteTeamModal from "./InviteTeamModal"; // adjust path as needed

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const [newlyCreatedTeam, setNewlyCreatedTeam] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Handle creating a new team
  const handleCreateTeam = () => {
    if (!teamName) return;

    const newTeam = {
      id: Date.now(), // simple unique id
      name: teamName,
      description: teamDesc,
      members: [],
    };

    setTeams([...teams, newTeam]);
    setNewlyCreatedTeam(newTeam);
    setTeamName("");
    setTeamDesc("");
    setShowInviteModal(true); // open invite modal after creating team
  };

  // Handle inviting a member
  const handleInviteMember = (email, role, teamId) => {
    setTeams(prevTeams =>
      prevTeams.map(team =>
        team.id === teamId
          ? { ...team, members: [...team.members, { email, role }] }
          : team
      )
    );
    alert(`Invited ${email} as ${role} to team ${newlyCreatedTeam.name}`);
    setShowInviteModal(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Teams</h2>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="border px-3 py-2 mr-2 rounded"
        />
        <input
          type="text"
          placeholder="Team Description"
          value={teamDesc}
          onChange={(e) => setTeamDesc(e.target.value)}
          className="border px-3 py-2 mr-2 rounded"
        />
        <button
          onClick={handleCreateTeam}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Create Team
        </button>
      </div>

      <div className="space-y-3">
        {teams.map(team => (
          <div key={team.id} className="border p-3 rounded flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{team.name}</h3>
              <p className="text-sm text-gray-600">{team.description}</p>
              <p className="text-xs text-gray-500">
                Members: {team.members.map(m => m.email).join(", ") || "None"}
              </p>
            </div>
            <button
              onClick={() => {
                setNewlyCreatedTeam(team);
                setShowInviteModal(true);
              }}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Invite
            </button>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {showInviteModal && newlyCreatedTeam && (
        <InviteTeamModal
          onClose={() => setShowInviteModal(false)}
          onInvite={(email, role) => handleInviteMember(email, role, newlyCreatedTeam.id)}
        />
      )}
    </div>
  );
};

export default TeamsPage;
