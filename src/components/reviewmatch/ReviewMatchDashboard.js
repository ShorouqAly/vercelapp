// COMPLETION OF REVIEWREQUESTMANAGER COMPONENT
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

// EXPORT ALL COMPONENTS
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