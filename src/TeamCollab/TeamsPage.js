import React, { useEffect, useState } from "react";

function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [showJoin, setShowJoin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false); // controls Invite Modal
  const [newlyCreatedTeam, setNewlyCreatedTeam] = useState(null); // stores team just created


  // Generate random 6-character code for team
  const generateCode = () => Math.random().toString(36).substr(2, 6).toUpperCase();

  // Fetch teams on load
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/teams");
      const data = await res.json();
      setTeams(data);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    }
  };

  const createTeam = async () => {
  if (!teamName.trim()) {
    alert("Team name is required");
    return;
  }

  const code = generateCode();

  try {
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: teamName, description: teamDesc, code }),
    });

    const result = await res.json();

    if (res.ok) {
      alert("Team created! Code: " + result.code);
      fetchTeams();            // refresh the team list
      setShowCreate(false);    // close create form
      setTeamName("");         // reset form
      setTeamDesc("");

      // ✅ Open invite modal for newly created team
      setNewlyCreatedTeam(result);
      setShowInviteModal(true);
    } else {
      alert("Error: " + result.error);
    }
  } catch (err) {
    console.error("Error creating team:", err);
  }
};
const handleInviteMember = async (email, role, teamId) => {
  try {
    const res = await fetch(`/api/teams/${teamId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    const result = await res.json();
    if (res.ok) {
      alert("Invitation sent to " + email);
      setShowInviteModal(false);  // close modal
      setNewlyCreatedTeam(null);  // clear stored team
    } else {
      alert("Error: " + result.error);
    }
  } catch (err) {
    console.error(err);
  }
};


  const joinTeam = async () => {
    if (!joinCode.trim()) {
      alert("Enter team code to join");
      return;
    }

    try {
      const res = await fetch(`/api/teams/join/${joinCode}`, { method: "POST" });
      const result = await res.json();
      if (res.ok) {
        alert("Joined team: " + result.name);
        setJoinCode("");
        fetchTeams(); // Refresh team list
        setShowJoin(false); // Close join form
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      console.error("Error joining team:", err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-xl bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-center text-3xl font-bold mb-6">Innova Teams</h1>

        {/* Teams List */}
        <div className="mb-6">
          {teams.length === 0 ? (
            <p className="text-center text-gray-500">No teams created yet.</p>
          ) : (
            teams.map((team, index) => (
              <div
                key={team.id || index}
                className="p-4 mb-3 border border-gray-300 rounded-lg bg-gray-100"
              >
                <strong className="text-lg">{team.name}</strong>
                <p className="text-gray-700">{team.description}</p>
                <small className="text-gray-600">Code: {team.code}</small>
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => {
              setShowJoin(true);
              setShowCreate(false);
            }}
            className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Join Team
          </button>

          <button
            onClick={() => {
              setShowCreate(true);
              setShowJoin(false);
            }}
            className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Create Team
          </button>
        </div>

        {/* Join Team Form */}
        {showJoin && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 border">
            <h3 className="text-xl font-semibold mb-2">Join a Team</h3>
            <input
              type="text"
              placeholder="Enter team code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="w-full p-2 border rounded-lg mb-3"
            />
            <button
              onClick={joinTeam}
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Join
            </button>
          </div>
        )}

        {/* Create Team Form */}
        {showCreate && (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-xl font-semibold mb-2">Create a New Team</h3>
            <input
              type="text"
              placeholder="Team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full p-2 border rounded-lg mb-3"
            />
            <textarea
              placeholder="Team description"
              value={teamDesc}
              onChange={(e) => setTeamDesc(e.target.value)}
              className="w-full p-2 border rounded-lg mb-3"
            />
            <button
              onClick={createTeam}
              className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Create Team
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamsPage;
