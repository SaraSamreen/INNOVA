import React, { useEffect, useState } from 'react';
import { Send, Search } from 'lucide-react';
import io from 'socket.io-client';

const API_BASE = 'http://localhost:5000/api';

const SimpleChat = () => {
  const [users, setUsers] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [socketRef, setSocketRef] = useState(null);
  const [error, setError] = useState(null);

  const getAuthToken = () => localStorage.getItem('authToken') || localStorage.getItem('token');
  const getUserId = () => localStorage.getItem('userId') || localStorage.getItem('id');

  // Fetch all users
  useEffect(() => {
    fetchUsers();
  }, []);

  // Setup Socket.IO
  useEffect(() => {
    const token = getAuthToken();
    const userId = getUserId();
    
    if (!token || !userId) {
      console.error('❌ No token or user ID found');
      setError('Authentication required');
      return;
    }

    const socket = io('http://localhost:5000', {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      socket.emit('join', userId);
    });

    socket.on('new-message', (message) => {
      console.log('📨 New message:', message);
      setMessages(prev => [...prev, message]);
    });

    socket.on('user-typing', ({ userId, userName }) => {
      console.log(`${userName} is typing...`);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    setSocketRef(socket);

    return () => socket.disconnect();
  }, []);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      
      if (!token) {
        console.error('❌ No auth token found');
        setError('No authentication token found');
        return;
      }

      console.log('🔍 Fetching users with token:', token.substring(0, 20) + '...');

      const res = await fetch(`${API_BASE}/chat/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      console.log('✅ Users fetched:', data);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Start conversation with user - FIXED ENDPOINT
  const startConversation = async (otherUserId) => {
    try {
      const token = getAuthToken();
      const currentUserId = getUserId();

      console.log('💬 Starting conversation with user:', otherUserId);

      const res = await fetch(`${API_BASE}/chat/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otherUserId })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to start conversation: ${errorText}`);
      }

      const conversation = await res.json();
      console.log('💬 Conversation created:', conversation);
      setSelectedConversation(conversation);

      // Join socket room
      if (socketRef) {
        socketRef.emit('join-conversation', conversation._id);
      }

      // Fetch messages
      await fetchMessages(conversation._id);
    } catch (err) {
      console.error('❌ Error starting conversation:', err);
      setError(err.message);
    }
  };

  // Fetch messages for conversation
  const fetchMessages = async (conversationId) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/chat/messages/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to fetch messages');

      const data = await res.json();
      console.log('📨 Messages fetched:', data);
      // Handle both array and object with messages property
      setMessages(Array.isArray(data) ? data : (data.messages || []));
    } catch (err) {
      console.error('❌ Error fetching messages:', err);
      setMessages([]);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId: selectedConversation._id,
          content: messageInput.trim()
        })
      });

      if (!res.ok) throw new Error('Failed to send message');

      const message = await res.json();
      console.log('✅ Message sent:', message);
      setMessages(prev => [...prev, message]);
      setMessageInput('');
    } catch (err) {
      console.error('❌ Error sending message:', err);
      setError(err.message);
    }
  };

  // Filter users by search
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const token = getAuthToken();
  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <p className="text-lg text-red-500">❌ Authentication Required</p>
          <p className="text-gray-600">Please log in to access chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 ml-20">
      {/* Users Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-gray-500">No users found</p>
              <button 
                onClick={fetchUsers}
                className="mt-2 text-blue-500 hover:text-blue-600 text-sm"
              >
                Retry
              </button>
            </div>
          ) : (
            filteredUsers.map(user => (
              <div
                key={user._id}
                onClick={() => startConversation(user._id)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition ${
                  selectedConversation?.participants?.some(p => p._id === user._id)
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <h3 className="font-semibold text-gray-900">{user.name || 'Unknown'}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <h2 className="text-lg font-bold text-gray-900">
                {selectedConversation.participants
                  .filter(p => p._id !== getUserId())
                  .map(p => p.name)
                  .join(', ')}
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg._id}
                    className={`flex ${msg.sender._id === getUserId() ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.sender._id === getUserId()
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4 flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleChat;