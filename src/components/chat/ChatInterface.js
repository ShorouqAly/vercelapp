import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Chat.css';

const ChatInterface = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [chat, setChat] = useState(null);
  const [announcement, setAnnouncement] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chatResponse, announcementResponse] = await Promise.all([
          axios.get(`/api/announcements/${id}/chat`),
          axios.get(`/api/announcements/${id}`)
        ]);
        
        setChat(chatResponse.data);
        setAnnouncement(announcementResponse.data);
      } catch (err) {
        console.error('Error fetching chat data:', err);
        setError('Failed to load chat. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setSending(true);
      
      const response = await axios.post(`/api/announcements/${id}/chat`, {
        message: newMessage.trim()
      });
      
      setChat(response.data);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading chat...</div>;
  }
  
  if (error && !chat) {
    return <div className="error-state">{error}</div>;
  }
  
  const isCompanyUser = user.role === 'company';
  const otherParty = isCompanyUser ? announcement?.exclusiveClaimedBy : announcement?.companyId;
  
  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="chat-info">
          <Link to={`/announcements/${id}`} className="back-link">
            ← Back to Announcement
          </Link>
          <h2>{announcement?.title}</h2>
          <div className="chat-participants">
            <span className="participant">
              {isCompanyUser ? 'You' : user.name} ({user.role})
            </span>
            <span className="separator">↔</span>
            <span className="participant">
              {otherParty?.name} ({isCompanyUser ? 'Journalist' : 'Company'})
              {otherParty?.publication && ` - ${otherParty.publication}`}
              {otherParty?.companyName && ` - ${otherParty.companyName}`}
            </span>
          </div>
        </div>
        
        <div className="embargo-reminder">
          <strong>Embargo:</strong> {new Date(announcement?.embargoDateTime).toLocaleString()}
        </div>
      </div>
      
      {error && <div className="alert alert-warning">{error}</div>}
      
      <div className="chat-messages">
        {chat?.messages?.length === 0 ? (
          <div className="empty-chat">
            <p>No messages yet. Start the conversation!</p>
            {isCompanyUser ? (
              <div className="conversation-starter">
                <p><strong>Suggested conversation starters:</strong></p>
                <ul>
                  <li>"Thanks for claiming our exclusive! Do you have any questions about the announcement?"</li>
                  <li>"Would you like additional quotes or information for your story?"</li>
                  <li>"Let me know if you need high-resolution images or other assets."</li>
                </ul>
              </div>
            ) : (
              <div className="conversation-starter">
                <p><strong>Questions you might want to ask:</strong></p>
                <ul>
                  <li>"Can you provide additional context about [specific aspect]?"</li>
                  <li>"Are there any executive quotes available for the story?"</li>
                  <li>"Do you have high-resolution images or product shots?"</li>
                  <li>"When would be a good time for a brief interview?"</li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="messages-list">
            {chat.messages.map((message, index) => (
              <div 
                key={index}
                className={`message ${message.senderId._id === user.id ? 'own-message' : 'other-message'}`}
              >
                <div className="message-header">
                  <span className="sender-name">
                    {message.senderId.name}
                    <span className="sender-role">({message.senderId.role})</span>
                  </span>
                  <span className="message-time">
                    {new Date(message.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="message-content">
                  {message.message.split('\n').map((line, lineIndex) => (
                    <p key={lineIndex}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <form onSubmit={handleSendMessage} className="chat-input-form">
        <div className="input-container">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            rows="3"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={sending || !newMessage.trim()}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
        <div className="input-help">
          Press Enter to send, Shift+Enter for new line
        </div>
      </form>
      
      {announcement?.status === 'claimed' && (
        <div className="chat-actions">
          {user.role === 'journalist' && (
            <div className="publish-reminder">
              <p>📝 <strong>Remember:</strong> Mark the announcement as published once your story goes live.</p>
              <Link to={`/announcements/${id}`} className="btn btn-outline">
                Go to Announcement Details
              </Link>
            </div>
          )}
          
          {user.role === 'company' && (
            <div className="company-reminders">
              <p>💡 <strong>Tips for great journalist relationships:</strong></p>
              <ul>
                <li>Respond promptly to questions</li>
                <li>Provide additional context when requested</li>
                <li>Share relevant assets (images, data, quotes)</li>
                <li>Be available for follow-up questions</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatInterface;