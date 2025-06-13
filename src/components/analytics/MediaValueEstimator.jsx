import React, { useState, useEffect } from 'react';
import { 
  Calculator, DollarSign, TrendingUp, Target, Star, Zap,
  BarChart3, PieChart, Award, ExternalLink, Download, Share2,
  CheckCircle, AlertCircle, Info, Crown, Lock, Search,
  Globe, Users, Calendar, Briefcase, ThumbsUp, Eye,
  FileText, Video, Headphones, Image, Newspaper, Radio, Tv,
  RefreshCw, Database, Lightbulb, Settings
} from 'lucide-react';

const MediaValueEstimator = () => {
  const [formData, setFormData] = useState({
    // Publication info
    publicationDomain: '',
    publicationTier: 'tier-3',
    mediaType: 'digital',
    
    // UVM integration settings
    useUVMData: true,
    autoCalculateReach: true,
    
    // Content details  
    contentType: 'standard_article',
    wordCount: 500,
    placement: 'standard_article',
    timing: 'evergreen',
    exclusivity: 'standard',
    
    // Manual overrides (shown only when UVM not available)
    estimatedReach: '',
    actualImpressions: '',
    
    // SEO factors
    domainAuthority: '',
    backlink: true,
    estimatedReferralTraffic: '',
    
    // Industry context
    industry: 'default',
    targetAudience: 'general',
    sentiment: 'neutral',
    
    // Custom overrides
    customCPM: '',
    customCPC: '',
    customContentCost: '',
    
    // Additional factors
    socialAmplification: true,
    brandMention: true,
    executiveQuotes: false,
    productMention: false,
    
    // Campaign context
    campaignCost: ''
  });

  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [benchmarks, setBenchmarks] = useState(null);
  const [userUsage, setUserUsage] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedCalculations, setSavedCalculations] = useState([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // NEW: UVM integration state
  const [publicationData, setPublicationData] = useState(null);
  const [uvmStatus, setUvmStatus] = useState(null);
  const [loadingPublication, setLoadingPublication] = useState(false);
  const [reachEstimates, setReachEstimates] = useState(null);
  const [showUVMInsights, setShowUVMInsights] = useState(true);

  // Load benchmarks and user data on mount
  useEffect(() => {
    loadBenchmarks();
    loadUserUsage();
    loadSavedCalculations();
  }, []);

  // Load publication data when domain changes
  useEffect(() => {
    if (formData.publicationDomain && formData.publicationDomain.length > 3) {
      const timeoutId = setTimeout(() => {
        loadPublicationData(formData.publicationDomain);
      }, 1000); // Debounce for 1 second
      
      return () => clearTimeout(timeoutId);
    } else {
      setPublicationData(null);
      setUvmStatus(null);
      setReachEstimates(null);
    }
  }, [formData.publicationDomain]);

  // Update reach estimates when placement or content type changes
  useEffect(() => {
    if (publicationData && publicationData.found && formData.useUVMData) {
      updateReachEstimates();
    }
  }, [formData.placement, formData.contentType, publicationData]);

  const loadBenchmarks = async () => {
    try {
      const response = await fetch('/api/mve/benchmarks');
      const data = await response.json();
      setBenchmarks(data);
    } catch (error) {
      console.error('Failed to load benchmarks:', error);
    }
  };

  const loadUserUsage = async () => {
    try {
      const response = await fetch('/api/mve/usage');
      const data = await response.json();
      setUserUsage(data.user);
    } catch (error) {
      console.error('Failed to load usage:', error);
    }
  };

  const loadSavedCalculations = () => {
    const saved = localStorage.getItem('mve_calculations');
    if (saved) {
      setSavedCalculations(JSON.parse(saved));
    }
  };

  // NEW: Load publication data from UVM
  const loadPublicationData = async (domain) => {
    if (!domain || domain.length < 4) return;
    
    setLoadingPublication(true);
    try {
      const response = await fetch(`/api/mve/publication-data/${domain}`);
      const data = await response.json();
      
      setPublicationData(data);
      
      if (data.found && data.data) {
        // Auto-populate form with UVM data
        setFormData(prev => ({
          ...prev,
          publicationTier: data.data.publicationTier || prev.publicationTier,
          domainAuthority: data.data.domainAuthority || prev.domainAuthority
        }));
        
        // Set reach estimates
        setReachEstimates(data.data.reachEstimates);
      }
      
      // Get UVM status
      const statusResponse = await fetch(`/api/mve/uvm-status/${domain}`);
      const statusData = await statusResponse.json();
      setUvmStatus(statusData);
      
    } catch (error) {
      console.error('Failed to load publication data:', error);
      setPublicationData({ found: false, message: 'Failed to load publication data' });
    } finally {
      setLoadingPublication(false);
    }
  };

  // NEW: Update reach estimates based on current selection
  const updateReachEstimates = async () => {
    if (!formData.publicationDomain) return;
    
    try {
      const response = await fetch('/api/mve/reach-estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicationDomain: formData.publicationDomain,
          contentType: formData.contentType
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setReachEstimates(data.estimates);
      }
    } catch (error) {
      console.error('Failed to update reach estimates:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCalculate = async () => {
    // Check if user has reached limits
    if (userUsage && userUsage.plan === 'free' && userUsage.calculationsRemaining <= 0) {
      setShowUpgradeModal(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mve/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 429 && errorData.upgradeRequired) {
          setShowUpgradeModal(true);
          return;
        }
        
        throw new Error(errorData.error || 'Calculation failed');
      }

      const result = await response.json();
      setCalculation(result);
      
      // Save calculation
      const savedCalc = {
        id: Date.now(),
        formData: { ...formData },
        result: result,
        timestamp: new Date()
      };
      
      const newSaved = [savedCalc, ...savedCalculations.slice(0, 9)];
      setSavedCalculations(newSaved);
      localStorage.setItem('mve_calculations', JSON.stringify(newSaved));
      
      // Update usage
      setUserUsage(prev => ({
        ...prev,
        calculationsRemaining: result.usage.calculationsRemaining
      }));

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getEstimatedReach = () => {
    if (!formData.useUVMData || !reachEstimates || !reachEstimates[formData.placement]) {
      return null;
    }
    return reachEstimates[formData.placement].primaryImpressions;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Calculator className="w-10 h-10 text-green-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Media Value Estimator</h1>
              <div className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                UVM Enhanced
              </div>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Calculate comprehensive media value using real publication data and industry-standard methodologies
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200">
              {/* Form Header */}
              <div className="px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Coverage Details</h2>
                  
                  {/* Usage Indicator */}
                  {userUsage && userUsage.plan === 'free' && (
                    <div className="text-sm text-gray-600">
                      {userUsage.calculationsRemaining} calculations remaining today
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8">
                {/* Publication Information with UVM Integration */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Database className="w-5 h-5 mr-2 text-blue-600" />
                    Publication Information
                    {publicationData?.found && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        UVM Data Available
                      </span>
                    )}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Publication Domain
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={formData.publicationDomain}
                          onChange={(e) => handleInputChange('publicationDomain', e.target.value)}
                          placeholder="techcrunch.com"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                        {loadingPublication && (
                          <div className="px-4 py-2 flex items-center">
                            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Auto-loads publication data and calculates reach estimates
                      </p>
                    </div>

                    {/* UVM Status Display */}
                    {publicationData && (
                      <div className="md:col-span-2">
                        <div className={`p-4 rounded-lg border ${
                          publicationData.found 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-yellow-200 bg-yellow-50'
                        }`}>
                          <div className="flex items-center">
                            {publicationData.found ? (
                              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                            )}
                            <div>
                              <div className={`font-medium ${
                                publicationData.found ? 'text-green-900' : 'text-yellow-900'
                              }`}>
                                {publicationData.found ? 'Publication Data Found' : 'No UVM Data Available'}
                              </div>
                              <div className={`text-sm ${
                                publicationData.found ? 'text-green-700' : 'text-yellow-700'
                              }`}>
                                {publicationData.message}
                              </div>
                              
                              {/* Show UVM data summary */}
                              {publicationData.found && publicationData.data && (
                                <div className="mt-2 text-sm text-green-700">
                                  <div>Monthly Visitors: {publicationData.data.monthlyVisitors?.toLocaleString() || 'Unknown'}</div>
                                  <div>Domain Authority: {publicationData.data.domainAuthority || 'Unknown'}</div>
                                  <div>Tier: {publicationData.data.publicationTier}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Publication Tier
                      </label>
                      <select
                        value={formData.publicationTier}
                        onChange={(e) => handleInputChange('publicationTier', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        disabled={publicationData?.found && formData.useUVMData}
                      >
                        {benchmarks?.publicationTiers.map(tier => (
                          <option key={tier.value} value={tier.value}>
                            {tier.label}
                          </option>
                        ))}
                      </select>
                      {publicationData?.found && formData.useUVMData && (
                        <p className="text-xs text-blue-600 mt-1">Auto-detected from UVM data</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Media Type
                      </label>
                      <select
                        value={formData.mediaType}
                        onChange={(e) => handleInputChange('mediaType', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        {benchmarks?.mediaTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Content & Placement Details */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-purple-600" />
                    Content & Placement
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content Type
                      </label>
                      <select
                        value={formData.contentType}
                        onChange={(e) => handleInputChange('contentType', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        {benchmarks?.contentTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Placement Type
                      </label>
                      <select
                        value={formData.placement}
                        onChange={(e) => handleInputChange('placement', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        {benchmarks?.placementTypes.map(placement => (
                          <option key={placement.value} value={placement.value}>
                            {placement.label} ({placement.engagementRate} engagement)
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">{
                        benchmarks?.placementTypes.find(p => p.value === formData.placement)?.description
                      }</p>
                    </div>

                    {/* Estimated Reach Display */}
                    {formData.useUVMData && getEstimatedReach() && (
                      <div className="md:col-span-2">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <Eye className="w-5 h-5 text-blue-600 mr-2" />
                            <div>
                              <div className="font-medium text-blue-900">
                                Estimated Reach: {getEstimatedReach().toLocaleString()} people
                              </div>
                              <div className="text-sm text-blue-700">
                                Calculated from {publicationData?.data?.monthlyVisitors?.toLocaleString()} monthly visitors 
                                × {benchmarks?.placementTypes.find(p => p.value === formData.placement)?.engagementRate} engagement rate
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Manual Reach Input (only shown when UVM not available) */}
                    {(!formData.useUVMData || !publicationData?.found) && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estimated Reach
                          </label>
                          <input
                            type="number"
                            value={formData.estimatedReach}
                            onChange={(e) => handleInputChange('estimatedReach', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="50000"
                          />
                          <p className="text-xs text-yellow-600 mt-1">
                            Manual estimate required - UVM data not available
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Actual Impressions (if known)
                          </label>
                          <input
                            type="number"
                            value={formData.actualImpressions}
                            onChange={(e) => handleInputChange('actualImpressions', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="Optional"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Word Count
                      </label>
                      <input
                        type="number"
                        value={formData.wordCount}
                        onChange={(e) => handleInputChange('wordCount', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry
                      </label>
                      <select
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        {benchmarks?.industries.map(industry => (
                          <option key={industry.value} value={industry.value}>
                            {industry.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Coverage Quality */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-600" />
                    Coverage Quality
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sentiment
                      </label>
                      <div className="flex space-x-2">
                        {[
                          { value: 'positive', label: 'Positive', icon: '😊', color: 'green' },
                          { value: 'neutral', label: 'Neutral', icon: '😐', color: 'gray' },
                          { value: 'negative', label: 'Negative', icon: '😞', color: 'red' }
                        ].map(sentiment => (
                          <label
                            key={sentiment.value}
                            className={`flex-1 flex items-center justify-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                              formData.sentiment === sentiment.value 
                                ? `border-${sentiment.color}-500 bg-${sentiment.color}-50` 
                                : 'border-gray-200'
                            }`}
                          >
                            <input
                              type="radio"
                              name="sentiment"
                              value={sentiment.value}
                              checked={formData.sentiment === sentiment.value}
                              onChange={(e) => handleInputChange('sentiment', e.target.value)}
                              className="sr-only"
                            />
                            <span className="text-lg mr-1">{sentiment.icon}</span>
                            <span className="text-sm">{sentiment.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timing
                      </label>
                      <select
                        value={formData.timing}
                        onChange={(e) => handleInputChange('timing', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="breaking">Breaking News (1.8x)</option>
                        <option value="trending">Trending Topic (1.4x)</option>
                        <option value="evergreen">Evergreen Content (1x)</option>
                        <option value="outdated">Outdated News (0.6x)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exclusivity
                      </label>
                      <select
                        value={formData.exclusivity}
                        onChange={(e) => handleInputChange('exclusivity', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="exclusive">Exclusive (2.5x)</option>
                        <option value="firstToReport">First to Report (2x)</option>
                        <option value="embargo">Embargo Release (1.5x)</option>
                        <option value="standard">Standard Coverage (1x)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Features */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-orange-600" />
                    Additional Features
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { key: 'backlink', label: 'Includes Backlink', icon: ExternalLink },
                      { key: 'socialAmplification', label: 'Social Amplification', icon: Share2 },
                      { key: 'brandMention', label: 'Brand Mention', icon: Award },
                      { key: 'executiveQuotes', label: 'Executive Quotes', icon: Users },
                      { key: 'productMention', label: 'Product Mention', icon: Briefcase }
                    ].map(feature => {
                      const Icon = feature.icon;
                      return (
                        <label
                          key={feature.key}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                            formData[feature.key] 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData[feature.key]}
                            onChange={(e) => handleInputChange(feature.key, e.target.checked)}
                            className="sr-only"
                          />
                          <Icon className="w-4 h-4 mr-2 text-gray-600" />
                          <span className="text-sm">{feature.label}</span>
                          {formData[feature.key] && (
                            <CheckCircle className="w-4 h-4 ml-auto text-green-500" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="mb-8">
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                  </button>
                  
                  {showAdvanced && (
                    <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* UVM Integration Toggle */}
                        <div className="md:col-span-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.useUVMData}
                              onChange={(e) => handleInputChange('useUVMData', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              Use UVM Analytics Integration
                            </span>
                          </label>
                          <p className="text-xs text-gray-500 mt-1 ml-6">
                            Automatically calculate reach from real publication data
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Custom CPM Override
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.customCPM}
                            onChange={(e) => handleInputChange('customCPM', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="Leave blank for benchmark"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Campaign Cost (for ROI)
                          </label>
                          <input
                            type="number"
                            value={formData.campaignCost}
                            onChange={(e) => handleInputChange('campaignCost', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-700">{error}</span>
                  </div>
                )}

                {/* Calculate Button */}
                <div className="flex space-x-4">
                  <button
                    onClick={handleCalculate}
                    disabled={loading || (userUsage?.plan === 'free' && userUsage?.calculationsRemaining <= 0)}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4 mr-2" />
                        Calculate Media Value
                        {publicationData?.found && (
                          <span className="ml-2 px-2 py-1 bg-green-700 text-xs rounded-full">
                            UVM Enhanced
                          </span>
                        )}
                      </>
                    )}
                  </button>
                  
                  {calculation && (
                    <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Results Section */}
            {calculation && (
              <EnhancedMediaValueResults 
                calculation={calculation} 
                formData={formData}
                userPlan={userUsage?.plan}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* UVM Status Card */}
            {uvmStatus && (
              <div className={`rounded-lg border p-6 ${
                uvmStatus.uvmAvailable 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-yellow-200 bg-yellow-50'
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  uvmStatus.uvmAvailable ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  {uvmStatus.uvmAvailable ? 'UVM Data Available' : 'UVM Analysis Needed'}
                </h3>
                <p className={`text-sm mb-3 ${
                  uvmStatus.uvmAvailable ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {uvmStatus.recommendation}
                </p>
                {uvmStatus.uvmAvailable && uvmStatus.integrationBenefits && (
                  <ul className="text-sm text-green-700 space-y-1">
                    {uvmStatus.integrationBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                )}
                {!uvmStatus.uvmAvailable && (
                  <a
                    href={`/analytics/uvm?domain=${formData.publicationDomain}`}
                    target="_blank"
                    className="inline-flex items-center text-sm font-medium text-yellow-700 hover:text-yellow-800"
                  >
                    Run UVM Analysis
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>
            )}

            {/* Upgrade CTA for free users */}
            {userUsage?.plan === 'free' && (
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
                <div className="flex items-center mb-3">
                  <Crown className="w-6 h-6 mr-2" />
                  <h3 className="font-semibold">Unlock Full MVE</h3>
                </div>
                
                <ul className="text-sm space-y-1 mb-4 opacity-90">
                  <li>• Unlimited calculations</li>
                  <li>• PDF export reports</li>
                  <li>• UVM auto-integration</li>
                  <li>• Batch processing</li>
                  <li>• Historical tracking</li>
                </ul>

                <button 
                  onClick={() => setShowUpgradeModal(true)}
                  className="w-full px-4 py-2 bg-white text-green-600 rounded-lg font-medium hover:bg-gray-100"
                >
                  Upgrade to Pro - $49/month
                </button>
              </div>
            )}

            {/* Features List */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Enhanced Features</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <Database className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>UVM Integration:</strong> Real publication data</span>
                </li>
                <li className="flex items-start">
                  <Target className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Smart Reach:</strong> Engagement rate modeling</span>
                </li>
                <li className="flex items-start">
                  <TrendingUp className="w-4 h-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Authority Boost:</strong> DA-based adjustments</span>
                </li>
                <li className="flex items-start">
                  <Lightbulb className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Smart Insights:</strong> Data-driven recommendations</span>
                </li>
              </ul>
            </div>

            {/* Methodology */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Enhanced Methodology</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>Our enhanced MVE uses real publication data:</p>
                <ul className="space-y-1 ml-4">
                  <li>• UVM analytics for traffic data</li>
                  <li>• Engagement rate modeling</li>
                  <li>• Authority-based adjustments</li>
                  <li>• Industry-standard benchmarks</li>
                  <li>• Multi-source validation</li>
                </ul>
                <p className="text-xs text-gray-500 pt-2">
                  Results are significantly more accurate when UVM data is available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal 
          onClose={() => setShowUpgradeModal(false)}
          currentPlan={userUsage?.plan}
        />
      )}
    </div>
  );
};

// Enhanced Results Component
const EnhancedMediaValueResults = ({ calculation, formData, userPlan }) => {
  const { breakdown, insights, uvmInsights, benchmarkComparison, actionableRecommendations, dataEnhancement } = calculation;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="mt-8 bg-white rounded-lg border border-gray-200">
      <div className="px-8 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Media Value Analysis</h2>
            <p className="text-gray-600">
              {dataEnhancement?.uvmIntegrated ? 'UVM-Enhanced' : 'Standard'} comprehensive valuation
            </p>
          </div>
          {dataEnhancement?.uvmIntegrated && (
            <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              UVM Enhanced
            </div>
          )}
        </div>
      </div>

      <div className="p-8">
        {/* Total Value with confidence indicator */}
        <div className="text-center mb-8 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
          <div className="text-4xl font-bold text-green-600 mb-2">
            {formatCurrency(calculation.totalValue)}
          </div>
          <div className="text-lg text-gray-700">Total Estimated Media Value</div>
          <div className="text-sm text-gray-500 mt-1 flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              calculation.calculationDetails.confidence > 0.8 ? 'bg-green-500' :
              calculation.calculationDetails.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            {Math.round(calculation.calculationDetails.confidence * 100)}% confidence
            {dataEnhancement?.uvmIntegrated && ' (UVM Enhanced)'}
          </div>
        </div>

        {/* UVM-Specific Insights */}
        {uvmInsights && uvmInsights.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-blue-600" />
              UVM Analytics Insights
            </h3>
            <div className="space-y-3">
              {uvmInsights.map((insight, index) => (
                <div key={index} className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-blue-900">{insight.title}</div>
                    <div className="text-blue-700">{insight.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Value Breakdown */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Value Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(breakdown)
              .filter(([key]) => !['totalEstimatedValue', 'sentimentMultiplier'].includes(key))
              .map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(value)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {((value / calculation.totalValue) * 100).toFixed(1)}% of total
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Data Enhancement Info */}
        {dataEnhancement && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Calculation Enhancement</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-900">Method</div>
                  <div className="text-gray-600">{dataEnhancement.calculationMethod}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Confidence</div>
                  <div className="text-gray-600">{Math.round(dataEnhancement.dataConfidence * 100)}%</div>
                </div>
              </div>
              <div className="mt-3">
                <div className="font-medium text-gray-900 text-sm mb-2">Enhanced Features Used:</div>
                <div className="flex flex-wrap gap-2">
                  {dataEnhancement.enhancedFeatures.map((feature, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rest of existing results components... */}
        {/* (Keep all existing insights, benchmark comparison, recommendations) */}
      </div>
    </div>
  );
};

// Upgrade Modal (same as before)
const UpgradeModal = ({ onClose, currentPlan }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="text-center">
          <Crown className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Upgrade to MVE Pro
          </h3>
          <p className="text-gray-600 mb-6">
            Get unlimited calculations with UVM enhancement
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="text-left">
              <h4 className="font-medium text-green-900 mb-2">Pro Features Include:</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>✓ Unlimited media value calculations</li>
                <li>✓ Full UVM analytics integration</li>
                <li>✓ PDF export reports</li>
                <li>✓ Batch calculation processing</li>
                <li>✓ Historical calculation tracking</li>
                <li>✓ Priority customer support</li>
              </ul>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-gray-900">$49</div>
            <div className="text-sm text-gray-600">per month</div>
          </div>

          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Start 7-Day Free Trial
            </button>
            <button 
              onClick={onClose}
              className="w-full px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaValueEstimator;