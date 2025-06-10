
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Package, Star, Clock, MapPin, DollarSign, Users, TrendingUp, CheckCircle, AlertCircle, Camera, Video, ExternalLink, Filter, Search, Plus, Eye, Heart, MessageSquare, BarChart3 } from 'lucide-react';
import './ReviewMatchDashboard.css';
import axios from 'axios';


// Main ReviewMatch Marketplace Dashboard
const ReviewMatchDashboard = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState(userRole === 'company' ? 'my-products' : 'marketplace');
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeRequests: 0,
    completedReviews: 0,
    totalEarnings: 0
  });

  const tabs = userRole === 'company' ? [
    { id: 'my-products', label: 'My Products', icon: Package },
    { id: 'requests', label: 'Review Requests', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'create-product', label: 'Add Product', icon: Plus }
  ] : [
    { id: 'marketplace', label: 'Marketplace', icon: Package },
    { id: 'my-requests', label: 'My Requests', icon: Clock },
    { id: 'completed', label: 'Completed', icon: CheckCircle },
    { id: 'earnings', label: 'Earnings', icon: DollarSign }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'marketplace':
        return <ProductMarketplace />;
      case 'my-products':
        return <MyProductsList />;
      case 'create-product':
        return <ProductSubmissionForm />;
      case 'requests':
        return <ReviewRequestManager />;
      case 'my-requests':
        return <JournalistRequests />;
      case 'analytics':
        return <ReviewAnalytics />;
      case 'earnings':
        return <JournalistEarnings />;
      case 'completed':
        return <CompletedReviews />;
      default:
        return <ProductMarketplace />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ReviewMatch Marketplace</h1>
            <p className="text-gray-600">
              {userRole === 'company' 
                ? 'Connect your products with journalists for authentic reviews'
                : 'Discover products to review and build your portfolio'
              }
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalProducts}</div>
              <div className="text-xs text-gray-600">
                {userRole === 'company' ? 'Products' : 'Available'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.activeRequests}</div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.completedReviews}</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                ${(stats.totalEarnings / 100).toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">
                {userRole === 'company' ? 'Invested' : 'Earned'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

// Product Marketplace (Journalist View)
const ProductMarketplace = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    productType: '',
    minValue: '',
    maxValue: '',
    searchTerm: ''
  });
  const [loading, setLoading] = useState(true);

  const mockProducts = [
    {
      _id: '1',
      productInfo: {
        name: 'WirelessPro Earbuds',
        brand: 'AudioTech',
        category: 'electronics',
        description: 'Premium wireless earbuds with noise cancellation and 30-hour battery life.',
        msrp: 19900,
        features: ['Noise Cancellation', '30h Battery', 'Wireless Charging', 'IPX7 Waterproof']
      },
      media: {
        images: ['/api/placeholder/300/200']
      },
      campaign: {
        campaignTier: 'premium',
        maxReviewers: 15
      },
      reviewRequirements: {
        minWordCount: 800,
        reviewType: 'individual',
        coverageDeadline: 21
      },
      logistics: {
        productType: 'physical',
        shippingRequired: true,
        estimatedDeliveryDays: 5
      },
      analytics: {
        requests: 23,
        approved: 18
      },
      companyId: {
        name: 'AudioTech Inc.'
      }
    },
    {
      _id: '2',
      productInfo: {
        name: 'TaskMaster Pro',
        brand: 'ProductiveSoft',
        category: 'software',
        description: 'Advanced project management software with AI-powered insights.',
        msrp: 9900,
        features: ['AI Insights', 'Team Collaboration', 'Time Tracking', 'Custom Workflows']
      },
      media: {
        images: ['/api/placeholder/300/200']
      },
      campaign: {
        campaignTier: 'basic',
        maxReviewers: 10
      },
      reviewRequirements: {
        minWordCount: 600,
        reviewType: 'individual',
        coverageDeadline: 14
      },
      logistics: {
        productType: 'subscription',
        subscriptionLength: 30
      },
      analytics: {
        requests: 15,
        approved: 12
      },
      companyId: {
        name: 'ProductiveSoft'
      }
    }
  ];

  useEffect(() => {
    // Replace with actual API call
    // fetchProducts();
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = !filters.category || product.productInfo.category === filters.category;
    const matchesType = !filters.productType || product.logistics.productType === filters.productType;
    const matchesSearch = !filters.searchTerm || 
      product.productInfo.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      product.productInfo.brand.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    return matchesCategory && matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex space-x-4">
              <div className="w-32 h-24 bg-gray-300 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products or brands..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="software">Software</option>
            <option value="beauty">Beauty</option>
            <option value="home">Home</option>
            <option value="food">Food & Beverage</option>
          </select>
          
          <select
            value={filters.productType}
            onChange={(e) => setFilters(prev => ({ ...prev, productType: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Types</option>
            <option value="physical">Physical Product</option>
            <option value="digital">Digital Product</option>
            <option value="subscription">Subscription</option>
            <option value="service">Service</option>
          </select>
          
          <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, showManageButtons = false }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex space-x-4">
          {/* Product Image */}
          <div className="w-32 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {product.media?.images?.[0] ? (
              <img 
                src={product.media.images[0]} 
                alt={product.productInfo.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-8 h-8 text-gray-400" />
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{product.productInfo.name}</h3>
                <p className="text-sm text-gray-600">{product.productInfo.brand}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  ${(product.productInfo.msrp / 100).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">MSRP</div>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {product.productInfo.description}
            </p>

            {/* Product Features */}
            <div className="flex flex-wrap gap-1 mb-3">
              {product.productInfo.features?.slice(0, 3).map((feature, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {feature}
                </span>
              ))}
              {product.productInfo.features?.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  +{product.productInfo.features.length - 3} more
                </span>
              )}
            </div>

            {/* Campaign Info */}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {product.reviewRequirements.coverageDeadline} days
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {product.analytics.requests || 0} requests
                </div>
                <div className="flex items-center">
                  {product.logistics.productType === 'physical' ? (
                    <>
                      <MapPin className="w-4 h-4 mr-1" />
                      Ships
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-1" />
                      Digital
                    </>
                  )}
                </div>
              </div>
              
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                product.campaign.campaignTier === 'premium' ? 'bg-purple-100 text-purple-800' :
                product.campaign.campaignTier === 'enterprise' ? 'bg-gold-100 text-gold-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {product.campaign.campaignTier}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {!showManageButtons ? (
                <>
                  <button 
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                  >
                    View Details
                  </button>
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                    Request Sample
                  </button>
                </>
              ) : (
                <>
                  <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                    Edit
                  </button>
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                    Analytics
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Review Requirements</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Min {product.reviewRequirements.minWordCount} words</li>
                  <li>• {product.reviewRequirements.reviewType} review</li>
                  <li>• {product.reviewRequirements.coverageDeadline} day deadline</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Company</h4>
                <p className="text-gray-600">{product.companyId.name}</p>
                <div className="flex items-center mt-1">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm">4.8 (32 reviews)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Additional component stubs that would need full implementation
const MyProductsList = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const mockProducts = [
    {
      _id: '1',
      productInfo: { name: 'WirelessPro Earbuds', brand: 'AudioTech', category: 'electronics', msrp: 19900 },
      status: 'active',
      analytics: { requests: 23, approved: 18, completed: 12 },
      campaign: { campaignTier: 'premium' },
      created: new Date('2024-01-15')
    },
    {
      _id: '2',
      productInfo: { name: 'SmartHome Hub', brand: 'AudioTech', category: 'electronics', msrp: 29900 },
      status: 'pending_approval',
      analytics: { requests: 0, approved: 0, completed: 0 },
      campaign: { campaignTier: 'basic' },
      created: new Date('2024-01-20')
    }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/reviewmatch/products?company=true');
        setProducts(response.data.products);
      } catch (error) {
        console.error('Failed to fetch products');
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true;
    return product.status === filter;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">My Products</h2>
        
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Products</option>
            <option value="active">Active</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add Product
          </button>
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{product.productInfo.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.status === 'active' ? 'bg-green-100 text-green-800' :
                    product.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <span>Brand: {product.productInfo.brand}</span>
                  <span>MSRP: ${(product.productInfo.msrp / 100).toLocaleString()}</span>
                  <span>Created: {product.created.toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{product.analytics.requests}</div>
                    <div className="text-xs text-gray-600">Requests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{product.analytics.approved}</div>
                    <div className="text-xs text-gray-600">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{product.analytics.completed}</div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first product for review</p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add Your First Product
          </button>
        </div>
      )}
    </div>
  );
};
const ProductSubmissionForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productInfo: {
      name: '',
      brand: '',
      category: '',
      subcategory: '',
      description: '',
      features: [],
      msrp: '',
      productUrls: {
        website: '',
        purchase: '',
        support: ''
      }
    },
    campaign: {
      campaignTier: 'basic',
      budget: 4900,
      maxReviewers: 10,
      endDate: ''
    },
    reviewRequirements: {
      minWordCount: 500,
      reviewType: 'individual',
      publicationTier: 'any',
      coverageDeadline: 30,
      exclusiveWindow: 0,
      usageRights: {
        canQuote: true,
        canShareSocial: true,
        canUseInMarketing: false
      }
    },
    targeting: {
      journalistSpecializations: [],
      minFollowers: 0,
      geographicRegions: [],
      excludeCompetitors: true,
      languagePreferences: []
    },
    logistics: {
      productType: 'physical',
      shippingRequired: true,
      availableQuantity: 1,
      shippingRegions: [],
      estimatedDeliveryDays: 7,
      returnRequired: false,
      subscriptionLength: null,
      accessInstructions: ''
    }
  });

  const steps = [
    { id: 1, title: 'Product Details', description: 'Basic product information' },
    { id: 2, title: 'Campaign Setup', description: 'Review campaign configuration' },
    { id: 3, title: 'Requirements', description: 'Review requirements and guidelines' },
    { id: 4, title: 'Targeting', description: 'Journalist targeting criteria' },
    { id: 5, title: 'Review & Submit', description: 'Final review and submission' }
  ];

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleFeatureAdd = (feature) => {
    if (feature && !formData.productInfo.features.includes(feature)) {
      setFormData(prev => ({
        ...prev,
        productInfo: {
          ...prev.productInfo,
          features: [...prev.productInfo.features, feature]
        }
      }));
    }
  };

  const handleFeatureRemove = (feature) => {
    setFormData(prev => ({
      ...prev,
      productInfo: {
        ...prev.productInfo,
        features: prev.productInfo.features.filter(f => f !== feature)
      }
    }));
  };

  const handleSpecializationToggle = (specialization) => {
    const current = formData.targeting.journalistSpecializations;
    const newSpecializations = current.includes(specialization)
      ? current.filter(s => s !== specialization)
      : [...current, specialization];
    
    setFormData(prev => ({
      ...prev,
      targeting: {
        ...prev.targeting,
        journalistSpecializations: newSpecializations
      }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/reviewmatch/products', formData);
      alert('Product submitted successfully!');
      // Redirect or reset form
    } catch (error) {
      console.error('Failed to submit product:', error);
      alert('Failed to submit product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Product Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.productInfo.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    productInfo: { ...prev.productInfo, name: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., WirelessPro Earbuds"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                <input
                  type="text"
                  value={formData.productInfo.brand}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    productInfo: { ...prev.productInfo, brand: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., AudioTech"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={formData.productInfo.category}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    productInfo: { ...prev.productInfo, category: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="electronics">Electronics</option>
                  <option value="software">Software</option>
                  <option value="beauty">Beauty</option>
                  <option value="home">Home & Lifestyle</option>
                  <option value="food">Food & Beverage</option>
                  <option value="fashion">Fashion</option>
                  <option value="health">Health & Wellness</option>
                  <option value="automotive">Automotive</option>
                  <option value="services">Services</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">MSRP ($) *</label>
                <input
                  type="number"
                  value={formData.productInfo.msrp}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    productInfo: { ...prev.productInfo, msrp: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="199.00"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Description *</label>
              <textarea
                value={formData.productInfo.description}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  productInfo: { ...prev.productInfo, description: e.target.value }
                }))}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Describe your product, its key features, and what makes it unique..."
                required
              />
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Key Features</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.productInfo.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => handleFeatureRemove(feature)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add a feature..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleFeatureAdd(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.target.previousElementSibling;
                    handleFeatureAdd(input.value);
                    input.value = '';
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Product URLs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                <input
                  type="url"
                  value={formData.productInfo.productUrls.website}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    productInfo: {
                      ...prev.productInfo,
                      productUrls: { ...prev.productInfo.productUrls, website: e.target.value }
                    }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="https://yourproduct.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purchase URL</label>
                <input
                  type="url"
                  value={formData.productInfo.productUrls.purchase}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    productInfo: {
                      ...prev.productInfo,
                      productUrls: { ...prev.productInfo.productUrls, purchase: e.target.value }
                    }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="https://store.com/product"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Support URL</label>
                <input
                  type="url"
                  value={formData.productInfo.productUrls.support}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    productInfo: {
                      ...prev.productInfo,
                      productUrls: { ...prev.productInfo.productUrls, support: e.target.value }
                    }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="https://support.com"
                />
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Campaign Setup</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  tier: 'basic',
                  name: 'Basic Campaign',
                  price: 49,
                  features: ['Up to 10 reviewers', 'Standard placement', 'Basic analytics', '30-day campaign'],
                  color: 'border-gray-200'
                },
                {
                  tier: 'premium',
                  name: 'Premium Campaign',
                  price: 149,
                  features: ['Up to 25 reviewers', 'Featured placement', 'Advanced analytics', 'Priority matching', '60-day campaign'],
                  color: 'border-purple-500',
                  popular: true
                },
                {
                  tier: 'enterprise',
                  name: 'Enterprise Campaign',
                  price: 299,
                  features: ['Up to 50 reviewers', 'Top placement', 'Full analytics suite', 'Dedicated support', '90-day campaign'],
                  color: 'border-yellow-500'
                }
              ].map((campaign) => (
                <div
                  key={campaign.tier}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors relative ${
                    formData.campaign.campaignTier === campaign.tier
                      ? 'border-blue-500 bg-blue-50'
                      : campaign.color + ' hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    campaign: { ...prev.campaign, campaignTier: campaign.tier, budget: campaign.price * 100 }
                  }))}
                >
                  {campaign.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                  <div className="text-2xl font-bold text-green-600 my-2">${campaign.price}</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {campaign.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Reviewers</label>
                <input
                  type="number"
                  value={formData.campaign.maxReviewers}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    campaign: { ...prev.campaign, maxReviewers: parseInt(e.target.value) }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="1"
                  max="50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign End Date (Optional)</label>
                <input
                  type="date"
                  value={formData.campaign.endDate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    campaign: { ...prev.campaign, endDate: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Review Requirements</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Word Count</label>
                <input
                  type="number"
                  value={formData.reviewRequirements.minWordCount}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    reviewRequirements: { ...prev.reviewRequirements, minWordCount: parseInt(e.target.value) }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="300"
                  max="2000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Coverage Deadline (days)</label>
                <input
                  type="number"
                  value={formData.reviewRequirements.coverageDeadline}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    reviewRequirements: { ...prev.reviewRequirements, coverageDeadline: parseInt(e.target.value) }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="1"
                  max="90"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Type</label>
                <select
                  value={formData.reviewRequirements.reviewType}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    reviewRequirements: { ...prev.reviewRequirements, reviewType: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="individual">Individual Review</option>
                  <option value="roundup">Roundup/Comparison</option>
                  <option value="comparison">Direct Comparison</option>
                  <option value="trend">Trend Article</option>
                  <option value="gift-guide">Gift Guide</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Publication Tier</label>
                <select
                  value={formData.reviewRequirements.publicationTier}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    reviewRequirements: { ...prev.reviewRequirements, publicationTier: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="any">Any Publication</option>
                  <option value="tier-2">Tier 2+ Only</option>
                  <option value="tier-1">Tier 1 Only</option>
                  <option value="premium">Premium Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exclusive Window (days)</label>
                <input
                  type="number"
                  value={formData.reviewRequirements.exclusiveWindow}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    reviewRequirements: { ...prev.reviewRequirements, exclusiveWindow: parseInt(e.target.value) }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="0"
                  max="30"
                />
                <p className="text-xs text-gray-500 mt-1">Days before competitors can review similar products</p>
              </div>
            </div>

            {/* Usage Rights */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Usage Rights</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.reviewRequirements.usageRights.canQuote}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      reviewRequirements: {
                        ...prev.reviewRequirements,
                        usageRights: { ...prev.reviewRequirements.usageRights, canQuote: e.target.checked }
                      }
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Allow journalists to quote reviews in other articles</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.reviewRequirements.usageRights.canShareSocial}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      reviewRequirements: {
                        ...prev.reviewRequirements,
                        usageRights: { ...prev.reviewRequirements.usageRights, canShareSocial: e.target.checked }
                      }
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Allow social media sharing of reviews</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.reviewRequirements.usageRights.canUseInMarketing}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      reviewRequirements: {
                        ...prev.reviewRequirements,
                        usageRights: { ...prev.reviewRequirements.usageRights, canUseInMarketing: e.target.checked }
                      }
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Allow use of positive reviews in marketing materials</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Journalist Targeting</h3>
            
            {/* Specializations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Specializations</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  'Technology', 'AI/ML', 'Cybersecurity', 'Mobile', 'Startups',
                  'Finance', 'Healthcare', 'Beauty', 'Fashion', 'Food',
                  'Travel', 'Automotive', 'Gaming', 'Fitness', 'Productivity'
                ].map((specialization) => (
                  <label key={specialization} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.targeting.journalistSpecializations.includes(specialization)}
                      onChange={() => handleSpecializationToggle(specialization)}
                      className="mr-2"
                    />
                    <span className="text-sm">{specialization}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Followers</label>
                <input
                  type="number"
                  value={formData.targeting.minFollowers}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    targeting: { ...prev.targeting, minFollowers: parseInt(e.target.value) }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="0"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Geographic Regions</label>
                <select
                  multiple
                  value={formData.targeting.geographicRegions}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData(prev => ({
                      ...prev,
                      targeting: { ...prev.targeting, geographicRegions: values }
                    }));
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="north-america">North America</option>
                  <option value="europe">Europe</option>
                  <option value="asia-pacific">Asia Pacific</option>
                  <option value="latin-america">Latin America</option>
                  <option value="middle-east-africa">Middle East & Africa</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.targeting.excludeCompetitors}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    targeting: { ...prev.targeting, excludeCompetitors: e.target.checked }
                  }))}
                  className="mr-2"
                />
                <span className="text-sm">Exclude journalists who recently covered competitors</span>
              </label>
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Review & Submit</h3>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Campaign Summary</h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Product:</span>
                  <span className="ml-2 font-medium">{formData.productInfo.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Brand:</span>
                  <span className="ml-2 font-medium">{formData.productInfo.brand}</span>
                </div>
                <div>
                  <span className="text-gray-600">Category:</span>
                  <span className="ml-2 font-medium">{formData.productInfo.category}</span>
                </div>
                <div>
                  <span className="text-gray-600">MSRP:</span>
                  <span className="ml-2 font-medium">${formData.productInfo.msrp}</span>
                </div>
                <div>
                  <span className="text-gray-600">Campaign Tier:</span>
                  <span className="ml-2 font-medium capitalize">{formData.campaign.campaignTier}</span>
                </div>
                <div>
                  <span className="text-gray-600">Budget:</span>
                  <span className="ml-2 font-medium">${formData.campaign.budget / 100}</span>
                </div>
                <div>
                  <span className="text-gray-600">Max Reviewers:</span>
                  <span className="ml-2 font-medium">{formData.campaign.maxReviewers}</span>
                </div>
                <div>
                  <span className="text-gray-600">Review Deadline:</span>
                  <span className="ml-2 font-medium">{formData.reviewRequirements.coverageDeadline} days</span>
                </div>
              </div>

              {formData.productInfo.features.length > 0 && (
                <div className="mt-4">
                  <span className="text-gray-600">Features:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.productInfo.features.map((feature, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.targeting.journalistSpecializations.length > 0 && (
                <div className="mt-4">
                  <span className="text-gray-600">Target Specializations:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.targeting.journalistSpecializations.map((spec, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Your product will be reviewed and approved within 24 hours</li>
                <li>2. Once approved, it will appear in the journalist marketplace</li>
                <li>3. You'll receive notifications when journalists request your product</li>
                <li>4. Review and approve journalist requests based on their profiles</li>
                <li>5. Track coverage and performance through your analytics dashboard</li>
              </ol>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  step.id
                )}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">{step.title}</div>
                <div className="text-xs text-gray-600">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="w-5 h-5 text-gray-400 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {renderStep()}
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentStep < 5 ? (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Product'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
const ReviewRequestManager = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const mockRequests = [
    {
      _id: '1',
      journalistId: { 
        name: 'Sarah Chen', 
        email: 'sarah@techcrunch.com',
        profile: { outlet: 'TechCrunch', specializations: ['AI', 'Startups'], rating: 4.9 }
      },
      productId: { productInfo: { name: 'WirelessPro Earbuds', msrp: 19900 } },
      requestInfo: {
        proposedOutlet: 'TechCrunch',
        estimatedReach: 250000,
        pitchMessage: 'I\'d like to review these earbuds for our upcoming holiday gift guide.',
        plannedAngle: 'Holiday gift guide inclusion',
        estimatedPublishDate: new Date('2024-02-15'),
        audienceData: { monthlyPageviews: 2500000, socialFollowing: 45000 }
      },
      companyReview: { status: 'pending' },
      created: new Date('2024-01-18')
    }
  ];

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('/api/reviewmatch/requests', {
          params: { status: filter }
        });
        setRequests(response.data.requests);
      } catch (error) {
        console.error('Failed to fetch requests');
        setRequests(mockRequests);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [filter]);

  const handleRequestAction = async (requestId, action, notes = '') => {
    try {
      await axios.put(`/api/reviewmatch/requests/${requestId}/status`, {
        status: action,
        reviewNotes: notes
      });
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req._id === requestId 
          ? { ...req, companyReview: { ...req.companyReview, status: action, reviewNotes: notes } }
          : req
      ));
      
      setSelectedRequest(null);
      alert(`Request ${action} successfully!`);
    } catch (error) {
      console.error('Failed to update request');
      alert('Failed to update request. Please try again.');
    }
  };

  const filteredRequests = requests.filter(req => 
    filter === 'all' || req.companyReview.status === filter
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading requests...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Review Requests</h2>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
          <option value="all">All Requests</option>
        </select>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div key={request._id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{request.journalistId.name}</h3>
                  <span className="text-sm text-gray-600">from {request.journalistId.profile.outlet}</span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-600 ml-1">{request.journalistId.profile.rating}</span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3">{request.requestInfo.pitchMessage}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Product:</span>
                    <div>{request.productId.productInfo.name}</div>
                  </div>
                  <div>
                    <span className="font-medium">Outlet:</span>
                    <div>{request.requestInfo.proposedOutlet}</div>
                  </div>
                  <div>
                    <span className="font-medium">Est. Reach:</span>
                    <div>{request.requestInfo.estimatedReach.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="font-medium">Publish Date:</span>
                    <div>{request.requestInfo.estimatedPublishDate.toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                {request.companyReview.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleRequestAction(request._id, 'approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRequestAction(request._id, 'declined')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Decline
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedRequest(request)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-600">No review requests match your current filter</p>
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <RequestDetailsModal 
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onAction={handleRequestAction}
        />
      )}
    </div>
  );
};

// REQUEST DETAILS MODAL COMPONENT
const RequestDetailsModal = ({ request, onClose, onAction }) => {
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Request Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Journalist Info */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Journalist Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Name:</span>
                    <div className="font-medium">{request.journalistId.name}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Email:</span>
                    <div className="font-medium">{request.journalistId.email}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Outlet:</span>
                    <div className="font-medium">{request.journalistId.profile.outlet}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Rating:</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="font-medium">{request.journalistId.profile.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-sm text-gray-600">Specializations:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {request.journalistId.profile.specializations.map((spec, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Request Details */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Request Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Pitch Message:</span>
                  <p className="text-gray-900 mt-1">{request.requestInfo.pitchMessage}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Proposed Outlet:</span>
                    <div className="font-medium">{request.requestInfo.proposedOutlet}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Estimated Reach:</span>
                    <div className="font-medium">{request.requestInfo.estimatedReach.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Planned Angle:</span>
                    <div className="font-medium">{request.requestInfo.plannedAngle}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Est. Publish Date:</span>
                    <div className="font-medium">{request.requestInfo.estimatedPublishDate.toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Audience Data */}
            {request.requestInfo.audienceData && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Audience Data</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Monthly Pageviews:</span>
                      <div className="font-medium">{request.requestInfo.audienceData.monthlyPageviews.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Social Following:</span>
                      <div className="font-medium">{request.requestInfo.audienceData.socialFollowing.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Section */}
            {request.companyReview.status === 'pending' && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Take Action</h3>
                <div className="space-y-3">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes (optional)..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        onAction(request._id, 'approved', notes);
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve Request
                    </button>
                    <button
                      onClick={() => {
                        onAction(request._id, 'declined', notes);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Decline Request
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// JOURNALIST REQUESTS COMPONENT
const JournalistRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const mockRequests = [
    {
      _id: '1',
      productId: { 
        productInfo: { name: 'WirelessPro Earbuds', brand: 'AudioTech', msrp: 19900 },
        companyId: { name: 'AudioTech Inc.' }
      },
      requestInfo: {
        pitchMessage: 'I\'d like to review these earbuds for our upcoming holiday gift guide.',
        proposedOutlet: 'TechCrunch',
        estimatedReach: 250000
      },
      companyReview: { status: 'approved', reviewDate: new Date('2024-01-19') },
      fulfillment: { fulfillmentStatus: 'shipped', shippingInfo: { trackingNumber: 'ABC123' } },
      reviewCompletion: { status: 'in_progress' },
      created: new Date('2024-01-18')
    }
  ];

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('/api/reviewmatch/requests');
        setRequests(response.data.requests);
      } catch (error) {
        console.error('Failed to fetch requests');
        setRequests(mockRequests);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    if (filter === 'pending') return req.companyReview.status === 'pending';
    if (filter === 'approved') return req.companyReview.status === 'approved';
    if (filter === 'in_progress') return req.reviewCompletion.status === 'in_progress';
    return false;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading your requests...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">My Requests</h2>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="in_progress">In Progress</option>
        </select>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div key={request._id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{request.productId.productInfo.name}</h3>
                  <span className="text-sm text-gray-600">by {request.productId.productInfo.brand}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.companyReview.status === 'approved' ? 'bg-green-100 text-green-800' :
                    request.companyReview.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.companyReview.status}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-3">{request.requestInfo.pitchMessage}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Company:</span>
                    <div>{request.productId.companyId.name}</div>
                  </div>
                  <div>
                    <span className="font-medium">Value:</span>
                    <div>${(request.productId.productInfo.msrp / 100).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="font-medium">Requested:</span>
                    <div>{request.created.toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <div className="capitalize">{request.reviewCompletion.status.replace('_', ' ')}</div>
                  </div>
                </div>

                {/* Tracking Info */}
                {request.fulfillment?.fulfillmentStatus === 'shipped' && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center text-blue-800">
                      <Package className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">
                        Shipped - Tracking: {request.fulfillment.shippingInfo.trackingNumber}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 ml-4">
                {request.companyReview.status === 'approved' && 
                 request.reviewCompletion.status === 'not_started' && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Start Review
                  </button>
                )}
                {request.reviewCompletion.status === 'in_progress' && (
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                    Submit Coverage
                  </button>
                )}
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-600 mb-4">Start browsing the marketplace to request products for review</p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Browse Marketplace
          </button>
        </div>
      )}
    </div>
  );
};

// ANALYTICS COMPONENT
const ReviewAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  const mockAnalytics = {
    overview: {
      totalCampaigns: 5,
      totalInvestment: 74700, // in cents
      totalReviews: 23,
      averageRating: 4.2,
      totalReach: 2400000
    },
    campaigns: [
      {
        productName: 'WirelessPro Earbuds',
        investment: 14900,
        reviews: 12,
        avgRating: 4.5,
        totalReach: 1200000,
        roi: 8.2
      }
    ],
    recentActivity: [
      {
        type: 'review_published',
        journalist: 'Sarah Chen',
        product: 'WirelessPro Earbuds',
        outlet: 'TechCrunch',
        date: new Date('2024-01-20')
      }
    ]
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`/api/reviewmatch/analytics/company?range=${timeRange}`);
        setAnalyticsData(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics');
        setAnalyticsData(mockAnalytics);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-2xl font-bold text-blue-600">{analyticsData.overview.totalCampaigns}</div>
          <div className="text-sm text-gray-600">Total Campaigns</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-2xl font-bold text-green-600">
            ${(analyticsData.overview.totalInvestment / 100).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Investment</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-2xl font-bold text-purple-600">{analyticsData.overview.totalReviews}</div>
          <div className="text-sm text-gray-600">Reviews Published</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-2xl font-bold text-yellow-600">{analyticsData.overview.averageRating}</div>
          <div className="text-sm text-gray-600">Avg Rating</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-2xl font-bold text-orange-600">
            {(analyticsData.overview.totalReach / 1000000).toFixed(1)}M
          </div>
          <div className="text-sm text-gray-600">Total Reach</div>
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2">Product</th>
                <th className="text-left py-2">Investment</th>
                <th className="text-left py-2">Reviews</th>
                <th className="text-left py-2">Avg Rating</th>
                <th className="text-left py-2">Reach</th>
                <th className="text-left py-2">ROI</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.campaigns.map((campaign, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 font-medium">{campaign.productName}</td>
                  <td className="py-3">${(campaign.investment / 100).toLocaleString()}</td>
                  <td className="py-3">{campaign.reviews}</td>
                  <td className="py-3">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      {campaign.avgRating}
                    </div>
                  </td>
                  <td className="py-3">{(campaign.totalReach / 1000).toFixed(0)}K</td>
                  <td className="py-3">
                    <span className="text-green-600 font-medium">{campaign.roi}x</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


const JournalistEarnings = () => <div className="placeholder-card">
  <DollarSign />
  <h2>My Earnings</h2>
  <p>Track your earnings from completed reviews.</p>
</div>;

const CompletedReviews = () => <div className="placeholder-card">
  <CheckCircle />
  <h2>Completed Reviews</h2>
  <p>Browse your history of finished reviews.</p>
</div>;

export {
  ReviewMatchDashboard,
  ProductMarketplace,
  ProductCard,
  MyProductsList,
  ProductSubmissionForm,
  ReviewRequestManager,
  RequestDetailsModal,
  JournalistRequests,
  ReviewAnalytics
};
