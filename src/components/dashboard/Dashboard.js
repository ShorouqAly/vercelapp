import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        let response;
        
        if (user.role === 'company') {
          response = await axios.get('/api/company/announcements');
        } else if (user.role === 'journalist') {
          response = await axios.get('/api/journalist/announcements');
        }
        
        setAnnouncements(response.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load your data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user]);
  
  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user.name}</h1>
        <div className="header-actions">
          {(user.role === 'company' || user.role === 'journalist') && (
            <Link to="/reviewmatch" className="nav-link">
              <Package className="w-5 h-5 mr-2" />
              ReviewMatch
            </Link>
          )}
          {user.role === 'journalist' && (
            <Link to={`/profile/journalist/${user.id}`} className="btn btn-outline">
              View My Profile
            </Link>
          )}
          {user.role === 'company' && (
            <>
              <Link to="/announcements/new" className="btn btn-primary">
                Create New Announcement
              </Link>
              <Link to="/pr-generator" className="btn btn-secondary">
                PR Generator
              </Link>
            </>
          )}
          {user.role === 'journalist' && (
            <Link to="/journalist/browse" className="btn btn-primary">
              Browse Available Exclusives
            </Link>
          )}
        </div>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="dashboard-content">
        {user.role === 'company' ? (
          <CompanyDashboard announcements={announcements} />
        ) : (
          <JournalistDashboard announcements={announcements} />
        )}
      </div>
    </div>
  );
};

const CompanyDashboard = ({ announcements }) => {
  const [revenueData, setRevenueData] = useState(null);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const response = await axios.get('/api/analytics/revenue'); // Adjust endpoint if needed
        setRevenueData(response.data);
      } catch (error) {
        console.error('Failed to fetch revenue data');
      }
    };

    fetchRevenue();
  }, []);
  if (announcements.length === 0) {
    return (
      <div className="empty-state">
        <h3>You haven't created any announcements yet</h3>
        <p>Share your news with interested journalists by creating your first exclusive announcement.</p>
        <Link to="/announcements/new" className="btn btn-secondary">
          Create Your First Announcement
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      {revenueData && (
        <div className="revenue-metrics grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Total Revenue</h3>
            <p className="text-2xl font-bold text-green-600">
              ${(revenueData.totalRevenue / 100).toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Journalist Payouts</h3>
            <p className="text-2xl font-bold text-blue-600">
              ${(revenueData.journalistPayouts / 100).toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Transactions</h3>
            <p className="text-2xl font-bold text-purple-600">
              {revenueData.transactionCount}
            </p>
          </div>
        </div>
      )}
      <div className="announcement-list">
        <h2>Your Announcements</h2>
        <div className="announcement-cards">
          {announcements.map(announcement => (
            <div key={announcement._id} className="announcement-card">
              <div className="card-status">
                {getStatusBadge(announcement.status)}
              </div>
              <h3>{announcement.title}</h3>
              <div className="card-meta">
                <span className="plan-badge">{announcement.plan} Plan</span>
                <span className="embargo">
                  Embargo: {new Date(announcement.embargoDateTime).toLocaleDateString()}
                </span>
              </div>
              {announcement.status === 'claimed' && announcement.exclusiveClaimedBy && (
                <div className="claimed-by">
                  Claimed by: {announcement.exclusiveClaimedBy.name} ({announcement.exclusiveClaimedBy.publication})
                </div>
              )}
              <div className="card-tags">
                {announcement.industryTags.slice(0, 3).map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <Link to={`/announcements/${announcement._id}`} className="btn btn-outline">
                View Details
              </Link>
              {announcement.status === 'claimed' && (
                <Link to={`/announcements/${announcement._id}/chat`} className="btn btn-secondary">
                  Open Chat
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const JournalistDashboard = ({ announcements }) => {
  return (
    <div className="dashboard-sections">
      <div className="dashboard-section">
        <h2>Claimed Exclusives</h2>
        <div className="announcement-cards">
          {announcements.filter(a => a.status === 'claimed').length === 0 ? (
            <div className="empty-state">
              <p>You haven't claimed any exclusives yet.</p>
              <Link to="/journalist/browse" className="btn btn-secondary">
                Browse Available Exclusives
              </Link>
            </div>
          ) : (
            announcements
              .filter(a => a.status === 'claimed')
              .map(announcement => (
                <div key={announcement._id} className="announcement-card">
                  <h3>{announcement.title}</h3>
                  <div className="card-meta">
                    <span className="company-name">
                      {announcement.companyId.companyName}
                    </span>
                    <span className="embargo">
                      Embargo: {new Date(announcement.embargoDateTime).toLocaleDateString()}
                    </span>
                  </div>
                  <Link to={`/announcements/${announcement._id}`} className="btn btn-outline">
                    View Details
                  </Link>
                  <Link to={`/announcements/${announcement._id}/chat`} className="btn btn-secondary">
                    Open Chat
                  </Link>
                </div>
              ))
          )}
        </div>
      </div>
      
      <div className="dashboard-section">
        <h2>Published Stories</h2>
        <div className="announcement-cards">
          {announcements.filter(a => a.status === 'published').length === 0 ? (
            <div className="empty-state">
              <p>You haven't published any exclusive stories yet.</p>
            </div>
          ) : (
            announcements
              .filter(a => a.status === 'published')
              .map(announcement => (
                <div key={announcement._id} className="announcement-card">
                  <div className="card-status">
                    <span className="badge badge-success">Published</span>
                  </div>
                  <h3>{announcement.title}</h3>
                  <div className="card-meta">
                    <span className="company-name">
                      {announcement.companyId.companyName}
                    </span>
                  </div>
                  <Link to={`/announcements/${announcement._id}`} className="btn btn-outline">
                    View Details
                  </Link>
                </div>
              ))
          )}
        </div>
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

export default Dashboard;