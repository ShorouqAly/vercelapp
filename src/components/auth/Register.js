import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'company', // Default to company
    companyName: '',
    publication: '',
    beatTags: [],
    bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Common journalist beats
  const commonBeats = [
    'Technology', 'Business', 'Finance', 'Startups', 'Healthcare', 
    'AI', 'Consumer Products', 'Entertainment', 'Sustainability', 
    'Venture Capital', 'Product Launches', 'Funding News'
  ];
  
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleBeatToggle = (beat) => {
    setFormData(prev => {
      const updatedBeats = prev.beatTags.includes(beat)
        ? prev.beatTags.filter(b => b !== beat)
        : [...prev.beatTags, beat];
      
      return { ...prev, beatTags: updatedBeats };
    });
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.passwordConfirm) {
      return setError('Passwords do not match');
    }
    
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post('/api/users/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        companyName: formData.role === 'company' ? formData.companyName : '',
        publication: formData.role === 'journalist' ? formData.publication : '',
        beatTags: formData.role === 'journalist' ? formData.beatTags : [],
        bio: formData.bio
      });
      
      // Login the user with the returned token
      login(response.data.token, response.data.user);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Create an Account</h2>
        <p>Join ExclusiveWire to connect brands with journalists.</p>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>I am a:</label>
            <div className="role-selector">
              <button 
                type="button"
                className={`role-btn ${formData.role === 'company' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'company' }))}
              >
                Company / PR
              </button>
              <button 
                type="button"
                className={`role-btn ${formData.role === 'journalist' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'journalist' }))}
              >
                Journalist
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name} 
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          {formData.role === 'company' && (
            <div className="form-group">
              <label htmlFor="companyName">Company Name</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required={formData.role === 'company'}
              />
            </div>
          )}
          
          {formData.role === 'journalist' && (
            <>
              <div className="form-group">
                <label htmlFor="publication">Publication / Outlet</label>
                <input
                  type="text"
                  id="publication"
                  name="publication"
                  value={formData.publication}
                  onChange={handleChange}
                  required={formData.role === 'journalist'}
                />
              </div>
              
              <div className="form-group">
                <label>Your Beats (Select all that apply)</label>
                <div className="beat-tags">
                  {commonBeats.map(beat => (
                    <div 
                      key={beat}
                      className={`beat-tag ${formData.beatTags.includes(beat) ? 'selected' : ''}`}
                      onClick={() => handleBeatToggle(beat)}
                    >
                      {beat}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          
          <div className="form-group">
            <label htmlFor="bio">Bio / About</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="passwordConfirm">Confirm Password</label>
            <input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;