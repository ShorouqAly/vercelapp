
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import PRPreview from './PRPreview';
import './PRGenerator.css';

const PRGenerator = ({ onComplete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedPR, setGeneratedPR] = useState(null);
  
  const [formData, setFormData] = useState({
    // Step 1: Announcement Type & Audience
    announcementType: '',
    audienceType: 'b2b', // 'b2b' or 'b2c'
    
    // Step 2: Company Details
    companyDetails: {
      companyName: '',
      industry: '',
      location: '',
      website: '',
      foundedYear: '',
      aboutCompany: '',
      mediaContactName: '',
      mediaContactEmail: '',
      mediaContactPhone: ''
    },
    
    // Step 3: Announcement-Specific Details
    announcementDetails: {},
    
    // Step 4: Quotes
    quotes: {
      ceoName: '',
      ceoTitle: '',
      ceoQuote: ''
    },
    
    // Step 5: Additional Information
    additionalInfo: {}
  });
  
  const announcementTypes = [
    { value: 'funding', label: 'Funding Announcement', icon: '💰' },
    { value: 'product_launch', label: 'Product Launch', icon: '🚀' },
    { value: 'partnership', label: 'Partnership', icon: '🤝' },
    { value: 'executive_hire', label: 'Executive Hire', icon: '👔' },
    { value: 'company_news', label: 'Company News', icon: '📢' },
    { value: 'acquisition', label: 'Acquisition', icon: '🏢' }
  ];
  
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
  
  const nextStep = () => {
    setStep(prev => prev + 1);
    setError('');
  };
  
  const prevStep = () => {
    setStep(prev => prev - 1);
    setError('');
  };
  
  const generatePR = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post('/api/pr/generate', formData);
      setGeneratedPR(response.data);
      setStep(6); // Go to preview step
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate press release. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUseGenerated = () => {
    if (onComplete && generatedPR) {
      onComplete({
        title: generatedPR.title,
        summary: generatedPR.summary,
        fullContent: generatedPR.fullContent,
        industryTags: generatedPR.suggestedTags || [],
        journalistBeatTags: generatedPR.suggestedTags || []
      });
    }
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1AnnouncementType />;
      case 2:
        return <Step2CompanyDetails />;
      case 3:
        return <Step3AnnouncementDetails />;
      case 4:
        return <Step4Quotes />;
      case 5:
        return <Step5AdditionalInfo />;
      case 6:
        return <Step6Preview />;
      default:
        return null;
    }
  };
  
  // Step 1: Announcement Type & Audience
  const Step1AnnouncementType = () => (
    <div className="pr-step">
      <h2>Choose Your Announcement Type</h2>
      <p>Select the type of announcement you'd like to create</p>
      
      <div className="announcement-types">
        {announcementTypes.map(type => (
          <div
            key={type.value}
            className={`announcement-type-card ${formData.announcementType === type.value ? 'selected' : ''}`}
            onClick={() => handleDirectChange('announcementType', type.value)}
          >
            <div className="type-icon">{type.icon}</div>
            <div className="type-label">{type.label}</div>
          </div>
        ))}
      </div>
      
      <div className="audience-selector">
        <h3>Target Audience</h3>
        <div className="audience-options">
          <label className={`audience-option ${formData.audienceType === 'b2b' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="audienceType"
              value="b2b"
              checked={formData.audienceType === 'b2b'}
              onChange={(e) => handleDirectChange('audienceType', e.target.value)}
            />
            <div className="option-content">
              <strong>B2B (Business)</strong>
              <p>Technical, industry-focused language for trade publications and business media</p>
            </div>
          </label>
          
          <label className={`audience-option ${formData.audienceType === 'b2c' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="audienceType"
              value="b2c"
              checked={formData.audienceType === 'b2c'}
              onChange={(e) => handleDirectChange('audienceType', e.target.value)}
            />
            <div className="option-content">
              <strong>B2C (Consumer)</strong>
              <p>Consumer-friendly language for mainstream media and lifestyle publications</p>
            </div>
          </label>
        </div>
      </div>
      
      <div className="step-buttons">
        <button 
          className="btn btn-primary"
          onClick={nextStep}
          disabled={!formData.announcementType}
        >
          Next: Company Details
        </button>
      </div>
    </div>
  );
  
  // Step 2: Company Details
  const Step2CompanyDetails = () => (
    <div className="pr-step">
      <h2>Company Information</h2>
      <p>Tell us about your company</p>
      
      <div className="form-grid">
        <div className="form-group">
          <label>Company Name *</label>
          <input
            type="text"
            value={formData.companyDetails.companyName}
            onChange={(e) => handleChange('companyDetails', 'companyName', e.target.value)}
            placeholder="Your Company Name"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Industry *</label>
          <input
            type="text"
            value={formData.companyDetails.industry}
            onChange={(e) => handleChange('companyDetails', 'industry', e.target.value)}
            placeholder="e.g. Technology, Healthcare, Finance"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Location *</label>
          <input
            type="text"
            value={formData.companyDetails.location}
            onChange={(e) => handleChange('companyDetails', 'location', e.target.value)}
            placeholder="City, State/Country"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Website</label>
          <input
            type="url"
            value={formData.companyDetails.website}
            onChange={(e) => handleChange('companyDetails', 'website', e.target.value)}
            placeholder="https://www.yourcompany.com"
          />
        </div>
        
        <div className="form-group">
          <label>Founded Year</label>
          <input
            type="number"
            value={formData.companyDetails.foundedYear}
            onChange={(e) => handleChange('companyDetails', 'foundedYear', e.target.value)}
            placeholder="2020"
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>
      </div>
      
      <div className="form-group">
        <label>About Your Company</label>
        <textarea
          value={formData.companyDetails.aboutCompany}
          onChange={(e) => handleChange('companyDetails', 'aboutCompany', e.target.value)}
          placeholder="Brief description of what your company does..."
          rows="3"
        />
      </div>
      
      <h3>Media Contact Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Contact Name</label>
          <input
            type="text"
            value={formData.companyDetails.mediaContactName}
            onChange={(e) => handleChange('companyDetails', 'mediaContactName', e.target.value)}
            placeholder="Media Contact Name"
          />
        </div>
        
        <div className="form-group">
          <label>Contact Email</label>
          <input
            type="email"
            value={formData.companyDetails.mediaContactEmail}
            onChange={(e) => handleChange('companyDetails', 'mediaContactEmail', e.target.value)}
            placeholder="press@company.com"
          />
        </div>
        
        <div className="form-group">
          <label>Contact Phone</label>
          <input
            type="tel"
            value={formData.companyDetails.mediaContactPhone}
            onChange={(e) => handleChange('companyDetails', 'mediaContactPhone', e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>
      
      <div className="step-buttons">
        <button className="btn btn-outline" onClick={prevStep}>
          Back
        </button>
        <button 
          className="btn btn-primary"
          onClick={nextStep}
          disabled={!formData.companyDetails.companyName || !formData.companyDetails.industry || !formData.companyDetails.location}
        >
          Next: Announcement Details
        </button>
      </div>
    </div>
  );
  
  // Step 3: Announcement Details (Dynamic based on type)
  const Step3AnnouncementDetails = () => {
    const renderAnnouncementFields = () => {
      switch (formData.announcementType) {
        case 'funding':
          return <FundingFields />;
        case 'product_launch':
          return <ProductLaunchFields />;
        case 'partnership':
          return <PartnershipFields />;
        case 'executive_hire':
          return <ExecutiveHireFields />;
        case 'company_news':
          return <CompanyNewsFields />;
        case 'acquisition':
          return <AcquisitionFields />;
        default:
          return null;
      }
    };
    
    return (
      <div className="pr-step">
        <h2>Announcement Details</h2>
        <p>Provide specific information about your {announcementTypes.find(t => t.value === formData.announcementType)?.label}</p>
        
        {renderAnnouncementFields()}
        
        <div className="step-buttons">
          <button className="btn btn-outline" onClick={prevStep}>
            Back
          </button>
          <button className="btn btn-primary" onClick={nextStep}>
            Next: Add Quotes
          </button>
        </div>
      </div>
    );
  };
  
  // Funding Fields
  const FundingFields = () => (
    <div className="form-grid">
      <div className="form-group">
        <label>Funding Amount *</label>
        <input
          type="text"
          value={formData.announcementDetails.fundingAmount || ''}
          onChange={(e) => handleChange('announcementDetails', 'fundingAmount', e.target.value)}
          placeholder="5M"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Funding Round *</label>
        <select
          value={formData.announcementDetails.fundingRound || ''}
          onChange={(e) => handleChange('announcementDetails', 'fundingRound', e.target.value)}
          required
        >
          <option value="">Select Round</option>
          <option value="Pre-Seed">Pre-Seed</option>
          <option value="Seed">Seed</option>
          <option value="Series A">Series A</option>
          <option value="Series B">Series B</option>
          <option value="Series C">Series C</option>
          <option value="Bridge">Bridge</option>
          <option value="Growth">Growth</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>Lead Investor *</label>
        <input
          type="text"
          value={formData.announcementDetails.leadInvestor || ''}
          onChange={(e) => handleChange('announcementDetails', 'leadInvestor', e.target.value)}
          placeholder="Venture Capital Firm"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Other Investors</label>
        <input
          type="text"
          value={formData.announcementDetails.otherInvestors || ''}
          onChange={(e) => handleChange('announcementDetails', 'otherInvestors', e.target.value)}
          placeholder="Angel Investor, Strategic Partner"
        />
      </div>
      
      <div className="form-group full-width">
        <label>Use of Funds *</label>
        <textarea
          value={formData.announcementDetails.useOfFunds || ''}
          onChange={(e) => handleChange('announcementDetails', 'useOfFunds', e.target.value)}
          placeholder="What will you use the funding for? e.g., expand the team, develop new products, enter new markets"
          rows="3"
          required
        />
      </div>
      
      {formData.audienceType === 'b2b' && (
        <>
          <div className="form-group">
            <label>Market Size</label>
            <input
              type="text"
              value={formData.announcementDetails.marketSize || ''}
              onChange={(e) => handleChange('announcementDetails', 'marketSize', e.target.value)}
              placeholder="50B"
            />
          </div>
          
          <div className="form-group full-width">
            <label>Value Proposition</label>
            <textarea
              value={formData.announcementDetails.valueProposition || ''}
              onChange={(e) => handleChange('announcementDetails', 'valueProposition', e.target.value)}
              placeholder="Key value your technology/platform provides to enterprise clients"
              rows="2"
            />
          </div>
        </>
      )}
      
      {formData.audienceType === 'b2c' && (
        <>
          <div className="form-group">
            <label>Consumer Benefit</label>
            <input
              type="text"
              value={formData.announcementDetails.consumerBenefit || ''}
              onChange={(e) => handleChange('announcementDetails', 'consumerBenefit', e.target.value)}
              placeholder="How does this help everyday people?"
            />
          </div>
          
          <div className="form-group">
            <label>Customer Count</label>
            <input
              type="text"
              value={formData.announcementDetails.customerCount || ''}
              onChange={(e) => handleChange('announcementDetails', 'customerCount', e.target.value)}
              placeholder="10,000"
            />
          </div>
        </>
      )}
    </div>
  );
  
  // Product Launch Fields
  const ProductLaunchFields = () => (
    <div className="form-grid">
      <div className="form-group">
        <label>Product Name *</label>
        <input
          type="text"
          value={formData.announcementDetails.productName || ''}
          onChange={(e) => handleChange('announcementDetails', 'productName', e.target.value)}
          placeholder="Your Product Name"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Product Category *</label>
        <input
          type="text"
          value={formData.announcementDetails.productCategory || ''}
          onChange={(e) => handleChange('announcementDetails', 'productCategory', e.target.value)}
          placeholder="e.g., Software Platform, Mobile App, SaaS Tool"
          required
        />
      </div>
      
      <div className="form-group full-width">
        <label>Product Description *</label>
        <textarea
          value={formData.announcementDetails.productDescription || ''}
          onChange={(e) => handleChange('announcementDetails', 'productDescription', e.target.value)}
          placeholder="Brief description of what your product does"
          rows="3"
          required
        />
      </div>
      
      {formData.audienceType === 'b2b' ? (
        <>
          <div className="form-group full-width">
            <label>Business Problem</label>
            <textarea
              value={formData.announcementDetails.businessProblem || ''}
              onChange={(e) => handleChange('announcementDetails', 'businessProblem', e.target.value)}
              placeholder="What business challenge does this product solve?"
              rows="2"
            />
          </div>
          
          <div className="form-group full-width">
            <label>Enterprise Features</label>
            <textarea
              value={formData.announcementDetails.enterpriseFeatures || ''}
              onChange={(e) => handleChange('announcementDetails', 'enterpriseFeatures', e.target.value)}
              placeholder="List key enterprise features (separate with commas)"
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label>Implementation Time</label>
            <input
              type="text"
              value={formData.announcementDetails.implementationTime || ''}
              onChange={(e) => handleChange('announcementDetails', 'implementationTime', e.target.value)}
              placeholder="30-60 days"
            />
          </div>
        </>
      ) : (
        <>
          <div className="form-group full-width">
            <label>Consumer Problem</label>
            <textarea
              value={formData.announcementDetails.consumerProblem || ''}
              onChange={(e) => handleChange('announcementDetails', 'consumerProblem', e.target.value)}
              placeholder="What everyday problem does this solve for people?"
              rows="2"
            />
          </div>
          
          <div className="form-group full-width">
            <label>Consumer Features</label>
            <textarea
              value={formData.announcementDetails.consumerFeatures || ''}
              onChange={(e) => handleChange('announcementDetails', 'consumerFeatures', e.target.value)}
              placeholder="List key consumer-friendly features (separate with commas)"
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label>Special Offer</label>
            <input
              type="text"
              value={formData.announcementDetails.specialOffer || ''}
              onChange={(e) => handleChange('announcementDetails', 'specialOffer', e.target.value)}
              placeholder="Limited time discount or special offer"
            />
          </div>
        </>
      )}
      
      <div className="form-group">
        <label>Availability</label>
        <input
          type="text"
          value={formData.announcementDetails.availability || ''}
          onChange={(e) => handleChange('announcementDetails', 'availability', e.target.value)}
          placeholder="Available now, Coming Q2 2024, etc."
        />
      </div>
      
      <div className="form-group">
        <label>Product Website</label>
        <input
          type="url"
          value={formData.announcementDetails.productWebsite || ''}
          onChange={(e) => handleChange('announcementDetails', 'productWebsite', e.target.value)}
          placeholder="https://product.company.com"
        />
      </div>
    </div>
  );
  
  // Partnership Fields
  const PartnershipFields = () => (
    <div className="form-grid">
      <div className="form-group">
        <label>Partner Company Name *</label>
        <input
          type="text"
          value={formData.announcementDetails.partnerName || ''}
          onChange={(e) => handleChange('announcementDetails', 'partnerName', e.target.value)}
          placeholder="Partner Company"
          required
        />
      </div>
      
      <div className="form-group full-width">
        <label>Partnership Goal *</label>
        <textarea
          value={formData.announcementDetails.partnershipGoal || ''}
          onChange={(e) => handleChange('announcementDetails', 'partnershipGoal', e.target.value)}
          placeholder="What is the main goal of this partnership?"
          rows="2"
          required
        />
      </div>
      
      <div className="form-group full-width">
        <label>Partnership Benefits</label>
        <textarea
          value={formData.announcementDetails.partnershipBenefits || ''}
          onChange={(e) => handleChange('announcementDetails', 'partnershipBenefits', e.target.value)}
          placeholder="List key benefits (separate with commas)"
          rows="3"
        />
      </div>
      
      <div className="form-group full-width">
        <label>Partner Description</label>
        <textarea
          value={formData.announcementDetails.partnerDescription || ''}
          onChange={(e) => handleChange('announcementDetails', 'partnerDescription', e.target.value)}
          placeholder="Brief description of the partner company"
          rows="2"
        />
      </div>
      
      {formData.audienceType === 'b2b' && (
        <>
          <div className="form-group">
            <label>Partner Technology</label>
            <input
              type="text"
              value={formData.announcementDetails.partnerTechnology || ''}
              onChange={(e) => handleChange('announcementDetails', 'partnerTechnology', e.target.value)}
              placeholder="Partner's core technology/platform"
            />
          </div>
          
          <div className="form-group full-width">
            <label>Enterprise Challenge</label>
            <textarea
              value={formData.announcementDetails.enterpriseChallenge || ''}
              onChange={(e) => handleChange('announcementDetails', 'enterpriseChallenge', e.target.value)}
              placeholder="What enterprise challenge does this partnership address?"
              rows="2"
            />
          </div>
        </>
      )}
      
      {formData.audienceType === 'b2c' && (
        <>
          <div className="form-group">
            <label>Consumer Benefit</label>
            <input
              type="text"
              value={formData.announcementDetails.consumerBenefit || ''}
              onChange={(e) => handleChange('announcementDetails', 'consumerBenefit', e.target.value)}
              placeholder="How does this benefit customers?"
            />
          </div>
          
          <div className="form-group">
            <label>Shared Values</label>
            <input
              type="text"
              value={formData.announcementDetails.sharedValues || ''}
              onChange={(e) => handleChange('announcementDetails', 'sharedValues', e.target.value)}
              placeholder="What values do both companies share?"
            />
          </div>
        </>
      )}
    </div>
  );
  
  // Executive Hire Fields
  const ExecutiveHireFields = () => (
    <div className="form-grid">
      <div className="form-group">
        <label>Executive Name *</label>
        <input
          type="text"
          value={formData.announcementDetails.executiveName || ''}
          onChange={(e) => handleChange('announcementDetails', 'executiveName', e.target.value)}
          placeholder="Executive's Full Name"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Executive Role *</label>
        <input
          type="text"
          value={formData.announcementDetails.executiveRole || ''}
          onChange={(e) => handleChange('announcementDetails', 'executiveRole', e.target.value)}
          placeholder="Chief Technology Officer"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Years of Experience</label>
        <input
          type="number"
          value={formData.announcementDetails.executiveExperience || ''}
          onChange={(e) => handleChange('announcementDetails', 'executiveExperience', e.target.value)}
          placeholder="15"
        />
      </div>
      
      <div className="form-group">
        <label>Area of Expertise</label>
        <input
          type="text"
          value={formData.announcementDetails.executiveExpertise || ''}
          onChange={(e) => handleChange('announcementDetails', 'executiveExpertise', e.target.value)}
          placeholder="e.g. Technology, Sales, Marketing"
        />
      </div>
      
      <div className="form-group full-width">
        <label>Executive Background</label>
        <textarea
          value={formData.announcementDetails.executiveBackground || ''}
          onChange={(e) => handleChange('announcementDetails', 'executiveBackground', e.target.value)}
          placeholder="Previous roles and achievements"
          rows="3"
        />
      </div>
      
      <div className="form-group full-width">
        <label>Key Responsibilities</label>
        <textarea
          value={formData.announcementDetails.executiveResponsibilities || ''}
          onChange={(e) => handleChange('announcementDetails', 'executiveResponsibilities', e.target.value)}
          placeholder="List main responsibilities (separate with commas)"
          rows="3"
        />
      </div>
      
      {formData.audienceType === 'b2c' && (
        <>
          <div className="form-group">
            <label>Personal Passion</label>
            <input
              type="text"
              value={formData.announcementDetails.executivePassion || ''}
              onChange={(e) => handleChange('announcementDetails', 'executivePassion', e.target.value)}
              placeholder="What drives them personally?"
            />
          </div>
          
          <div className="form-group">
            <label>Hobbies/Interests</label>
            <input
              type="text"
              value={formData.announcementDetails.executiveHobbies || ''}
              onChange={(e) => handleChange('announcementDetails', 'executiveHobbies', e.target.value)}
              placeholder="Personal interests outside work"
            />
          </div>
        </>
      )}
    </div>
  );
  
  // Company News Fields
  const CompanyNewsFields = () => (
    <div className="form-grid">
      <div className="form-group">
        <label>News Type *</label>
        <input
          type="text"
          value={formData.announcementDetails.newsType || ''}
          onChange={(e) => handleChange('announcementDetails', 'newsType', e.target.value)}
          placeholder="e.g. Milestone Achievement, Award, Expansion"
          required
        />
      </div>
      
      <div className="form-group full-width">
        <label>News Title</label>
        <input
          type="text"
          value={formData.announcementDetails.newsTitle || ''}
          onChange={(e) => handleChange('announcementDetails', 'newsTitle', e.target.value)}
          placeholder="Custom headline (optional - will auto-generate if blank)"
        />
      </div>
      
      <div className="form-group full-width">
        <label>News Summary</label>
        <textarea
          value={formData.announcementDetails.newsSummary || ''}
          onChange={(e) => handleChange('announcementDetails', 'newsSummary', e.target.value)}
          placeholder="Brief summary of the news"
          rows="3"
        />
      </div>
      
      <div className="form-group full-width">
        <label>News Details</label>
        <textarea
          value={formData.announcementDetails.newsDetails || ''}
          onChange={(e) => handleChange('announcementDetails', 'newsDetails', e.target.value)}
          placeholder="Detailed information about the news"
          rows="4"
        />
      </div>
      
      <div className="form-group full-width">
        <label>Impact/Significance</label>
        <textarea
          value={formData.announcementDetails.newsImpact || ''}
          onChange={(e) => handleChange('announcementDetails', 'newsImpact', e.target.value)}
          placeholder="Why is this news important? How does it impact the company or customers?"
          rows="2"
        />
      </div>
    </div>
  );
  
  // Acquisition Fields
  const AcquisitionFields = () => (
    <div className="form-grid">
      <div className="form-group">
        <label>Acquisition Type *</label>
        <select
          value={formData.announcementDetails.acquisitionType || ''}
          onChange={(e) => handleChange('announcementDetails', 'acquisitionType', e.target.value)}
          required
        >
          <option value="">Select Type</option>
          <option value="acquiring">We are acquiring another company</option>
          <option value="acquired">We are being acquired</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>Target Company *</label>
        <input
          type="text"
          value={formData.announcementDetails.targetCompany || ''}
          onChange={(e) => handleChange('announcementDetails', 'targetCompany', e.target.value)}
          placeholder="Company being acquired/acquiring"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Acquisition Amount</label>
        <input
          type="text"
          value={formData.announcementDetails.acquisitionAmount || ''}
          onChange={(e) => handleChange('announcementDetails', 'acquisitionAmount', e.target.value)}
          placeholder="50M (optional)"
        />
      </div>
      
      <div className="form-group full-width">
        <label>Acquisition Rationale</label>
        <textarea
          value={formData.announcementDetails.acquisitionRationale || ''}
          onChange={(e) => handleChange('announcementDetails', 'acquisitionRationale', e.target.value)}
          placeholder="Why is this acquisition happening? What's the strategic rationale?"
          rows="3"
        />
      </div>
      
      <div className="form-group full-width">
        <label>Key Benefits</label>
        <textarea
          value={formData.announcementDetails.acquisitionBenefits || ''}
          onChange={(e) => handleChange('announcementDetails', 'acquisitionBenefits', e.target.value)}
          placeholder="List key benefits (separate with commas)"
          rows="3"
        />
      </div>
      
      <div className="form-group full-width">
        <label>Target Company Description</label>
        <textarea
          value={formData.announcementDetails.targetCompanyDescription || ''}
          onChange={(e) => handleChange('announcementDetails', 'targetCompanyDescription', e.target.value)}
          placeholder="Brief description of the target company"
          rows="2"
        />
      </div>
      
      <div className="form-group">
        <label>Integration Timeline</label>
        <input
          type="text"
          value={formData.announcementDetails.integrationTimeline || ''}
          onChange={(e) => handleChange('announcementDetails', 'integrationTimeline', e.target.value)}
          placeholder="6-12 months"
        />
      </div>
    </div>
  );
  
  // Step 4: Quotes
  const Step4Quotes = () => (
    <div className="pr-step">
      <h2>Add Quotes</h2>
      <p>Include quotes from key stakeholders to make your announcement more compelling</p>
      
      <div className="quote-section">
        <h3>CEO/Leadership Quote</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={formData.quotes.ceoName}
              onChange={(e) => handleChange('quotes', 'ceoName', e.target.value)}
              placeholder="John Smith"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.quotes.ceoTitle}
              onChange={(e) => handleChange('quotes', 'ceoTitle', e.target.value)}
              placeholder="CEO and Founder"
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Quote *</label>
          <textarea
            value={formData.quotes.ceoQuote}
            onChange={(e) => handleChange('quotes', 'ceoQuote', e.target.value)}
            placeholder="Enter a compelling quote about this announcement..."
            rows="4"
            required
          />
          <small>Tip: Make it personal, forward-looking, and specific to this announcement</small>
        </div>
      </div>
      
      {/* Additional quotes based on announcement type */}
      {formData.announcementType === 'funding' && (
        <div className="quote-section">
          <h3>Investor Quote (Optional)</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Investor Name</label>
              <input
                type="text"
                value={formData.quotes.investorName || ''}
                onChange={(e) => handleChange('quotes', 'investorName', e.target.value)}
                placeholder="Partner Name"
              />
            </div>
            
            <div className="form-group">
              <label>Investor Title</label>
              <input
                type="text"
                value={formData.quotes.investorTitle || ''}
                onChange={(e) => handleChange('quotes', 'investorTitle', e.target.value)}
                placeholder="Managing Partner"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Investor Quote</label>
            <textarea
              value={formData.quotes.investorQuote || ''}
              onChange={(e) => handleChange('quotes', 'investorQuote', e.target.value)}
              placeholder="Quote from the lead investor..."
              rows="3"
            />
          </div>
        </div>
      )}
      
      {formData.announcementType === 'executive_hire' && (
        <div className="quote-section">
          <h3>New Executive Quote (Optional)</h3>
          <div className="form-group">
            <label>Executive Quote</label>
            <textarea
              value={formData.quotes.executiveQuote || ''}
              onChange={(e) => handleChange('quotes', 'executiveQuote', e.target.value)}
              placeholder="Quote from the new executive..."
              rows="3"
            />
          </div>
        </div>
      )}
      
      {(formData.announcementType === 'product_launch' || formData.audienceType === 'b2c') && (
        <div className="quote-section">
          <h3>Customer Quote (Optional)</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Customer Name</label>
              <input
                type="text"
                value={formData.quotes.customerName || ''}
                onChange={(e) => handleChange('quotes', 'customerName', e.target.value)}
                placeholder="Customer Name"
              />
            </div>
            
            <div className="form-group">
              <label>Customer Title</label>
              <input
                type="text"
                value={formData.quotes.customerTitle || ''}
                onChange={(e) => handleChange('quotes', 'customerTitle', e.target.value)}
                placeholder="Customer Title or 'Customer'"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Customer Quote</label>
            <textarea
              value={formData.quotes.customerQuote || ''}
              onChange={(e) => handleChange('quotes', 'customerQuote', e.target.value)}
              placeholder="Quote from a happy customer..."
              rows="3"
            />
          </div>
        </div>
      )}
      
      <div className="step-buttons">
        <button className="btn btn-outline" onClick={prevStep}>
          Back
        </button>
        <button 
          className="btn btn-primary"
          onClick={nextStep}
          disabled={!formData.quotes.ceoName || !formData.quotes.ceoTitle || !formData.quotes.ceoQuote}
        >
          Next: Additional Info
        </button>
      </div>
    </div>
  );
  
  // Step 5: Additional Information
  const Step5AdditionalInfo = () => (
    <div className="pr-step">
      <h2>Additional Information</h2>
      <p>Add any extra details to enhance your press release</p>
      
      <div className="form-group">
        <label>Background Information</label>
        <textarea
          value={formData.additionalInfo.backgroundInfo || ''}
          onChange={(e) => handleChange('additionalInfo', 'backgroundInfo', e.target.value)}
          placeholder="Any relevant background context or industry information..."
          rows="3"
        />
      </div>
      
      <div className="form-group">
        <label>Future Plans</label>
        <textarea
          value={formData.additionalInfo.futurePlans || ''}
          onChange={(e) => handleChange('additionalInfo', 'futurePlans', e.target.value)}
          placeholder="What's next for the company? Future roadmap or plans..."
          rows="3"
        />
      </div>
      
      <div className="form-group">
        <label>Timeline/Next Steps</label>
        <input
          type="text"
          value={formData.additionalInfo.timeline || ''}
          onChange={(e) => handleChange('additionalInfo', 'timeline', e.target.value)}
          placeholder="When will this take effect? What are the next milestones?"
        />
      </div>
      
      <div className="step-buttons">
        <button className="btn btn-outline" onClick={prevStep}>
          Back
        </button>
        <button 
          className="btn btn-primary"
          onClick={generatePR}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Press Release'}
        </button>
      </div>
    </div>
  );
  
  // Step 6: Preview
  const Step6Preview = () => (
    <div className="pr-step">
      <h2>Your Generated Press Release</h2>
      <p>Review your press release and make any adjustments</p>
      
      {generatedPR && (
        <PRPreview 
          prData={generatedPR}
          onEdit={() => setStep(5)}
          onUse={handleUseGenerated}
        />
      )}
      
      <div className="step-buttons">
        <button className="btn btn-outline" onClick={() => setStep(5)}>
          Edit Details
        </button>
        <button className="btn btn-success" onClick={handleUseGenerated}>
          Use This Press Release
        </button>
      </div>
    </div>
  );
  
  return (
    <div className="pr-generator">
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="pr-progress">
        {[1, 2, 3, 4, 5, 6].map(stepNum => (
          <div 
            key={stepNum}
            className={`progress-step ${step >= stepNum ? 'active' : ''} ${step === stepNum ? 'current' : ''}`}
          >
            {stepNum}
          </div>
        ))}
      </div>
      
      <div className="pr-form">
        {renderStep()}
      </div>
    </div>
  );
};

export default PRGenerator;
