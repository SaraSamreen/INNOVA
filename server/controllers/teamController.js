let teams = {}; // in-memory storage { teamId: teamData }

exports.getTeams = (req, res) => {
  const teamsList = Object.values(teams);
  res.json(teamsList);
};

exports.getTeam = (req, res) => {
  const { teamId } = req.params;
  const team = teams[teamId];
  
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }
  
  res.json(team);
};

exports.createTeam = (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Team name is required' });
  }
  
  const teamId = Date.now().toString();
  const newTeam = {
    id: teamId,
    name,
    description: description || '',
    members: 1,
    createdAt: new Date().toISOString()
  };
  
  teams[teamId] = newTeam;
  res.status(201).json(newTeam);
};

exports.inviteMember = (req, res) => {
  const { teamId } = req.params;
  const { email } = req.body;
  
  const team = teams[teamId];
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  // Increment member count
  team.members = (team.members || 1) + 1;
  
  res.json({ 
    message: `Invitation sent to ${email}`,
    team 
  });
};