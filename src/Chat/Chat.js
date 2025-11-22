import React, { useEffect, useState, useRef } from 'react';
import { Send, Search, MessageCircle, Users } from 'lucide-react';
import io from 'socket.io-client';

const API_BASE = 'http://localhost:5000/api';

const ModernChat = () => {
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [socketRef, setSocketRef] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const messagesEndRef = useRef(null);

  const getAuthToken = () => localStorage.getItem('authToken') || localStorage.getItem('token');
  
  // FIXED: Try multiple possible localStorage keys for userId
  const getUserId = () => {
    // Try different possible keys
    const possibleKeys = ['userId', 'id', 'user_id', 'uid'];
    for (const key of possibleKeys) {
      const val = localStorage.getItem(key);
      if (val && val !== 'null' && val !== 'undefined') {
        return val;
      }
    }
    
    // Try to extract from 'user' object if stored as JSON
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user._id || user.id || user.userId || null;
      } catch (e) {
        console.error('Failed to parse user from localStorage');
      }
    }
    
    return null;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const userId = getUserId();
    console.log('🔑 Current User ID from localStorage:', userId);
    
    if (userId) {
      setCurrentUserId(userId.toString());
    } else {
      console.warn('⚠️ No userId found! Check your login code.');
    }
    
    fetchUsers();
    fetchConversations();
  }, []);

  // Re-fetch conversations when currentUserId changes
  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId]);

  useEffect(() => {
    const token = getAuthToken();
    const userId = getUserId();
    if (!token || !userId) return;

    const socket = io('http://localhost:5000', { auth: { token } });
    socket.on('connect', () => socket.emit('join', userId));
    socket.on('new-message', (message) => {
      setMessages(prev => prev.find(m => m._id === message._id) ? prev : [...prev, message]);
      fetchConversations();
    });
    setSocketRef(socket);
    return () => socket.disconnect();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch(`${API_BASE}/chat/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      console.log('👥 Users loaded:', data.length);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch(`${API_BASE}/chat/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      
      const filtered = (Array.isArray(data) ? data : [])
        .filter(conv => conv.lastMessage || conv.lastMessageTime)
        .sort((a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0));
      
      setConversations(filtered);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const selectUserForChat = (user) => {
    setSelectedUser(user);
    setSelectedConversation(null);
    setMessages([]);
  };

  const startConversationAndSend = async (otherUserId, content) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/chat/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ otherUserId })
      });
      if (!res.ok) throw new Error('Failed');
      const conversation = await res.json();
      
      const msgRes = await fetch(`${API_BASE}/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ conversationId: conversation._id, content })
      });
      if (!msgRes.ok) throw new Error('Failed');

      const message = await msgRes.json();
      setMessages([message]);
      setSelectedConversation(conversation);
      setSelectedUser(null);
      setMessageInput('');
      if (socketRef) socketRef.emit('join-conversation', conversation._id);
      await fetchConversations();
    } catch (err) {
      console.error('Error:', err);
      alert('Failed: ' + err.message);
    }
  };

  const selectConversation = async (conv) => {
    setSelectedConversation(conv);
    setSelectedUser(null);
    await fetchMessages(conv._id);
    if (socketRef) socketRef.emit('join-conversation', conv._id);
  };

  const fetchMessages = async (conversationId) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/chat/messages/${conversationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    if (selectedUser && !selectedConversation) {
      await startConversationAndSend(selectedUser._id, messageInput.trim());
      return;
    }
    if (!selectedConversation) return;

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ conversationId: selectedConversation._id, content: messageInput.trim() })
      });
      if (!res.ok) throw new Error('Failed');
      const message = await res.json();
      setMessages(prev => [...prev, message]);
      setMessageInput('');
      await fetchConversations();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // Get other participant from conversation
  const getOtherParticipant = (conv) => {
    if (!conv?.participants || !Array.isArray(conv.participants) || conv.participants.length < 2) {
      return null;
    }
    
    const myUserId = (currentUserId || getUserId() || '').toString().trim();
    
    // If no userId, return first participant with a name as fallback
    if (!myUserId) {
      return conv.participants.find(p => p?.name) || conv.participants[0];
    }
    
    // Find the OTHER participant (not me)
    const other = conv.participants.find(participant => {
      const participantId = (participant?._id || participant?.id || participant)?.toString().trim();
      return participantId !== myUserId;
    });
    
    return other;
  };

  const getConversationName = (conv) => {
    const other = getOtherParticipant(conv);
    if (other?.name) return other.name;
    if (other?.email) return other.email.split('@')[0];
    
    // Fallback
    const anyWithName = conv?.participants?.find(p => p?.name);
    if (anyWithName?.name) return anyWithName.name;
    if (anyWithName?.email) return anyWithName.email.split('@')[0];
    
    return 'Unknown';
  };

  const getConversationEmail = (conv) => {
    const other = getOtherParticipant(conv);
    return other?.email || '';
  };

  const getConversationInitial = (conv) => {
    const name = getConversationName(conv);
    return name.charAt(0).toUpperCase();
  };

  const getChatInfo = () => {
    if (selectedUser) {
      return {
        name: selectedUser.name || selectedUser.email?.split('@')[0] || 'Unknown',
        email: selectedUser.email || '',
        initial: (selectedUser.name || selectedUser.email || 'U').charAt(0).toUpperCase()
      };
    }
    if (selectedConversation) {
      return {
        name: getConversationName(selectedConversation),
        email: getConversationEmail(selectedConversation),
        initial: getConversationInitial(selectedConversation)
      };
    }
    return null;
  };

  const conversationUserIds = conversations.map(conv => {
    const other = getOtherParticipant(conv);
    return other?._id?.toString();
  }).filter(Boolean);

  const filteredUsers = users.filter(user => {
    if (!user?._id) return false;
    
    const myUserId = currentUserId || getUserId();
    const uid = user._id.toString();
    
    if (uid === myUserId?.toString()) return false;
    if (conversationUserIds.includes(uid)) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return user.name?.toLowerCase().includes(q) || user.email?.toLowerCase().includes(q);
    }
    return true;
  });

  const token = getAuthToken();
  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <p className="text-lg text-red-500">❌ Authentication Required</p>
          <p className="text-gray-600 mt-2">Please log in to access chat</p>
        </div>
      </div>
    );
  }

  const chatInfo = getChatInfo();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 && (
            <div className="border-b border-gray-200">
              <div className="px-4 py-2 bg-gray-50 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-semibold text-gray-600 uppercase">Active Chats</span>
              </div>
              {conversations.map(conv => {
                const name = getConversationName(conv);
                const email = getConversationEmail(conv);
                const initial = getConversationInitial(conv);
                
                if (searchQuery) {
                  const q = searchQuery.toLowerCase();
                  if (!name.toLowerCase().includes(q) && !email.toLowerCase().includes(q)) return null;
                }
                
                return (
                  <div
                    key={conv._id}
                    onClick={() => selectConversation(conv)}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition ${
                      selectedConversation?._id === conv._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
                        <p className="text-sm text-gray-500 truncate">{email}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div>
            <div className="px-4 py-2 bg-gray-50 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-semibold text-gray-600 uppercase">All Users</span>
            </div>
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-gray-500 text-sm">{searchQuery ? 'No users found' : 'No new users'}</p>
              </div>
            ) : (
              filteredUsers.map(user => (
                <div
                  key={user._id}
                  onClick={() => selectUserForChat(user)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition ${
                    selectedUser?._id === user._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {(user.name || user.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{user.name || user.email?.split('@')[0]}</h3>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {(selectedUser || selectedConversation) && chatInfo ? (
          <>
            <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {chatInfo.initial}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{chatInfo.name}</h2>
                  <p className="text-sm text-gray-500">{chatInfo.email}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map(msg => {
                  const senderId = (msg.sender?._id || msg.sender)?.toString();
                  const isSent = senderId === currentUserId?.toString();
                  const senderName = msg.sender?.name || 'Unknown';
                  
                  return (
                    <div key={msg._id} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-2 max-w-md ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isSent && (
                          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {senderName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          {!isSent && <p className="text-xs text-gray-600 mb-1 px-1">{senderName}</p>}
                          <div className={`px-4 py-2 rounded-2xl ${
                            isSent ? 'bg-blue-500 text-white rounded-br-sm' : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                          }`}>
                            <p className="break-words">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isSent ? 'text-blue-100' : 'text-gray-500'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernChat;