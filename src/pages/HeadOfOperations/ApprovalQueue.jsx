import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Package, ShoppingCart, Archive, AlertCircle, ArrowRight, Eye } from 'lucide-react';
import { requestService } from '../../services/requestService';
import { packingMaterialRequestService } from '../../services/packingMaterialRequestService';
import { subscribeToData } from '../../firebase/db';
import { useRole } from '../../hooks/useRole';
import { formatDate } from '../../utils/formatDate';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const ApprovalQueue = () => {
  const navigate = useNavigate();
  const { userRole, hasRole } = useRole();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedRequestType, setSelectedRequestType] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState('material');
  const [materialRequests, setMaterialRequests] = useState([]);
  const [packingMaterialRequests, setPackingMaterialRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPendingRequests();
    
    // Set up real-time listeners
    const unsubscribeMaterial = subscribeToData('materialRequests', () => {
      loadPendingRequests();
    });
    
    const unsubscribePacking = subscribeToData('packingMaterialRequests', () => {
      loadPendingRequests();
    });

    return () => {
      unsubscribeMaterial();
      unsubscribePacking();
    };
  }, [userRole]);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (hasRole('MainDirector')) {
        // MD sees requests forwarded for final approval
        const [materials, packingMaterials] = await Promise.all([
          requestService.getMaterialRequests({ status: 'forwarded_to_md' }),
          packingMaterialRequestService.getPackingMaterialRequests({ status: 'forwarded_to_md' })
        ]);
        
        setMaterialRequests(materials);
        setPackingMaterialRequests(packingMaterials);
      } else if (hasRole('HeadOfOperations')) {
        // HO sees requests pending initial approval
        const [materials, packingMaterials] = await Promise.all([
          requestService.getMaterialRequests({ status: 'pending_ho' }),
          packingMaterialRequestService.getPackingMaterialRequests({ status: 'pending_ho' })
        ]);
        
        setMaterialRequests(materials);
        setPackingMaterialRequests(packingMaterials);
      }
    } catch (err) {
      setError('Failed to load pending requests');
      console.error('Error loading requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMaterialRequest = async (requestId) => {
    try {
      if (hasRole('MainDirector')) {
        // MD final approval
        await requestService.mdApproveRequest(requestId, { 
          comments: 'Approved by Main Director' 
        });
        // Create purchase preparation after MD approval
        await requestService.createPurchasePreparationAfterApproval(requestId);
      } else if (hasRole('HeadOfOperations')) {
        // HO approves and forwards to MD
        await requestService.hoApproveAndForward(requestId, { 
          comments: 'Approved by Head of Operations and forwarded to MD' 
        });
      }
      
      await loadPendingRequests();
    } catch (err) {
      setError(`Failed to approve material request: ${err.message}`);
      console.error('Error approving request:', err);
    }
  };

  const handleRejectMaterialRequest = async (requestId, reason) => {
    try {
      if (hasRole('MainDirector')) {
        await requestService.mdRejectRequest(requestId, { reason });
      } else if (hasRole('HeadOfOperations')) {
        await requestService.hoRejectRequest(requestId, { reason });
      }
      
      await loadPendingRequests();
    } catch (err) {
      setError(`Failed to reject material request: ${err.message}`);
      console.error('Error rejecting request:', err);
    }
  };

  const handleApprovePackingMaterialRequest = async (requestId) => {
    try {
      if (hasRole('MainDirector')) {
        // MD final approval
        await packingMaterialRequestService.mdApproveRequest(requestId, { 
          notes: 'Approved by Main Director' 
        });
        // Create purchase preparation after MD approval
        await packingMaterialRequestService.createPurchasePreparationAfterApproval(requestId);
      } else if (hasRole('HeadOfOperations')) {
        // HO approves and forwards to MD
        await packingMaterialRequestService.hoApproveAndForward(requestId, { 
          notes: 'Approved by Head of Operations' 
        });
      }
      
      await loadPendingRequests();
    } catch (err) {
      setError(`Failed to approve packing material request: ${err.message}`);
      console.error('Error approving packing material request:', err);
    }
  };

  const handleRejectPackingMaterialRequest = async (requestId, reason) => {
    try {
      if (hasRole('MainDirector')) {
        await packingMaterialRequestService.mdRejectRequest(requestId, { reason });
      } else if (hasRole('HeadOfOperations')) {
        await packingMaterialRequestService.hoRejectRequest(requestId, { reason });
      }
      await loadPendingRequests();
    } catch (err) {
      setError(`Failed to reject packing material request: ${err.message}`);
      console.error('Error rejecting packing material request:', err);
    }
  };

  const confirmReject = () => {
    if (selectedRequestId && rejectionReason.trim()) {
      if (selectedRequestType === 'material') {
        handleRejectMaterialRequest(selectedRequestId, rejectionReason);
      } else if (selectedRequestType === 'packing') {
        handleRejectPackingMaterialRequest(selectedRequestId, rejectionReason);
      }
      setShowRejectModal(false);
      setSelectedRequestId(null);
      setSelectedRequestType('');
      setRejectionReason('');
    }
  };

  const getPageTitle = () => {
    if (hasRole('MainDirector')) {
      return 'Final Approval Queue';
    }
    return 'Approval Queue';
  };

  const getPageDescription = () => {
    if (hasRole('MainDirector')) {
      return 'Review and provide final approval for requests forwarded by Head of Operations';
    }
    return 'Review and approve pending requests';
  };

  const getApproveButtonText = () => {
    if (hasRole('MainDirector')) {
      return 'MD Approve';
    }
    return 'HO Approve';
  };

  const getRejectButtonText = () => {
    if (hasRole('MainDirector')) {
      return 'MD Reject';
    }
    return 'HO Reject';
  };

  const tabs = [
    { id: 'material', label: 'Material Requests', icon: Package, count: materialRequests.length },
    { id: 'packing', label: 'Packing Material', icon: Archive, count: packingMaterialRequests.length }
  ];

  if (loading) {
    return <LoadingSpinner text="Loading pending requests..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Rejection Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Request</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection *
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Please provide a detailed reason for rejection..."
                />
              </div>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedRequestId(null);
                    setSelectedRequestType('');
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={!rejectionReason.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Reject Request
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {getPageTitle()}
          </h1>
          <p className="mt-2 text-gray-600">
            {getPageDescription()}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Material Requests Tab */}
            {activeTab === 'material' && (
              <div>
                {materialRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {hasRole('MainDirector') 
                        ? 'No material requests forwarded for final approval' 
                        : 'No pending material requests'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {materialRequests.map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Raw Material Request
                            </h3>
                            <p className="text-sm text-gray-600">
                              Requested by: {request.requestedByName || 'Warehouse Staff'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Date: {formatDate(request.createdAt)}
                            </p>
                            {hasRole('MainDirector') && request.hoApprovedAt && (
                              <p className="text-sm text-blue-600">
                                HO Approved: {formatDate(request.hoApprovedAt)} by {request.hoApprovedByName}
                              </p>
                            )}
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="h-3 w-3 mr-1" />
                            {hasRole('MainDirector') ? 'Pending MD Approval' : 'Pending HO Approval'}
                          </span>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Requested Materials:</p>
                          <div className="space-y-2">
                            {request.items?.map((item, index) => (
                              <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                <div>
                                  <p className="font-medium text-gray-900">{item.materialName}</p>
                                  <p className="text-sm text-gray-500">Reason: {item.reason}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-900">{item.quantity} {item.unit}</p>
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    item.urgency === 'urgent' ? 'bg-red-100 text-red-800' :
                                    item.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                                    item.urgency === 'normal' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {item.urgency?.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {request.notes && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700">Additional Notes</p>
                            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{request.notes}</p>
                          </div>
                        )}

                        {hasRole('MainDirector') && request.hoApprovalComments && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700">HO Comments</p>
                            <p className="text-sm text-blue-900 bg-blue-50 p-2 rounded">{request.hoApprovalComments}</p>
                          </div>
                        )}

                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleApproveMaterialRequest(request.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {getApproveButtonText()}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequestId(request.id);
                              setSelectedRequestType('material');
                              setShowRejectModal(true);
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            {getRejectButtonText()}
                          </button>
                          <button
                            onClick={() => navigate(`/approvals/requests/${request.id}`)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Packing Material Requests Tab */}
            {activeTab === 'packing' && (
              <div>
                {packingMaterialRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {hasRole('MainDirector') 
                        ? 'No packing material requests forwarded for final approval' 
                        : 'No pending packing material requests'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {packingMaterialRequests.map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Packing Material Request
                            </h3>
                            <p className="text-sm text-gray-600">
                              Requested by: {request.requestedByName || 'Warehouse Staff'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Date: {formatDate(request.createdAt)}
                            </p>
                            {hasRole('MainDirector') && request.hoApprovedAt && (
                              <p className="text-sm text-blue-600">
                                HO Approved: {formatDate(request.hoApprovedAt)} by {request.hoApprovedByName}
                              </p>
                            )}
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="h-3 w-3 mr-1" />
                            {hasRole('MainDirector') ? 'Pending MD Approval' : 'Pending HO Approval'}
                          </span>
                        </div>

                        {request.items && request.items.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Requested Items</p>
                            <div className="space-y-2">
                              {(request.materials || request.items || []).map((item, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                  <div>
                                    <p className="font-medium text-gray-900">{item.materialName}</p>
                                    <p className="text-sm text-gray-500">Reason: {item.reason || 'No reason provided'}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium text-gray-900">{item.quantity} {item.unit}</p>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      item.urgency === 'urgent' ? 'bg-red-100 text-red-800' :
                                      item.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                                      item.urgency === 'normal' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {item.urgency?.toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {request.notes && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700">Additional Notes</p>
                            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{request.notes}</p>
                          </div>
                        )}

                        {hasRole('MainDirector') && request.hoApprovalNotes && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700">HO Comments</p>
                            <p className="text-sm text-blue-900 bg-blue-50 p-2 rounded">{request.hoApprovalNotes}</p>
                          </div>
                        )}

                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleApprovePackingMaterialRequest(request.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {getApproveButtonText()}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequestId(request.id);
                              setSelectedRequestType('packing');
                              setShowRejectModal(true);
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            {getRejectButtonText()}
                          </button>
                          <button
                            onClick={() => navigate(`/approvals/requests/${request.id}`)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalQueue;