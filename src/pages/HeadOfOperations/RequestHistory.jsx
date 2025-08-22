import React, { useState, useEffect } from 'react';
import { Clock, Search, Filter, FileText, Package, ShoppingCart, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { requestService } from '../../services/requestService';
import { packingMaterialsService } from '../../services/packingMaterialsService';
import { formatDate } from '../../utils/formatDate';

const RequestHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    loadRequestHistory();
  }, []);

  const loadRequestHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const [materialRequests, productRequests, packingMaterialRequests] = await Promise.all([
        requestService.getMaterialRequests(),
        requestService.getProductRequests(),
        packingMaterialsService.getPurchaseRequests().catch(() => [])
      ]);

      // Combine all requests with type identification
      const allRequests = [
        ...materialRequests.map(req => ({ ...req, type: 'material' })),
        ...productRequests.map(req => ({ ...req, type: 'product' })),
        ...packingMaterialRequests.map(req => ({ ...req, type: 'packing_material' }))
      ];

      // Sort by date (newest first)
      allRequests.sort((a, b) => {
        const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return bDate - aDate;
      });

      setRequests(allRequests);
    } catch (err) {
      console.error('Error loading request history:', err);
      setError('Failed to load request history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'material':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'product':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'packing_material':
        return <ShoppingCart className="w-5 h-5 text-purple-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'material':
        return 'Material Request';
      case 'product':
        return 'Product Request';
      case 'packing_material':
        return 'Packing Material Purchase';
      default:
        return 'Unknown';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.materialName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.items?.some(item => item.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      request.requestedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request History</h1>
          <p className="text-gray-600">View and track all material, product, and packing material requests</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Types</option>
                <option value="material">Material Requests</option>
                <option value="product">Product Requests</option>
                <option value="packing_material">Packing Material</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredRequests.length} of {requests.length} requests
          </p>
        </div>

        {/* Request List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {requests.length === 0 ? 'No requests found' : 'No matching requests'}
            </h3>
            <p className="text-gray-500">
              {requests.length === 0 
                ? 'Data currently not available. No requests have been submitted yet.'
                : 'Try adjusting your search criteria or filters.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={`${request.type}-${request.id}`} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {getTypeIcon(request.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getTypeLabel(request.type)}
                        </h3>
                        <span className="text-sm text-gray-500">#{request.id}</span>
                      </div>
                      
                      {/* Request Details */}
                      <div className="space-y-2">
                        {request.type === 'material' && (
                          <div>
                            <p className="text-gray-700">
                              <span className="font-medium">Material:</span> {request.materialName}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-medium">Quantity:</span> {request.quantity} {request.unit}
                            </p>
                          </div>
                        )}
                        
                        {request.type === 'product' && (
                          <div>
                            <p className="text-gray-700">
                              <span className="font-medium">Product:</span> {request.productName}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-medium">Quantity:</span> {request.quantity}
                            </p>
                          </div>
                        )}
                        
                        {request.type === 'packing_material' && (
                          <div>
                            <p className="text-gray-700">
                              <span className="font-medium">Items:</span> {request.items?.length || 0} items
                            </p>
                            <p className="text-gray-700">
                              <span className="font-medium">Budget:</span> ${request.estimatedBudget}
                            </p>
                          </div>
                        )}
                        
                        <p className="text-gray-700">
                          <span className="font-medium">Requested by:</span> {request.requestedBy}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Date:</span> {formatDate(request.createdAt)}
                        </p>
                        
                        {request.urgency && (
                          <p className="text-gray-700">
                            <span className="font-medium">Urgency:</span> 
                            <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                              request.urgency === 'high' ? 'bg-red-100 text-red-800' :
                              request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {request.urgency}
                            </span>
                          </p>
                        )}
                        
                        {request.reason && (
                          <p className="text-gray-700">
                            <span className="font-medium">Reason:</span> {request.reason}
                          </p>
                        )}
                        
                        {request.justification && (
                          <p className="text-gray-700">
                            <span className="font-medium">Justification:</span> {request.justification}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(request.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                </div>
                
                {/* Approval/Rejection Details */}
                {(request.status === 'approved' || request.status === 'rejected') && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>
                        {request.status === 'approved' ? 'Approved' : 'Rejected'} by {request.approvedBy || request.rejectedBy || 'System'}
                      </span>
                      <span>{request.approvedAt || request.rejectedAt ? formatDate(request.approvedAt || request.rejectedAt) : 'N/A'}</span>
                    </div>
                    {(request.approvalComments || request.rejectionReason) && (
                      <p className="mt-2 text-sm text-gray-700">
                        <span className="font-medium">Comments:</span> {request.approvalComments || request.rejectionReason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestHistory;