import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './Pricing.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const SubscriptionPlans = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [currentSubscriptions, setCurrentSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansResponse, subscriptionsResponse] = await Promise.all([
          axios.get('/api/pricing/subscriptions'),
          axios.get('/api/subscriptions/current')
        ]);
        
        setPlans(plansResponse.data);
        setCurrentSubscriptions(subscriptionsResponse.data);
      } catch (err) {
        setError('Failed to load subscription information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const isSubscribed = (planId) => {
    return currentSubscriptions.some(sub => sub.planId._id === planId && sub.status === 'active');
  };
  
  if (loading) return <div className="loading">Loading subscription plans...</div>;
  if (error) return <div className="error-state">{error}</div>;
  
  return (
    <div className="subscription-plans">
      <div className="plans-header">
        <h2>Premium Features</h2>
        <p>Unlock advanced capabilities to maximize your PR success</p>
      </div>
      
      <div className="plans-grid">
        {plans.map(plan => (
          <div key={plan._id} className={`plan-card ${isSubscribed(plan._id) ? 'subscribed' : ''}`}>
            <h3>{plan.name}</h3>
            <div className="plan-price">
              <span className="currency">$</span>
              <span className="amount">{(plan.price / 100)}</span>
              <span className="interval">/month</span>
            </div>
            
            <p className="plan-description">{plan.description}</p>
            
            <ul className="plan-features">
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            
            <div className="plan-limits">
              {plan.limits.profileViews > 0 && (
                <div className="limit-item">
                  <span className="limit-label">Profile Views:</span>
                  <span className="limit-value">{plan.limits.profileViews.toLocaleString()}/month</span>
                </div>
              )}
              {plan.limits.analyticsRetention > 0 && (
                <div className="limit-item">
                  <span className="limit-label">Analytics Retention:</span>
                  <span className="limit-value">{plan.limits.analyticsRetention} days</span>
                </div>
              )}
              {plan.limits.aiCredits > 0 && (
                <div className="limit-item">
                  <span className="limit-label">AI Credits:</span>
                  <span className="limit-value">{plan.limits.aiCredits}/month</span>
                </div>
              )}
            </div>
            
            {isSubscribed(plan._id) ? (
              <button className="btn btn-success" disabled>
                ✓ Subscribed
              </button>
            ) : (
              <Elements stripe={stripePromise}>
                <SubscribeButton plan={plan} onSuccess={() => window.location.reload()} />
              </Elements>
            )}
          </div>
        ))}
      </div>
      
      {currentSubscriptions.length > 0 && (
        <div className="current-subscriptions">
          <h3>Your Active Subscriptions</h3>
          <div className="subscription-list">
            {currentSubscriptions.map(sub => (
              <div key={sub._id} className="subscription-item">
                <h4>{sub.planId.name}</h4>
                <div className="subscription-meta">
                  <span className="status">Status: {sub.status}</span>
                  <span className="renewal">
                    Renews: {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="usage-stats">
                  <h5>This Month's Usage</h5>
                  <div className="usage-grid">
                    {sub.usage.profileViews > 0 && (
                      <div className="usage-item">
                        <span className="usage-label">Profile Views:</span>
                        <span className="usage-value">{sub.usage.profileViews}</span>
                      </div>
                    )}
                    {sub.usage.analyticsQueries > 0 && (
                      <div className="usage-item">
                        <span className="usage-label">Analytics Queries:</span>
                        <span className="usage-value">{sub.usage.analyticsQueries}</span>
                      </div>
                    )}
                    {sub.usage.aiCreditsUsed > 0 && (
                      <div className="usage-item">
                        <span className="usage-label">AI Credits Used:</span>
                        <span className="usage-value">{sub.usage.aiCreditsUsed}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SubscribeButton = ({ plan, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setLoading(true);
    setError('');
    
    try {
      const cardElement = elements.getElement(CardElement);
      
      // Create payment method
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
      
      if (pmError) {
        setError(pmError.message);
        setLoading(false);
        return;
      }
      
      // Subscribe via API
      const response = await axios.post('/api/subscriptions/subscribe', {
        planId: plan._id,
        paymentMethodId: paymentMethod.id
      });
      
      if (response.data.success) {
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Subscription failed');
    } finally {
      setLoading(false);
    }
  };
  
  if (!showForm) {
    return (
      <button 
        className="btn btn-primary"
        onClick={() => setShowForm(true)}
      >
        Subscribe Now
      </button>
    );
  }
  
  return (
    <form onSubmit={handleSubscribe} className="subscribe-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="card-element-container">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
              },
            },
          }}
        />
      </div>
      
      <div className="subscribe-buttons">
        <button 
          type="button" 
          className="btn btn-outline"
          onClick={() => setShowForm(false)}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading || !stripe}
        >
          {loading ? 'Processing...' : `Subscribe for $${(plan.price / 100)}/month`}
        </button>
      </div>
    </form>
  );
};

export default SubscriptionPlans;
