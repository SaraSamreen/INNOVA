import React from "react";
import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Mic, ImageIcon, Smile } from 'lucide-react';

const ChatInterface = ({ teamId, teamName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const messagesEndRef = useRef(null);
  const recordingTimerRef = useRef(null);
  
  // Sample data for demonstration
  useEffect(() => {
    const sampleMessages = [
      {
        id: 1,
        sender: 'John Doe',
        content: 'Hey team, I just uploaded the new design files.',
        timestamp: '10:30 AM',
        isCurrentUser: false
      },
      {
        id: 2,
        sender: 'You',
        content: 'Thanks John! I\'ll take a look at them now.',
        timestamp: '10:32 AM',
        isCurrentUser: true
      },
      {
        id: 3,
        sender: 'Sarah Smith',
        content: 'The designs look great! I have a few suggestions for the homepage.',
        timestamp: '10:35 AM',
        isCurrentUser: false
      },
      {
        id: 4,
        sender: 'You',
        content: 'What are your thoughts, Sarah?',
        timestamp: '10:36 AM',
        isCurrentUser: true
      },
      {
        id: 5,
        sender: 'Sarah Smith',
        content: 'I think we should add more call-to-action buttons and make the hero section more prominent.',
        timestamp: '10:38 AM',
        isCurrentUser: false
      }
    ];
    
    setMessages(sampleMessages);
  }, [teamId]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (newMessage.trim() === '') return;
    
    const newMsg = {
      id: Date.now(),
      sender: 'You',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };
  
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };
  
  const stopRecording = () => {
    setIsRecording(false);
    clearInterval(recordingTimerRef.current);
    
    // In a real app, you would process the audio recording here
    const newMsg = {
      id: Date.now(),
      sender: 'You',
      content: (
        <span role="img" aria-label="microphone">
          🎤 Voice message (0:{recordingTime.toString().padStart(2, '0')})
        </span>
      ),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true
    };
    
    setMessages([...messages, newMsg]);
    setRecordingTime(0);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h3>Team Chat</h3>
      </div>
      
      <div className="messages-container">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`message ${message.isCurrentUser ? 'current-user' : ''}`}
          >
            {!message.isCurrentUser && (
              <div className="message-sender">{message.sender}</div>
            )}
            <div className="message-content">{message.content}</div>
            <div className="message-timestamp">{message.timestamp}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="message-input-container" onSubmit={handleSendMessage}>
        {isRecording ? (
          <div className="recording-indicator">
            <div className="recording-dot"></div>
            <span>Recording {formatTime(recordingTime)}</span>
            <button 
              type="button" 
              className="stop-recording-btn"
              onClick={stopRecording}
            >
              Stop
            </button>
          </div>
        ) : (
          <>
            <button type="button" className="attachment-btn">
              <Paperclip size={20} />
            </button>
            <button type="button" className="image-btn">
              <ImageIcon size={20} />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="button" className="emoji-btn">
              <Smile size={20} />
            </button>
            <button 
              type="button" 
              className="voice-btn"
              onClick={startRecording}
            >
              <Mic size={20} />
            </button>
            <button type="submit" className="send-btn">
              <Send size={20} />
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default ChatInterface;