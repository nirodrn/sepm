import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Package, FileText, Users, CheckSquare, X, Eye, AlertTriangle } from 'lucide-react';
import { requestService } from '../../services/requestService';

const ApprovalQueue = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('material');
  const [materialRequests, setMaterialRequests] = useState([]);
  const [productRequests, setProductRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingRequest, setProcessingRequest] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const [materialData, productData] = await Promise.all([
        requestService.getMaterialRequests({ status: 'pending' }),
        requestService.getProductRequests({ status: 'pending' })
      ]);
      
      setMaterialRequests(materialData);
      setProductRequests(productData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMaterialRequest = async (requestId) => {
    const notes = prompt('Add approval notes (will be forwarded to MD):');
    if (notes !== null) { // User didn't cancel
      try {
        setProcessingRequest(requestId);
        await requestService.approveRequest(requestId, { 
          notes: notes || 'Approved by Head of Operations - forwarded to MD for final approval' 
        });
        await loadRequests();
      } catch (error) {
        setError(error.message);
      } finally {
        setProcessingRequest(null);
      }
    }
  };

  const handleRejectMaterialRequest = async (requestId) => {
    const reason = prompt('Please provide rejection reason:');
    if (reason) {
      try {
        setProcessingRequest(requestId);
        await requestService.rejectRequest(requestId, { reason });
        await loadRequests();
      } catch (error) {
        setError(error.message);
      } finally {
        setProcessingRequest(null);
      }
    }
  };

  const handleApproveProductRequest = async (requestId) => {
    const notes = prompt('Add approval notes:');
    if (notes !== null) {
      try {
        setProcessingRequest(requestId);
        await requestService.approveProductRequest(requestId, { 
          notes: notes || 'Approved by Head of Operations' 
        });
        await loadRequests();
      } catch (error) {
        setError(error.message);
      } finally {
        setProcessingRequest(null);
      }
    }
  };

  const handleRejectProductRequest = async (requestId) => {
    const reason = prompt('Please provide rejection reason:');
    if (reason) {
      try {
        setProcessingRequest(requestId);
        await requestService.rejectProductRequest(requestId, { reason });
        await loadRequests();
      } catch (error) {
        setError(error.message);
      } finally {
        setProcessingRequest(null);
      }
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <CheckCircle className="h-8 w-8 mr-3 text-blue-600" />
          Approval Queue
        </h1>
        <p className="text-gray-600">Review and approve material and product requests</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('material')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'material'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="h-4 w-4" />
              <span>Material Requests</span>
              {materialRequests.length > 0 && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {materialRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('product')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'product'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Product Requests</span>
              {productRequests.length > 0 && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  {productRequests.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'material' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Material Requests Pending HO Approval</h3>
                <div className="text-sm text-gray-500">
                  {materialRequests.length} requests awaiting review
                </div>
              </div>

              <div className="space-y-6">
                {materialRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <Package className="h-6 w-6 text-blue-600" />
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {request.requestType === 'rawMaterial' ? 'Raw Material' : 'Packing Material'} Request
                            </h4>
                            <p className="text-sm text-gray-500">Request ID: {request.id}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-500">Material:</p>
                            <p className="font-medium text-gray-900">{request.items?.[0]?.materialName}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-500">Quantity:</p>
                            <p className="font-medium text-gray-900">
                              {request.items?.[0]?.quantity} {request.items?.[0]?.unit}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-500">Requested By:</p>
                            <p className="font-medium text-gray-900">{request.requesterName || 'Warehouse Staff'}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-2">Purpose/Reason:</p>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {request.items?.[0]?.reason || 'No specific reason provided'}
                          </p>
                        </div>

                        <div className="flex items-center space-x-4">
                          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getUrgencyColor(request.items?.[0]?.urgency)}`}>
                            {request.items?.[0]?.urgency?.toUpperCase() || 'NORMAL'} Priority
                          </span>
                          <span className="text-sm text-gray-500">
                            Submitted: {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-6">
                        <button
                          onClick={() => handleApproveMaterialRequest(request.id)}
                          disabled={processingRequest === request.id}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                        >
                          <CheckSquare className="h-4 w-4" />
                          <span>Approve & Forward to MD</span>
                        </button>
                        <button
                          onClick={() => handleRejectMaterialRequest(request.id)}
                          disabled={processingRequest === request.id}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                          <span>Reject Request</span>
                        </button>
                        <button
                          onClick={() => navigate(`/approvals/material-requests/${request.id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {materialRequests.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pending material requests</h3>
                    <p className="mt-1 text-sm text-gray-500">All material requests have been processed</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'product' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Product Requests from DRs/Distributors</h3>
                <div className="text-sm text-gray-500">
                  {productRequests.length} requests awaiting approval
                </div>
              </div>

              <div className="space-y-6">
                {productRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <FileText className="h-6 w-6 text-green-600" />
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">Product Distribution Request</h4>
                            <p className="text-sm text-gray-500">Request ID: {request.id}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-500">Product:</p>
                            <p className="font-medium text-gray-900">{request.productName || 'Product Details'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-500">Quantity:</p>
                            <p className="font-medium text-gray-900">{request.quantity || 'N/A'} units</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-500">Requester:</p>
                            <p className="font-medium text-gray-900">
                              {request.requesterType === 'DR' ? 'Direct Representative' :
                               request.requesterType === 'Distributor' ? 'Distributor' :
                               request.requesterType === 'DS' ? 'Direct Showroom' : 'Unknown'}
                            </p>
                          </div>
                        </div>

                        {request.notes && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-2">Request Notes:</p>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{request.notes}</p>
                          </div>
                        )}

                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">
                            Submitted: {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                          {request.urgency && (
                            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getUrgencyColor(request.urgency)}`}>
                              {request.urgency.toUpperCase()} Priority
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-6">
                        <button
                          onClick={() => handleApproveProductRequest(request.id)}
                          disabled={processingRequest === request.id}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                        >
                          <CheckSquare className="h-4 w-4" />
                          <span>Approve Request</span>
                        </button>
                        <button
                          onClick={() => handleRejectProductRequest(request.id)}
                          disabled={processingRequest === request.id}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                          <span>Reject Request</span>
                        </button>
                        <button
                          onClick={() => navigate(`/approvals/product-requests/${request.id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {productRequests.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pending product requests</h3>
                    <p className="mt-1 text-sm text-gray-500">All product requests have been processed</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Pending</p>
              <p className="text-2xl font-bold text-blue-900">
                {materialRequests.length + productRequests.length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-sm text-blue-700 mt-2">Requests awaiting your approval</p>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Material Requests</p>
              <p className="text-2xl font-bold text-green-900">{materialRequests.length}</p>
            </div>
            <Package className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-sm text-green-700 mt-2">Raw & packing materials</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Product Requests</p>
              <p className="text-2xl font-bold text-purple-900">{productRequests.length}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-sm text-purple-700 mt-2">From DRs/Distributors/DS</p>
        </div>
      </div>
    </div>
  );
};

export default ApprovalQueue;