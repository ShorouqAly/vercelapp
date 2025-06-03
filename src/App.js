import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Import all components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import AnnouncementForm from './components/announcements/AnnouncementForm';
import AnnouncementDetails from './components/announcements/AnnouncementDetails';
import JournalistBrowse from './components/journalist/JournalistBrowse';
import ChatInterface from './components/chat/ChatInterface';
import JournalistProfile from './components/profiles/JournalistProfile';
import { Navbar } from './components/layout/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// API configuration
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) return <div className="loading">Loading...</div>;
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

// Home component
const Home = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div className="home">
      <div className="hero">
        <h1>ExclusiveWire</h1>
        <h2>Connect directly with journalists for exclusive story opportunities</h2>
        <div className="hero-buttons">
          <a href="/register" className="btn btn-primary">Get Started</a>
          <a href="/login" className="btn btn-secondary">Log In</a>
        </div>
      </div>
      
      <div className="features">
        <div className="feature-card">
          <h3>For Companies</h3>
          <p>Get your announcements directly in front of interested journalists for exclusive coverage.</p>
          <ul>
            <li>Target the right beats</li>
            <li>Ensure embargoed content stays private</li>
            <li>Direct communication with journalists</li>
          </ul>
        </div>
        
        <div className="feature-card">
          <h3>For Journalists</h3>
          <p>Be the first to discover and claim exclusive stories in your beat.</p>
          <ul>
            <li>Find relevant stories without the inbox clutter</li>
            <li>Claim exclusives with a single click</li>
            <li>Communicate directly with brands</li>
          </ul>
        </div>
      </div>
      
      <div className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h4>Companies upload announcements</h4>
            <p>Add your press release, set an embargo date, and choose your plan.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>Journalists discover and claim</h4>
            <p>Journalists with matching beats get notified and can claim exclusives.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>Direct communication</h4>
            <p>Secure message thread opens for questions and coordination.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="container">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Company Routes */}
            <Route 
              path="/announcements/new" 
              element={
                <ProtectedRoute allowedRoles={['company']}>
                  <AnnouncementForm />
                </ProtectedRoute>
              } 
            />
            
            {/* Journalist Routes */}
            <Route 
              path="/journalist/browse" 
              element={
                <ProtectedRoute allowedRoles={['journalist']}>
                  <JournalistBrowse />
                </ProtectedRoute>
              } 
            />
            
            {/* Shared Protected Routes */}
            <Route 
              path="/announcements/:id" 
              element={
                <ProtectedRoute>
                  <AnnouncementDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/announcements/:id/chat" 
              element={
                <ProtectedRoute>
                  <ChatInterface />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile/journalist/:id" 
              element={
                <ProtectedRoute>
                  <JournalistProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
                path="/profile/edit" 
                element={
                  <ProtectedRoute>
                    {user ? (
                      <Navigate to={`/profile/${user.role}/${user.id}`} />
                    ) : (
                      <div>Loading...</div> // or redirect to login or dashboard
                    )}
                  </ProtectedRoute>
                } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
