import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Journalist.css';

const JournalistBrowse = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get('/api/journalist/announcements');
        setAnnouncements(response.data);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError('Failed to load announcements. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnnouncements();
  }, []);
  
  const handleClaim = async (announcementId) => {
    try {
      setError('');
      
      await axios.post(`/api/announcements/${announcementId}/claim`);
      
      setAnnouncements(prev => prev.filter(a => a._id !== announcementId));
      
      alert('Exclusive successfully claimed! Check your dashboard to continue.');
    } catch (err) {
      console.error('Error claiming exclusive:', err);
      setError(err.response?.data?.message || 'Failed to claim exclusive. Please try again.');
    }
  };
  
  const filteredAnnouncements = announcements.filter(announcement => {
    if (filter === 'all') return true;
    return announcement.industryTags.includes(filter) || 
           announcement.journalistBeatTags.includes(filter);
  });
  
  const getUniqueFilters = () => {
    const tags = new Set();
    announcements.forEach(a => {
      a.industryTags.forEach(tag => tags.add(tag));
      a.journalistBeatTags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  };
  
  if (loading) {
    return <div className="loading">Loading available exclusives...</div>;
  }
  
  return (
    <div className="journalist-browse">
      <div className="browse-header">
        <h1>Available Exclusives</h1>
        <p>Discover and claim exclusive stories that match your beats</p>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {announcements.length === 0 ? (
        <div className="empty-state">
          <h3>No matching exclusives available</h3>
          <p>There are currently no announcements that match your beats. Check back later or update your beat preferences in your profile.</p>
          <div className="your-beats">
            <strong>Your beats:</strong> {user.beatTags.join(', ')}
          </div>
        </div>
      ) : (
        <>
          <div className="browse-filters">
            <label htmlFor="filter">Filter by category:</label>
            <select 
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {getUniqueFilters().map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <span className="results-count">
              {filteredAnnouncements.length} exclusives available
            </span>
          </div>
          
          <div className="announcement-cards">
            {filteredAnnouncements.map(announcement => (
              <AnnouncementCard 
                key={announcement._id}
                announcement={announcement}
                onClaim={handleClaim}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const AnnouncementCard = ({ announcement, onClaim }) => {
  const [expanded, setExpanded] = useState(false);
  const [claiming, setClaiming] = useState(false);
  
  const handleClaim = async () => {
    setClaiming(true);
    try {
      await onClaim(announcement._id);
    } finally {
      setClaiming(false);
    }
  };
  
  const isEmbargoSoon = () => {
    const embargoDate = new Date(announcement.embargoDateTime);
    const now = new Date();
    const hoursUntilEmbargo = (embargoDate - now) / (1000 * 60 * 60);
    return hoursUntilEmbargo <= 24;
  };
  
  return (
    <div className="announcement-card journalist-card">
      {isEmbargoSoon() && (
        <div className="urgency-badge">
          Embargo lifts soon!
        </div>
      )}
      
      <div className="card-header">
        <h3>{announcement.title}</h3>
        <div className="card-meta">
          <span className="company-name">
            {announcement.companyId.companyName || announcement.companyId.name}
          </span>
          <span className="plan-badge">{announcement.plan}</span>
        </div>
      </div>
      
      <div className="card-embargo">
        <strong>Embargo:</strong> {new Date(announcement.embargoDateTime).toLocaleString()}
      </div>
      
      <div className="card-tags">
        <div className="tag-group">
          <strong>Industry:</strong>
          {announcement.industryTags.map(tag => (
            <span key={tag} className="tag industry-tag">{tag}</span>
          ))}
        </div>
        <div className="tag-group">
          <strong>Beat:</strong>
          {announcement.journalistBeatTags.map(tag => (
            <span key={tag} className="tag beat-tag">{tag}</span>
          ))}
        </div>
      </div>
      
      <div className="card-summary">
        <p>{announcement.summary}</p>
      </div>
      
      {expanded && (
        <div className="card-details">
          <div className="embargo-warning">
            <strong>⚠️ EMBARGOED CONTENT</strong>
            <p>This content is under embargo until {new Date(announcement.embargoDateTime).toLocaleString()}. Do not publish or share before this date.</p>
          </div>
          <div className="full-content">
            <h4>Full Press Release:</h4>
            <div className="content-preview">
              {announcement.fullContent ? announcement.fullContent.substring(0, 500) + '...' : 'Content will be available after claiming'}
            </div>
          </div>
        </div>
      )}
      
      <div className="card-actions">
        <button 
          className="btn btn-outline"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Hide Details' : 'View More Details'}
        </button>
        
        <button 
          className="btn btn-primary"
          onClick={handleClaim}
          disabled={claiming}
        >
          {claiming ? 'Claiming...' : 'Claim Exclusive'}
        </button>
      </div>
      
      <div className="card-created">
        Posted {new Date(announcement.created).toLocaleDateString()}
      </div>
    </div>
  );
};

export default JournalistBrowse;
