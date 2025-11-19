let chats = {}; // in-memory storage { teamId: [messages] }

exports.getMessages = (req, res) => {
  const { teamId } = req.params;
  res.json(chats[teamId] || []);
};

exports.sendMessage = (req, res) => {
  const { teamId } = req.params;
  const { content, sender } = req.body;

  if (!chats[teamId]) chats[teamId] = [];

  const message = {
    id: Date.now(),
    content,
    sender,
    timestamp: new Date().toISOString(),
  };

  chats[teamId].push(message);
  res.json(message);
};
