import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Profiles.css';

const JournalistProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const isOwnProfile = user && user.id === id;
  const canEdit = isOwnProfile && user.role === 'journalist';
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`/api/profiles/journalist/${id}`);
        setProfile(response.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProfile();
    }
  }, [id]);
  
  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!profile) return <div className="error-state">Profile not found</div>;
  
  return (
    <div className="journalist-profile">
      <div className="profile-header">
        <div className="profile-basic">
          <div className="profile-avatar">
            {profile.userId.name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1>{profile.userId.name}</h1>
            {profile.verification.isVerified && (
              <span className="verification-badge">✓ Verified Journalist</span>
            )}
            <div className="profile-meta">
              {profile.yearsExperience && (
                <span>{profile.yearsExperience} years experience</span>
              )}
              {profile.geographicCoverage?.primary && (
                <span>📍 {profile.geographicCoverage.primary}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="profile-actions">
          {canEdit && (
            <button 
              className="btn btn-primary"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'View Profile' : 'Edit Profile'}
            </button>
          )}
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-number">{profile.analytics.profileViews || 0}</span>
              <span className="stat-label">Profile Views</span>
            </div>
            <div className="stat">
              <span className="stat-number">{profile.analytics.exclusivesClaimed || 0}</span>
              <span className="stat-label">Exclusives Claimed</span>
            </div>
            <div className="stat">
              <span className="stat-number">{profile.verification.trustScore || 50}</span>
              <span className="stat-label">Trust Score</span>
            </div>
          </div>
        </div>
      </div>
      
      {isEditing ? (
        <JournalistProfileEdit profile={profile} onSave={setProfile} />
      ) : (
        <JournalistProfileView profile={profile} />
      )}
    </div>
  );
};

const JournalistProfileView = ({ profile }) => {
  return (
    <div className="profile-content">
      {/* Bio Section */}
      {profile.bio && (
        <div className="profile-section">
          <h3>About</h3>
          <p className="bio">{profile.bio}</p>
        </div>
      )}
      
      {/* Specializations */}
      {profile.specializations && profile.specializations.length > 0 && (
        <div className="profile-section">
          <h3>Specializations</h3>
          <div className="specializations">
            {profile.specializations.map(spec => (
              <span key={spec} className="specialization-tag">{spec}</span>
            ))}
          </div>
        </div>
      )}
      
      {/* Beat Details */}
      {profile.beatDetails && profile.beatDetails.length > 0 && (
        <div className="profile-section">
          <h3>Coverage Areas</h3>
          <div className="beat-details">
            {profile.beatDetails.map((beat, index) => (
              <div key={index} className="beat-detail">
                <div className="beat-header">
                  <h4>{beat.category}</h4>
                  <span className={`expertise-level ${beat.expertiseLevel}`}>
                    {beat.expertiseLevel}
                  </span>
                </div>
                {beat.subcategories && beat.subcategories.length > 0 && (
                  <div className="subcategories">
                    {beat.subcategories.map(sub => (
                      <span key={sub} className="subcategory-tag">{sub}</span>
                    ))}
                  </div>
                )}
                {beat.description && (
                  <p className="beat-description">{beat.description}</p>
                )}
                {beat.yearsInBeat && (
                  <span className="beat-experience">{beat.yearsInBeat} years in this beat</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Portfolio */}
      {profile.portfolio && profile.portfolio.length > 0 && (
        <div className="profile-section">
          <h3>Recent Work</h3>
          <div className="portfolio">
            {profile.portfolio.slice(0, 6).map((work, index) => (
              <div key={index} className="portfolio-item">
                <h4>
                  {work.url ? (
                    <a href={work.url} target="_blank" rel="noopener noreferrer">
                      {work.title}
                    </a>
                  ) : (
                    work.title
                  )}
                  {work.isExclusive && <span className="exclusive-badge">Exclusive</span>}
                </h4>
                <div className="work-meta">
                  <span className="publication">{work.publication}</span>
                  {work.publishDate && (
                    <span className="publish-date">
                      {new Date(work.publishDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {work.description && (
                  <p className="work-description">{work.description}</p>
                )}
                {work.impact && (
                  <p className="work-impact">Impact: {work.impact}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Publications */}
      {profile.publications && profile.publications.length > 0 && (
        <div className="profile-section">
          <h3>Publications</h3>
          <div className="publications">
            {profile.publications.map((pub, index) => (
              <div key={index} className="publication-item">
                <h4>
                  {pub.name}
                  {pub.isPrimary && <span className="primary-badge">Primary</span>}
                </h4>
                <p className="publication-role">{pub.role}</p>
                <div className="publication-dates">
                  {pub.startDate && (
                    <span>
                      {new Date(pub.startDate).getFullYear()} - 
                      {pub.endDate ? new Date(pub.endDate).getFullYear() : 'Present'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Work Preferences */}
      {profile.preferences && (
        <div className="profile-section">
          <h3>Work Preferences</h3>
          <div className="preferences-grid">
            {profile.preferences.storyTypes && profile.preferences.storyTypes.length > 0 && (
              <div className="preference-item">
                <strong>Story Types:</strong>
                <div className="preference-tags">
                  {profile.preferences.storyTypes.map(type => (
                    <span key={type} className="preference-tag">{type}</span>
                  ))}
                </div>
              </div>
            )}
            
            {profile.preferences.responseTime && (
              <div className="preference-item">
                <strong>Response Time:</strong>
                <span className="preference-value">
                  {profile.preferences.responseTime.replace('-', ' ')}
                </span>
              </div>
            )}
            
            {profile.preferences.preferredLength && profile.preferences.preferredLength.length > 0 && (
              <div className="preference-item">
                <strong>Preferred Length:</strong>
                <div className="preference-tags">
                  {profile.preferences.preferredLength.map(length => (
                    <span key={length} className="preference-tag">{length}</span>
                  ))}
                </div>
              </div>
            )}
            
            {profile.preferences.exclusiveInterest && (
              <div className="preference-item">
                <strong>Exclusive Interest:</strong>
                <span className={`preference-value ${profile.preferences.exclusiveInterest}`}>
                  {profile.preferences.exclusiveInterest}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Social Media */}
      {profile.socialMedia && Object.values(profile.socialMedia).some(val => val) && (
        <div className="profile-section">
          <h3>Connect</h3>
          <div className="social-links">
            {profile.socialMedia.twitter && (
              <a href={profile.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="social-link twitter">
                Twitter
              </a>
            )}
            {profile.socialMedia.linkedin && (
              <a href={profile.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                LinkedIn
              </a>
            )}
            {profile.socialMedia.personal && (
              <a href={profile.socialMedia.personal} target="_blank" rel="noopener noreferrer" className="social-link website">
                Website
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const JournalistProfileEdit = ({ profile, onSave }) => {
  const [formData, setFormData] = useState({
    bio: profile.bio || '',
    yearsExperience: profile.yearsExperience || '',
    specializations: profile.specializations || [],
    beatDetails: profile.beatDetails || [],
    portfolio: profile.portfolio || [],
    publications: profile.publications || [],
    preferences: profile.preferences || {
      storyTypes: [],
      responseTime: 'same-day',
      preferredLength: [],
      exclusiveInterest: 'high',
      embargoComfort: 'comfortable',
      followUpPreference: 'email'
    },
    geographicCoverage: profile.geographicCoverage || {
      primary: '',
      secondary: [],
      willTravel: false,
      remote: true
    },
    socialMedia: profile.socialMedia || {
      twitter: '',
      linkedin: '',
      personal: ''
    },
    visibility: profile.visibility || {
      profilePublic: true,
      contactInfoPublic: false,
      portfolioPublic: true,
      searchable: true
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.put('/api/profiles/journalist', formData);
      onSave(response.data);
      alert('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };
  
  const handleDirectChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const addBeat = () => {
    setFormData(prev => ({
      ...prev,
      beatDetails: [...prev.beatDetails, {
        category: '',
        subcategories: [],
        expertiseLevel: 'intermediate',
        yearsInBeat: '',
        description: ''
      }]
    }));
  };
  
  const updateBeat = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      beatDetails: prev.beatDetails.map((beat, i) => 
        i === index ? { ...beat, [field]: value } : beat
      )
    }));
  };
  
  const removeBeat = (index) => {
    setFormData(prev => ({
      ...prev,
      beatDetails: prev.beatDetails.filter((_, i) => i !== index)
    }));
  };
  
  const addPortfolioItem = () => {
    setFormData(prev => ({
      ...prev,
      portfolio: [...prev.portfolio, {
        title: '',
        publication: '',
        url: '',
        publishDate: '',
        category: '',
        description: '',
        isExclusive: false,
        impact: ''
      }]
    }));
  };
  
  const updatePortfolioItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      portfolio: prev.portfolio.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };
  
  const removePortfolioItem = (index) => {
    setFormData(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index)
    }));
  };
  
  return (
    <form onSubmit={handleSubmit} className="profile-edit-form">
      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* Basic Information */}
      <div className="form-section">
        <h3>Basic Information</h3>
        
        <div className="form-group">
          <label>Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleDirectChange('bio', e.target.value)}
            placeholder="Tell people about yourself, your experience, and what you cover..."
            rows="4"
            maxLength="1000"
          />
          <small>{formData.bio.length}/1000 characters</small>
        </div>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Years of Experience</label>
            <input
              type="number"
              value={formData.yearsExperience}
              onChange={(e) => handleDirectChange('yearsExperience', parseInt(e.target.value) || '')}
              min="0"
              max="50"
            />
          </div>
          
          <div className="form-group">
            <label>Primary Location</label>
            <input
              type="text"
              value={formData.geographicCoverage.primary}
              onChange={(e) => handleChange('geographicCoverage', 'primary', e.target.value)}
              placeholder="San Francisco, CA"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Specializations</label>
          <input
            type="text"
            value={formData.specializations.join(', ')}
            onChange={(e) => handleDirectChange('specializations', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            placeholder="Investigative Reporting, Breaking News, Data Analysis"
          />
          <small>Separate multiple specializations with commas</small>
        </div>
      </div>
      
      {/* Beat Details */}
      <div className="form-section">
        <h3>Coverage Areas</h3>
        {formData.beatDetails.map((beat, index) => (
          <div key={index} className="beat-edit-item">
            <div className="form-grid">
              <div className="form-group">
                <label>Beat Category</label>
                <input
                  type="text"
                  value={beat.category}
                  onChange={(e) => updateBeat(index, 'category', e.target.value)}
                  placeholder="Technology, Healthcare, etc."
                />
              </div>
              
              <div className="form-group">
                <label>Expertise Level</label>
                <select
                  value={beat.expertiseLevel}
                  onChange={(e) => updateBeat(index, 'expertiseLevel', e.target.value)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Years in Beat</label>
                <input
                  type="number"
                  value={beat.yearsInBeat}
                  onChange={(e) => updateBeat(index, 'yearsInBeat', parseInt(e.target.value) || '')}
                  min="0"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Subcategories</label>
              <input
                type="text"
                value={beat.subcategories.join(', ')}
                onChange={(e) => updateBeat(index, 'subcategories', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="AI, Startups, Enterprise Software"
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={beat.description}
                onChange={(e) => updateBeat(index, 'description', e.target.value)}
                placeholder="Describe your coverage focus in this area..."
                rows="2"
              />
            </div>
            
            <button type="button" onClick={() => removeBeat(index)} className="btn btn-danger btn-sm">
              Remove Beat
            </button>
          </div>
        ))}
        
        <button type="button" onClick={addBeat} className="btn btn-outline">
          Add Coverage Area
        </button>
      </div>
      
      {/* Portfolio */}
      <div className="form-section">
        <h3>Portfolio</h3>
        {formData.portfolio.map((item, index) => (
          <div key={index} className="portfolio-edit-item">
            <div className="form-grid">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updatePortfolioItem(index, 'title', e.target.value)}
                  placeholder="Article title"
                />
              </div>
              
              <div className="form-group">
                <label>Publication</label>
                <input
                  type="text"
                  value={item.publication}
                  onChange={(e) => updatePortfolioItem(index, 'publication', e.target.value)}
                  placeholder="TechCrunch, The Verge, etc."
                />
              </div>
              
              <div className="form-group">
                <label>URL</label>
                <input
                  type="url"
                  value={item.url}
                  onChange={(e) => updatePortfolioItem(index, 'url', e.target.value)}
                  placeholder="https://..."
                />
              </div>
              
              <div className="form-group">
                <label>Publish Date</label>
                <input
                  type="date"
                  value={item.publishDate ? item.publishDate.split('T')[0] : ''}
                  onChange={(e) => updatePortfolioItem(index, 'publishDate', e.target.value)}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={item.description}
                onChange={(e) => updatePortfolioItem(index, 'description', e.target.value)}
                placeholder="Brief description of the story..."
                rows="2"
              />
            </div>
            
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={item.isExclusive}
                  onChange={(e) => updatePortfolioItem(index, 'isExclusive', e.target.checked)}
                />
                This was an exclusive story
              </label>
            </div>
            
            <button type="button" onClick={() => removePortfolioItem(index)} className="btn btn-danger btn-sm">
              Remove Item
            </button>
          </div>
        ))}
        
        <button type="button" onClick={addPortfolioItem} className="btn btn-outline">
          Add Portfolio Item
        </button>
      </div>
      
      {/* Work Preferences */}
      <div className="form-section">
        <h3>Work Preferences</h3>
        
        <div className="form-group">
          <label>Preferred Story Types</label>
          <div className="checkbox-group">
            {['breaking', 'analysis', 'features', 'interviews', 'reviews'].map(type => (
              <label key={type} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.preferences.storyTypes.includes(type)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...formData.preferences.storyTypes, type]
                      : formData.preferences.storyTypes.filter(t => t !== type);
                    handleChange('preferences', 'storyTypes', newTypes);
                  }}
                />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            ))}
          </div>
        </div>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Response Time</label>
            <select
              value={formData.preferences.responseTime}
              onChange={(e) => handleChange('preferences', 'responseTime', e.target.value)}
            >
              <option value="immediate">Immediate (within hours)</option>
              <option value="same-day">Same Day</option>
              <option value="within-week">Within a Week</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Exclusive Interest</label>
            <select
              value={formData.preferences.exclusiveInterest}
              onChange={(e) => handleChange('preferences', 'exclusiveInterest', e.target.value)}
            >
              <option value="high">High - I love exclusives</option>
              <option value="medium">Medium - Depends on the story</option>
              <option value="low">Low - Rarely interested</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Social Media */}
      <div className="form-section">
        <h3>Social Media & Contact</h3>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Twitter</label>
            <input
              type="url"
              value={formData.socialMedia.twitter}
              onChange={(e) => handleChange('socialMedia', 'twitter', e.target.value)}
              placeholder="https://twitter.com/username"
            />
          </div>
          
          <div className="form-group">
            <label>LinkedIn</label>
            <input
              type="url"
              value={formData.socialMedia.linkedin}
              onChange={(e) => handleChange('socialMedia', 'linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
          
          <div className="form-group">
            <label>Personal Website</label>
            <input
              type="url"
              value={formData.socialMedia.personal}
              onChange={(e) => handleChange('socialMedia', 'personal', e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
      </div>
      
      {/* Privacy Settings */}
      <div className="form-section">
        <h3>Privacy Settings</h3>
        
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.visibility.profilePublic}
              onChange={(e) => handleChange('visibility', 'profilePublic', e.target.checked)}
            />
            Make my profile public
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.visibility.portfolioPublic}
              onChange={(e) => handleChange('visibility', 'portfolioPublic', e.target.checked)}
            />
            Show my portfolio publicly
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.visibility.searchable}
              onChange={(e) => handleChange('visibility', 'searchable', e.target.checked)}
            />
            Allow companies to find me in search
          </label>
        </div>
      </div>
      
      <div className="form-buttons">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
};

export default JournalistProfile;