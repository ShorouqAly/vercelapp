
import React, { useState, useEffect } from 'react';
import { ChevronRight, Package, Star, Clock, MapPin, DollarSign, Users, TrendingUp, CheckCircle, AlertCircle, Camera, Video, ExternalLink, Filter, Search, Plus, Eye, Heart, MessageSquare, BarChart3 } from 'lucide-react';

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
const MyProductsList = () => <div>My Products List Component</div>;
const ProductSubmissionForm = () => <div>Product Submission Form Component</div>;
const ReviewRequestManager = () => <div>Review Request Manager Component</div>;
const JournalistRequests = () => <div>Journalist Requests Component</div>;
const ReviewAnalytics = () => <div>Review Analytics Component</div>;
const JournalistEarnings = () => <div>Journalist Earnings Component</div>;
const CompletedReviews = () => <div>Completed Reviews Component</div>;

export default ReviewMatchDashboard;
