import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Announcements.css';
import ArticleAmplifier from '../amplification/ArticleAmplifier';


const AnnouncementDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publishUrl, setPublishUrl] = useState('');
  const [publishing, setPublishing] = useState(false);

  const [showAmplifier, setShowAmplifier] = useState(false);
  const [mveData, setMveData] = useState(null);

  const handleAmplify = async (announcement) => {
    try {
      const response = await axios.post('/api/mve/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicationDomain: announcement.publicationDomain,
          contentType: 'standard_article',
          // other fields as needed
        }),
      });

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('MVE response not JSON:', text);
        throw new Error('Invalid response from MVE API');
      }

      setMveData(data);
      setShowAmplifier(true);
    } catch (error) {
      console.error('MVE calculation failed:', error);
    }
  };
  
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await axios.get(`/api/announcements/${id}`);
        setAnnouncement(response.data);
      } catch (err) {
        console.error('Error fetching announcement:', err);
        setError('Failed to load announcement details.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnnouncement();
  }, [id]);
  
  const handleMarkPublished = async () => {
    if (!publishUrl.trim()) {
      return alert('Please enter the published article URL');
    }
    
    try {
      setPublishing(true);
      
      await axios.post(`/api/announcements/${id}/publish`, {
        publishedUrl: publishUrl
      });
      
      const response = await axios.get(`/api/announcements/${id}`);
      setAnnouncement(response.data);
      
      alert('Story marked as published!');
    } catch (err) {
      console.error('Error marking as published:', err);
      alert('Failed to mark as published. Please try again.');
    } finally {
      setPublishing(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading announcement details...</div>;
  }
  
  if (error) {
    return <div className="error-state">{error}</div>;
  }
  
  if (!announcement) {
    return <div className="error-state">Announcement not found.</div>;
  }
  
  const isOwner = announcement.companyId._id === user.id;
  const isClaimer = announcement.exclusiveClaimedBy && announcement.exclusiveClaimedBy._id === user.id;
  const canViewFullContent = isOwner || isClaimer || user.role === 'journalist';
  
  return (
    <div className="announcement-details">
      <div className="details-header">
        <div className="status-badge">
          {getStatusBadge(announcement.status)}
        </div>
        <h1>{announcement.title}</h1>
        <div className="meta-info">
          <div className="company-info">
            <strong>Company:</strong> {announcement.companyId.companyName || announcement.companyId.name}
          </div>
          <div className="embargo-info">
            <strong>Embargo:</strong> {new Date(announcement.embargoDateTime).toLocaleString()}
          </div>
          <div className="plan-info">
            <strong>Plan:</strong> {announcement.plan}
          </div>
        </div>
      </div>
      
      {announcement.status === 'claimed' && announcement.exclusiveClaimedBy && (
        <div className="claimed-info">
          <h3>Claimed by:</h3>
          <p>
            <strong>{announcement.exclusiveClaimedBy.name}</strong>
            {announcement.exclusiveClaimedBy.publication && (
              <span> ({announcement.exclusiveClaimedBy.publication})</span>
            )}
          </p>
          <p>Email: {announcement.exclusiveClaimedBy.email}</p>
        </div>
      )}
      
      <div className="content-section">
        <h3>Summary</h3>
        <p className="summary">{announcement.summary}</p>
      </div>
      
      {canViewFullContent && (
        <div className="content-section">
          {announcement.status !== 'published' && (
            <div className="embargo-warning">
              <strong>⚠️ EMBARGOED CONTENT</strong>
              <p>This content is under embargo until {new Date(announcement.embargoDateTime).toLocaleString()}. Do not publish or share before this date.</p>
            </div>
          )}
          
          <h3>Full Press Release</h3>
          <div className="full-content">
            {announcement.fullContent.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}
      
      <div className="tags-section">
        <div className="tag-group">
          <h4>Industry Tags</h4>
          <div className="tags">
            {announcement.industryTags.map(tag => (
              <span key={tag} className="tag industry-tag">{tag}</span>
            ))}
          </div>
        </div>
        
        <div className="tag-group">
          <h4>Journalist Beat Tags</h4>
          <div className="tags">
            {announcement.journalistBeatTags.map(tag => (
              <span key={tag} className="tag beat-tag">{tag}</span>
            ))}
          </div>
        </div>
      </div>
      
      {announcement.targetOutlets && announcement.targetOutlets.length > 0 && (
        <div className="content-section">
          <h3>Target Outlets</h3>
          <p>{announcement.targetOutlets.join(', ')}</p>
        </div>
      )}
      
      <div className="actions-section">
        {announcement.status === 'claimed' && (isOwner || isClaimer) && (
          <Link 
            to={`/announcements/${id}/chat`} 
            className="btn btn-primary"
          >
            Open Chat Thread
          </Link>
        )}
        <button
          onClick={handleAmplify}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
            Amplify Article
        </button>

        {/* Amplification Modal */}
        {showAmplifier && (
          <ArticleAmplifier
            article={announcement}
            mveData={mveData}
            onClose={() => setShowAmplifier(false)}
          />
        )}
        {announcement.status === 'claimed' && isClaimer && user.role === 'journalist' && (
          <div className="publish-section">
            <h3>Mark as Published</h3>
            <div className="publish-form">
              <input
                type="url"
                placeholder="Enter the URL of your published article"
                value={publishUrl}
                onChange={(e) => setPublishUrl(e.target.value)}
                className="publish-url-input"
              />
              <button 
                className="btn btn-success"
                onClick={handleMarkPublished}
                disabled={publishing}
              >
                {publishing ? 'Publishing...' : 'Mark as Published'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="details-footer">
        <p>Created: {new Date(announcement.created).toLocaleString()}</p>
        {announcement.needsWritingSupport && (
          <p>Writing Support: {announcement.writingSupportType.replace('_', ' ')}</p>
        )}
      </div>
    </div>
  );
};

const getStatusBadge = (status) => {
  const statusMap = {
    awaiting_claim: <span className="badge badge-warning">Awaiting Claim</span>,
    claimed: <span className="badge badge-info">Claimed</span>,
    published: <span className="badge badge-success">Published</span>,
    archived: <span className="badge badge-secondary">Archived</span>
  };
  
  return statusMap[status] || null;
};

export default AnnouncementDetails;
