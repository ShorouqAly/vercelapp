import React, { useState, useEffect } from 'react';
import { X, TrendingUp, DollarSign, Target, Users, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';


const ArticleAmplifier = ({ article, mveData, onClose }) => {
  const [activeTab, setActiveTab] = useState('setup');
  const [loading, setLoading] = useState(false);
  const [campaignData, setCampaignData] = useState({
    name: `Amplify: ${article.title}`,
    articleData: {
      headline: article.title,
      url: article.url,
      summary: article.summary || article.description,
      featuredImage: article.featuredImage || article.image
    },
    platforms: ['meta'],
    budget: {
      total: 350, // $50/day * 7 days
      daily: 50,
      duration: 7
    },
    targeting: {
      meta: {
        countries: ['US'],
        ageMin: 25,
        ageMax: 65,
        interests: []
      }
    }
  });
  const [interests, setInterests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [campaignResult, setCampaignResult] = useState(null);
  const [error, setError] = useState(null);

  // Search for interests
  const searchInterests = async (query) => {
    if (!query || query.length < 2) return;
    
    try {
      const response = await axios.post(`/api/amplification/targeting/interests/search?q=${query}`, {
        headers: {
          'user-id': window.currentUser?.id || 'demo-user' // Replace with your auth
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.interests || []);
      }
    } catch (err) {
      console.error('Interest search failed:', err);
    }
  };

  // Handle interest search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      searchInterests(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Add interest to targeting
  const addInterest = (interest) => {
    if (!campaignData.targeting.meta.interests.find(i => i.id === interest.id)) {
      setCampaignData(prev => ({
        ...prev,
        targeting: {
          ...prev.targeting,
          meta: {
            ...prev.targeting.meta,
            interests: [...prev.targeting.meta.interests, interest]
          }
        }
      }));
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  // Remove interest
  const removeInterest = (interestId) => {
    setCampaignData(prev => ({
      ...prev,
      targeting: {
        ...prev.targeting,
        meta: {
          ...prev.targeting.meta,
          interests: prev.targeting.meta.interests.filter(i => i.id !== interestId)
        }
      }
    }));
  };

  // Update budget
  const updateBudget = (field, value) => {
    setCampaignData(prev => {
      const newBudget = { ...prev.budget, [field]: value };
      
      // Recalculate total if daily or duration changes
      if (field === 'daily' || field === 'duration') {
        newBudget.total = newBudget.daily * newBudget.duration;
      }
      
      return { ...prev, budget: newBudget };
    });
  };

  // Launch campaign
  const launchCampaign = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/amplification/campaigns/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': window.currentUser?.id || 'demo-user' // Replace with your auth
        },
        body: JSON.stringify({
          ...campaignData,
          articleId: article.id,
          mveData: mveData // Include MVE data if available
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setCampaignResult(result);
        setActiveTab('success');
      } else {
        setError(result.error || 'Campaign creation failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Campaign launch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 w-full">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Amplify Your Article
              </h2>
              <p className="mt-2 opacity-90">{article.headline}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* MVE Score Display */}
          {mveData && (
            <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-sm opacity-90">Media Value Equivalent</div>
              <div className="text-2xl font-bold">${mveData.totalValue?.toLocaleString() || '0'}</div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {['setup', 'review', campaignResult && 'success'].filter(Boolean).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-red-700">{error}</div>
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="space-y-6">
              {/* Platform Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Select Platforms</h3>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 p-4 border-2 border-blue-500 bg-blue-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={campaignData.platforms.includes('meta')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCampaignData(prev => ({
                            ...prev,
                            platforms: [...prev.platforms, 'meta']
                          }));
                        }
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="font-medium">Facebook & Instagram</span>
                  </label>
                  
                  <label className="flex items-center gap-2 p-4 border-2 border-gray-300 bg-gray-50 rounded-lg cursor-not-allowed opacity-50">
                    <input
                      type="checkbox"
                      disabled
                      className="w-4 h-4"
                    />
                    <span className="font-medium">LinkedIn (Coming Soon)</span>
                  </label>
                  
                  <label className="flex items-center gap-2 p-4 border-2 border-gray-300 bg-gray-50 rounded-lg cursor-not-allowed opacity-50">
                    <input
                      type="checkbox"
                      disabled
                      className="w-4 h-4"
                    />
                    <span className="font-medium">Twitter/X (Coming Soon)</span>
                  </label>
                </div>
              </div>

              {/* Budget Configuration */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Budget & Duration
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Budget
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={campaignData.budget.daily}
                        onChange={(e) => updateBudget('daily', parseInt(e.target.value) || 0)}
                        min="10"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum $10/day</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={campaignData.budget.duration}
                        onChange={(e) => updateBudget('duration', parseInt(e.target.value) || 1)}
                        min="1"
                        max="30"
                        className="w-full pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">days</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Budget
                    </label>
                    <div className="bg-gray-100 px-3 py-2 rounded-lg font-semibold text-lg">
                      ${campaignData.budget.total.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Targeting */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Audience Targeting
                </h3>
                
                {/* Age Range */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={campaignData.targeting.meta.ageMin}
                      onChange={(e) => setCampaignData(prev => ({
                        ...prev,
                        targeting: {
                          ...prev.targeting,
                          meta: {
                            ...prev.targeting.meta,
                            ageMin: parseInt(e.target.value) || 18
                          }
                        }
                      }))}
                      min="18"
                      max="65"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      value={campaignData.targeting.meta.ageMax}
                      onChange={(e) => setCampaignData(prev => ({
                        ...prev,
                        targeting: {
                          ...prev.targeting,
                          meta: {
                            ...prev.targeting.meta,
                            ageMax: parseInt(e.target.value) || 65
                          }
                        }
                      }))}
                      min="18"
                      max="65"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for interests (e.g., technology, business, health)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    
                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map((interest) => (
                          <button
                            key={interest.id}
                            onClick={() => addInterest(interest)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium">{interest.name}</div>
                            {interest.audience_size_lower_bound && (
                              <div className="text-sm text-gray-500">
                                Audience: {(interest.audience_size_lower_bound / 1000000).toFixed(1)}M - {(interest.audience_size_upper_bound / 1000000).toFixed(1)}M
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Selected Interests */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {campaignData.targeting.meta.interests.map((interest) => (
                      <div
                        key={interest.id}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        <span>{interest.name}</span>
                        <button
                          onClick={() => removeInterest(interest.id)}
                          className="hover:text-blue-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setActiveTab('review')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue to Review
                </button>
              </div>
            </div>
          )}

          {activeTab === 'review' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Review Your Campaign</h3>
              
              {/* Article Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Article</h4>
                <div className="flex gap-4">
                  {article.featuredImage && (
                    <img
                      src={article.featuredImage}
                      alt={article.headline}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h5 className="font-semibold">{article.headline}</h5>
                    <p className="text-sm text-gray-600 mt-1">{article.summary || article.description}</p>
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                      View Article →
                    </a>
                  </div>
                </div>
              </div>

              {/* Campaign Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Platforms</h4>
                  <ul className="space-y-1">
                    {campaignData.platforms.includes('meta') && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Facebook & Instagram
                      </li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Budget</h4>
                  <ul className="space-y-1 text-sm">
                    <li>Daily: ${campaignData.budget.daily}</li>
                    <li>Duration: {campaignData.budget.duration} days</li>
                    <li className="font-semibold">Total: ${campaignData.budget.total}</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Targeting</h4>
                  <ul className="space-y-1 text-sm">
                    <li>Age: {campaignData.targeting.meta.ageMin}-{campaignData.targeting.meta.ageMax}</li>
                    <li>Location: {campaignData.targeting.meta.countries.join(', ')}</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Interests</h4>
                  {campaignData.targeting.meta.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {campaignData.targeting.meta.interests.map(i => (
                        <span key={i.id} className="text-sm bg-gray-200 px-2 py-1 rounded">
                          {i.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No specific interests selected</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <button
                  onClick={() => setActiveTab('setup')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Setup
                </button>
                <button
                  onClick={launchCampaign}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Launching...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      Launch Campaign
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'success' && campaignResult && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h3 className="text-2xl font-semibold mb-2">Campaign Launched Successfully!</h3>
              <p className="text-gray-600 mb-6">Your article is now being amplified across social media.</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <p className="text-sm text-gray-600 mb-1">Campaign ID</p>
                <p className="font-mono text-sm">{campaignResult.campaignId}</p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.open('/dashboard/campaigns', '_blank')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Campaign Dashboard
                </button>
                
                <button
                  onClick={onClose}
                  className="block mx-auto text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleAmplifier;