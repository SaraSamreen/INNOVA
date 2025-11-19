import React from "react";
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Mic, ImageIcon, Smile } from 'lucide-react';


const ChatInterface = ({ teamId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch messages whenever the team changes
  useEffect(() => {
    if (!teamId) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/chat/${teamId}/messages`);
        setMessages(response.data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [teamId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(`/api/chat/${teamId}/messages`, {
        content: newMessage,
      });
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col flex-1 border-r border-gray-200">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.isCurrentUser ? 'items-end' : 'items-start'}`}>
            {!msg.isCurrentUser && <div className="text-sm font-medium">{msg.sender}</div>}
            <div className={`px-4 py-2 rounded-2xl ${msg.isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
              {msg.content}
            </div>
            <div className="text-xs text-gray-500 mt-1">{msg.timestamp}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex items-center gap-2 p-3 border-t border-gray-200 bg-white">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
          className="flex-1 px-4 py-2 bg-gray-100 rounded-full border-none outline-none"
        />
        <button onClick={sendMessage} className="p-2 hover:bg-blue-50 rounded-full transition">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
