import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          ExclusiveWire
        </Link>
        
        <div className="nav-menu">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              
              {user.role === 'company' && (
                <Link to="/announcements/new" className="nav-link">
                  New Announcement
                </Link>
              )}
              
              {user.role === 'journalist' && (
                <Link to="/journalist/browse" className="nav-link">
                  Browse Exclusives
                </Link>
              )}
              
              <div className="nav-user">
                <span className="user-name">
                  {user.name} 
                  <span className="user-role">({user.role})</span>
                </span>
                <button onClick={handleLogout} className="nav-link logout-btn">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link nav-cta">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export { Navbar };