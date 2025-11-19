import React, { useState, useEffect, useRef } from "react";
import { Bell, Settings, Users, Plus, Send, Paperclip, Download, X, Image, Video, Mail, Copy, Check } from "lucide-react";
import io from 'socket.io-client';

const API_BASE = "http://localhost:5000/api";

const TeamCollab = () => {
  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [inviteLink, setInviteLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Chat states
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  
  // File states
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Socket ref
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          console.log("No auth token found");
          return;
        }

        // Try to get user from localStorage first
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        } else {
          // Fetch from API
          const res = await fetch(`${API_BASE}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const userData = await res.json();
            setCurrentUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Initialize Socket.IO
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    socketRef.current = io('http://localhost:5000', {
      auth: { token }
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
    });

    socketRef.current.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socketRef.current.on('new-file', (file) => {
      setFiles(prev => [file, ...prev]);
    });

    socketRef.current.on('user-typing', ({ userName }) => {
      setTypingUsers(prev => [...new Set([...prev, userName])]);
    });

    socketRef.current.on('user-stopped-typing', ({ userId }) => {
      setTypingUsers(prev => prev.filter(name => name !== userId));
    });

    socketRef.current.on('team-updated', () => {
      fetchTeams();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Join team room when active team changes
  useEffect(() => {
    if (activeTeam && socketRef.current) {
      socketRef.current.emit('join-team', activeTeam._id);
    }
  }, [activeTeam]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch teams on mount
  useEffect(() => {
    fetchTeams();
  }, []);

  // Fetch messages and files when active team changes
  useEffect(() => {
    if (activeTeam) {
      fetchMessages();
      fetchFiles();
    }
  }, [activeTeam]);

  const fetchTeams = async () => {
    try {
      const res = await fetch(`${API_BASE}/teams`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      const data = await res.json();
      setTeams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setTeams([]);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/chat/${activeTeam._id}/messages`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setMessages([]);
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await fetch(`${API_BASE}/files/${activeTeam._id}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching files:", err);
      setFiles([]);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/teams`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ 
          name: newTeamName,
          description: newTeamDesc 
        })
      });
      const data = await res.json();
      
      setTeams([...teams, data]);
      setActiveTeam(data);
      setNewTeamName("");
      setNewTeamDesc("");
      
      // Show invite modal after team creation
      setShowInviteModal(true);
    } catch (err) {
      console.error("Error creating team:", err);
    }
  };

  const handleTeamSelect = (team) => {
    if (activeTeam?._id !== team._id) {
      setActiveTeam(team);
      setMessages([]);
      setFiles([]);
    }
  };

  const handleTyping = () => {
    if (!isTyping && socketRef.current) {
      setIsTyping(true);
      socketRef.current.emit('typing-start', {
        teamId: activeTeam._id,
        userName: currentUser?.name || 'User'
      });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (socketRef.current) {
        socketRef.current.emit('typing-stop', {
          teamId: activeTeam._id
        });
      }
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeTeam) return;

    try {
      await fetch(`${API_BASE}/chat/${activeTeam._id}/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          content: newMessage
        })
      });
      
      setNewMessage("");
      setIsTyping(false);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        setSelectedFile(file);
      } else {
        alert('Only image and video files are allowed');
      }
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !activeTeam) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await fetch(`${API_BASE}/files/${activeTeam._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
      });
      
      setSelectedFile(null);
      fetchFiles();
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !activeTeam) return;

    try {
      const res = await fetch(`${API_BASE}/teams/${activeTeam._id}/invite`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ email: inviteEmail })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Generate invite link
        const link = `${window.location.origin}/accept-invite/${data.token}`;
        setInviteLink(link);
        alert(`Invitation sent to ${inviteEmail}! An email has been sent with the invite link.`);
        setInviteEmail("");
      } else {
        alert(data.error || 'Failed to send invitation');
      }
    } catch (err) {
      console.error("Error inviting member:", err);
      alert('Failed to send invitation');
    }
  };

  const handleCopyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-blue-600">TeamCollab</h1>
          {activeTeam && (
            <>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-800">{activeTeam.name}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Users size={14} />
                  <span>{activeTeam.members?.length || 0} members</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {activeTeam && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition"
            >
              <Plus size={16} />
              Invite Member
            </button>
          )}

          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <Bell size={20} className="text-gray-600" />
          </button>

          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <Settings size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-700">Your Teams</h3>
            <p className="text-xs text-gray-500 mt-1">
              {teams.length} {teams.length === 1 ? 'team' : 'teams'}
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {teams.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-sm text-gray-500">No teams yet</p>
                <p className="text-xs text-gray-400 mt-1">Create your first team below</p>
              </div>
            ) : (
              teams.map(team => (
                <div 
                  key={team._id} 
                  onClick={() => handleTeamSelect(team)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-1 transition ${
                    activeTeam?._id === team._id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
                    {team.name?.charAt(0).toUpperCase() || 'T'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate text-gray-800">{team.name}</div>
                    <div className="text-xs text-gray-500">{team.members?.length || 0} members</div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <input
              type="text"
              placeholder="Team Name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateTeam()}
              className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleCreateTeam}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
            >
              <Plus size={16} />
              Create Team
            </button>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex flex-1 overflow-hidden">
          {!activeTeam ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-10 bg-gray-50">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users size={40} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to TeamCollab</h2>
              <p className="text-gray-600 mb-6">Create a team or select an existing one to start collaborating</p>
            </div>
          ) : (
            <>
              {/* Chat Area */}
              <div className="flex flex-col flex-1 border-r border-gray-200 bg-white">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <p className="text-lg mb-2">No messages yet</p>
                        <p className="text-sm">Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isCurrentUser = msg.sender?._id === currentUser?._id;
                      const showDate = index === 0 || 
                        formatDate(messages[index - 1].createdAt) !== formatDate(msg.createdAt);
                      
                      return (
                        <React.Fragment key={msg._id}>
                          {showDate && (
                            <div className="flex items-center justify-center my-4">
                              <div className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                                {formatDate(msg.createdAt)}
                              </div>
                            </div>
                          )}
                          <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                            {!isCurrentUser && (
                              <div className="text-xs font-medium text-gray-600 mb-1">
                                {msg.sender?.name || 'Unknown'}
                              </div>
                            )}
                            <div className={`px-4 py-2 rounded-2xl ${
                              isCurrentUser 
                                ? 'bg-blue-500 text-white rounded-br-sm' 
                                : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                            } max-w-md`}>
                              {msg.type === 'image' && msg.fileUrl && (
                                <img 
                                  src={`http://localhost:5000${msg.fileUrl}`} 
                                  alt={msg.fileName}
                                  className="max-w-full rounded mb-2"
                                />
                              )}
                              {msg.type === 'video' && msg.fileUrl && (
                                <video 
                                  src={`http://localhost:5000${msg.fileUrl}`}
                                  controls
                                  className="max-w-full rounded mb-2"
                                />
                              )}
                              <div>{msg.content}</div>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {formatTime(msg.createdAt)}
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                  
                  {typingUsers.length > 0 && (
                    <div className="text-sm text-gray-500 italic">
                      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="flex items-center gap-2 p-4 border-t border-gray-200 bg-white">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-4 py-2 bg-gray-100 rounded-full border-none outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>

              {/* Files Sidebar */}
              <div className="w-80 bg-white flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-700">Shared Media</h3>
                  <p className="text-xs text-gray-500 mt-1">{files.length} files</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="mb-4">
                    <input 
                      type="file" 
                      id="file-upload"
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label 
                      htmlFor="file-upload"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition text-sm font-medium"
                    >
                      <Paperclip size={16} />
                      Choose File
                    </label>
                    {selectedFile && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-gray-600 flex-1 truncate">{selectedFile.name}</span>
                        <button 
                          onClick={handleFileUpload}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          Upload
                        </button>
                        <button 
                          onClick={() => setSelectedFile(null)}
                          className="p-1 text-gray-500 hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {files.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">
                        <p className="text-sm">No files shared yet</p>
                      </div>
                    ) : (
                      files.map(file => (
                        <div key={file._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                          <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                            {file.fileType === 'image' ? (
                              <Image size={18} className="text-blue-600" />
                            ) : file.fileType === 'video' ? (
                              <Video size={18} className="text-blue-600" />
                            ) : (
                              <Paperclip size={18} className="text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate text-gray-800">{file.originalName}</div>
                            <div className="text-xs text-gray-500">
                              {formatFileSize(file.fileSize)} • {file.uploadedBy?.name}
                            </div>
                          </div>
                          <a 
                            href={`http://localhost:5000${file.fileUrl}`}
                            download={file.originalName}
                            className="p-1.5 hover:bg-gray-200 rounded transition"
                          >
                            <Download size={16} className="text-gray-600" />
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Invite Team Member</h3>
              <button 
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteLink("");
                  setLinkCopied(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleInviteMember()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {inviteLink && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invite Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
                  />
                  <button
                    onClick={handleCopyInviteLink}
                    className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    {linkCopied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                {linkCopied && (
                  <p className="text-xs text-green-600 mt-1">Link copied to clipboard!</p>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteLink("");
                  setLinkCopied(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleInviteMember}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
              >
                <Mail size={16} />
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamCollab;