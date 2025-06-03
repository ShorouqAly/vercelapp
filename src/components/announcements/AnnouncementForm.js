import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Announcements.css';
import PRGenerator from '../pr-generator/PRGenerator';

const AnnouncementForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    fullContent: '',
    attachments: [],
    industryTags: [],
    journalistBeatTags: [],
    embargoDateTime: '',
    plan: 'Basic',
    fee: 99,
    targetOutlets: [],
    needsWritingSupport: false,
    writingSupportType: 'none'
  });
  const [showPRGenerator, setShowPRGenerator] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const commonIndustryTags = [
    'Technology', 'Fintech', 'Healthcare', 'E-commerce', 'SaaS', 'AI/ML', 
    'Mobile', 'Retail', 'Media', 'Education', 'Travel', 'Food & Beverage'
  ];
  
  const commonBeatTags = [
    'Technology', 'Business', 'Finance', 'Startups', 'Healthcare', 
    'AI', 'Consumer Products', 'Entertainment', 'Sustainability', 
    'Venture Capital', 'Product Launches', 'Funding News'
  ];
  
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (name === 'plan') {
      setFormData(prev => ({
        ...prev,
        fee: value === 'Basic' ? 99 : 199
      }));
    }
  };
  
  const handleTagToggle = (tagType, tag) => {
    setFormData(prev => {
      const updatedTags = prev[tagType].includes(tag)
        ? prev[tagType].filter(t => t !== tag)
        : [...prev[tagType], tag];
      
      return { ...prev, [tagType]: updatedTags };
    });
  };
  
  const nextStep = () => {
    setStep(prevStep => prevStep + 1);
  };
  
  const prevStep = () => {
    setStep(prevStep => prevStep - 1);
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const embargoDate = new Date(formData.embargoDateTime);
      
      const response = await axios.post('/api/announcements', {
        ...formData,
        embargoDateTime: embargoDate
      });
      
      navigate(`/announcements/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create announcement. Please try again.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };
  
  const renderStep = () => {
    switch (step) {
    case 1:
      return (
        <>
          <h2>Create New Announcement</h2>
          <p>Step 1: Enter your announcement details or use our PR generator</p>
          
          {!showPRGenerator ? (
            <div className="content-options">
              <div className="content-option-cards">
                <div className="content-option-card">
                  <h3>🤖 Use PR Generator</h3>
                  <p>Answer a few questions and we'll create a professional press release for you</p>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => setShowPRGenerator(true)}
                  >
                    Generate Press Release
                  </button>
                </div>
                
                <div className="content-option-card">
                  <h3>✍️ Write Manually</h3>
                  <p>Create your announcement content from scratch</p>
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => setShowPRGenerator(false)}
                  >
                    Continue Manually
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <PRGenerator 
              onComplete={(generatedContent) => {
                setFormData(prev => ({
                  ...prev,
                  title: generatedContent.title,
                  summary: generatedContent.summary,
                  fullContent: generatedContent.fullContent,
                  industryTags: generatedContent.industryTags,
                  journalistBeatTags: generatedContent.journalistBeatTags
                }));
                setShowPRGenerator(false);
                setStep(2); // Skip to step 2 after generation
              }}
            />
          )}
          
          {!showPRGenerator && (
            <>
              <div className="form-group">
                <label htmlFor="title">Announcement Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 'Company X Raises $10M Series A'"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="summary">Summary (50-100 words) *</label>
                <textarea
                  id="summary"
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Brief summary of your announcement that journalists will see first"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="fullContent">Full Press Release *</label>
                <textarea
                  id="fullContent"
                  name="fullContent"
                  value={formData.fullContent}
                  onChange={handleChange}
                  required
                  rows="10"
                  placeholder="Your complete press release content"
                />
              </div>
              
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="needsWritingSupport"
                    checked={formData.needsWritingSupport}
                    onChange={handleChange}
                  />
                  I need help writing/editing this announcement
                </label>
              </div>
              
              {formData.needsWritingSupport && (
                <div className="form-group">
                  <label>Choose writing support level:</label>
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio"
                        name="writingSupportType"
                        value="ai_generated"
                        checked={formData.writingSupportType === 'ai_generated'}
                        onChange={handleChange}
                      />
                      AI-Generated Draft (+$49)
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="writingSupportType"
                        value="human_assisted"
                        checked={formData.writingSupportType === 'human_assisted'}
                        onChange={handleChange}
                      />
                      Human-Assisted Editing (+$99)
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="writingSupportType"
                        value="full_service"
                        checked={formData.writingSupportType === 'full_service'}
                        onChange={handleChange}
                      />
                      Full-Service Writing (+$199)
                    </label>
                  </div>
                </div>
              )}
              
              <div className="form-buttons">
                <button type="button" className="btn btn-primary" onClick={nextStep}>
                  Next: Add Tags & Embargo
                </button>
              </div>
            </>
          )}
        </>
      );
      case 2:
        return (
          <>
            <h2>Create New Announcement</h2>
            <p>Step 2: Add tags and set embargo date</p>
            
            <div className="form-group">
              <label>Industry/Category Tags *</label>
              <div className="tag-selector">
                {commonIndustryTags.map(tag => (
                  <div 
                    key={tag}
                    className={`tag-item ${formData.industryTags.includes(tag) ? 'selected' : ''}`}
                    onClick={() => handleTagToggle('industryTags', tag)}
                  >
                    {tag}
                  </div>
                ))}
              </div>
              <small>Select tags that best describe your company/product</small>
            </div>
            
            <div className="form-group">
              <label>Journalist Beat Tags *</label>
              <div className="tag-selector">
                {commonBeatTags.map(tag => (
                  <div 
                    key={tag}
                    className={`tag-item ${formData.journalistBeatTags.includes(tag) ? 'selected' : ''}`}
                    onClick={() => handleTagToggle('journalistBeatTags', tag)}
                  >
                    {tag}
                  </div>
                ))}
              </div>
              <small>Select topics that relevant journalists would cover</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="embargoDateTime">Embargo Date & Time *</label>
              <input
                type="datetime-local"
                id="embargoDateTime"
                name="embargoDateTime"
                value={formData.embargoDateTime}
                onChange={handleChange}
                required
                min={new Date().toISOString().slice(0, 16)}
              />
              <small>When the news can be made public</small>
            </div>
            
            <div className="form-buttons">
              <button type="button" className="btn btn-outline" onClick={prevStep}>
                Back
              </button>
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                Next: Choose Plan
              </button>
            </div>
          </>
        );
      
      case 3:
        return (
          <>
            <h2>Create New Announcement</h2>
            <p>Step 3: Choose your plan and finalize</p>
            
            <div className="plan-selector">
              <div 
                className={`plan-card ${formData.plan === 'Basic' ? 'selected' : ''}`}
                onClick={() => handleChange({ target: { name: 'plan', value: 'Basic' } })}
              >
                <h3>Basic Plan</h3>
                <div className="plan-price">$99</div>
                <ul className="plan-features">
                  <li>Send to up to 20 relevant journalists</li>
                  <li>Basic embargoed content security</li>
                  <li>Standard journalist communication</li>
                </ul>
              </div>
              
              <div 
                className={`plan-card ${formData.plan === 'Premium' ? 'selected' : ''}`}
                onClick={() => handleChange({ target: { name: 'plan', value: 'Premium' } })}
              >
                <h3>Premium Plan</h3>
                <div className="plan-price">$199</div>
                <ul className="plan-features">
                  <li>Send to up to 50 relevant journalists</li>
                  <li>Enhanced distribution to top publications</li>
                  <li>Priority placement in journalist feeds</li>
                  <li>Revenue sharing with journalists (30%)</li>
                  <li>Enhanced support & follow-up</li>
                </ul>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="targetOutlets">Target Specific Outlets (Optional)</label>
              <textarea
                id="targetOutlets"
                name="targetOutlets"
                value={formData.targetOutlets.join(', ')}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  targetOutlets: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                }))}
                rows="3"
                placeholder="e.g. TechCrunch, The Verge, Wired (leave blank for open distribution)"
              />
            </div>
            
            <div className="pricing-summary">
              <h4>Pricing Summary</h4>
              <div className="price-line">
                <span>{formData.plan} Plan</span>
                <span>${formData.fee}</span>
              </div>
              {formData.needsWritingSupport && formData.writingSupportType !== 'none' && (
                <div className="price-line">
                  <span>Writing Support ({formData.writingSupportType.replace('_', ' ')})</span>
                  <span>
                    ${formData.writingSupportType === 'ai_generated' ? 49 : 
                      formData.writingSupportType === 'human_assisted' ? 99 : 199}
                  </span>
                </div>
              )}
              <div className="price-line total">
                <span><strong>Total</strong></span>
                <span><strong>
                  ${formData.fee + 
                    (formData.needsWritingSupport && formData.writingSupportType !== 'none' ? 
                      (formData.writingSupportType === 'ai_generated' ? 49 : 
                       formData.writingSupportType === 'human_assisted' ? 99 : 199) : 0)}
                </strong></span>
              </div>
            </div>
            
            <div className="form-buttons">
              <button type="button" className="btn btn-outline" onClick={prevStep}>
                Back
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Pay & Launch Announcement'}
              </button>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="announcement-form-container">
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="form-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3</div>
      </div>
      
      <form onSubmit={handleSubmit} className="announcement-form">
        {renderStep()}
      </form>
    </div>
  );
};

export default AnnouncementForm;
