
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Pricing.css';

const PricingSelector = ({ onSelectPricing, selectedTier, announcementId }) => {
  const { user } = useAuth();
  const [pricingTiers, setPricingTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await axios.get('/api/pricing/announcements');
        setPricingTiers(response.data);
      } catch (err) {
        setError('Failed to load pricing options');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPricing();
  }, []);
  
  if (loading) return <div className="loading">Loading pricing options...</div>;
  if (error) return <div className="error-state">{error}</div>;
  
  return (
    <div className="pricing-selector">
      <h3>Choose Your Announcement Package</h3>
      <p>Select the package that best fits your announcement needs</p>
      
      <div className="pricing-tiers">
        {pricingTiers.map(tier => (
          <div 
            key={tier._id}
            className={`pricing-tier ${selectedTier === tier._id ? 'selected' : ''} ${tier.name === 'Professional' ? 'recommended' : ''}`}
            onClick={() => onSelectPricing(tier)}
          >
            {tier.name === 'Professional' && (
              <div className="recommended-badge">Most Popular</div>
            )}
            
            <h4>{tier.name}</h4>
            <div className="price">
              <span className="currency">$</span>
              <span className="amount">{(tier.price / 100).toLocaleString()}</span>
            </div>
            
            <div className="journalist-payout">
              <span className="payout-label">Journalist earns:</span>
              <span className="payout-amount">${(tier.journalistPayout / 100).toLocaleString()}</span>
              <span className="payout-percentage">({tier.payoutPercentage}%)</span>
            </div>
            
            <ul className="features-list">
              <li className={tier.features.maxJournalists ? 'included' : 'not-included'}>
                Up to {tier.features.maxJournalists} targeted journalists
              </li>
              <li className={tier.features.priorityPlacement ? 'included' : 'not-included'}>
                Priority placement in journalist feeds
              </li>
              <li className={tier.features.aiMatching ? 'included' : 'not-included'}>
                AI-powered journalist matching
              </li>
              <li className={tier.features.analyticsIncluded ? 'included' : 'not-included'}>
                Coverage analytics & reporting
              </li>
              <li className={tier.features.pressKitAccess ? 'included' : 'not-included'}>
                Press kit sharing capabilities
              </li>
              <li className={tier.features.guaranteedPickup ? 'included' : 'not-included'}>
                Guaranteed story pickup
              </li>
              <li className={tier.features.whiteGloveService ? 'included' : 'not-included'}>
                White-glove concierge service
              </li>
            </ul>
            
            <p className="tier-description">{tier.description}</p>
          </div>
        ))}
      </div>
      
      <div className="pricing-notes">
        <h4>How Revenue Sharing Works</h4>
        <ul>
          <li>💰 <strong>Journalists earn competitive rates</strong> - attracting top talent to your stories</li>
          <li>🔒 <strong>Escrow protection</strong> - funds held securely until story is published</li>
          <li>⚡ <strong>Fast payouts</strong> - journalists paid within 24 hours of publication</li>
          <li>📊 <strong>Quality guaranteed</strong> - revenue sharing incentivizes high-quality coverage</li>
        </ul>
      </div>
    </div>
  );
};

export default PricingSelector;
