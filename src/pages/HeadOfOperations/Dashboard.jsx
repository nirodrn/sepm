import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Package,
  ShoppingCart,
  FileText
} from 'lucide-react';
import { requestService } from '../../services/requestService';
import { supplierService } from '../../services/supplierService';
import { grnService } from '../../services/grnService';
import { packingMaterialsService } from '../../services/packingMaterialsService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    pendingMaterialRequests: 0,
    pendingProductRequests: 0,
    pendingPackingMaterialRequests: 0,
    activeSuppliers: 0,
    pendingGRNs: 0
  });
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        materialRequests,
        productRequests,
        packingMaterialRequests,
        suppliers,
        grns
      ] = await Promise.all([
        requestService.getMaterialRequests({ status: 'pending' }).catch(() => []),
        requestService.getProductRequests({ status: 'pending' }).catch(() => []),
        packingMaterialsService.getPurchaseRequests({ status: 'pending_ho' }).catch(() => []),
        supplierService.getSuppliers().catch(() => []),
        grnService.getGRNs().catch(() => [])
      ]);

      const pendingMaterialCount = materialRequests.length;
      const pendingProductCount = productRequests.length;
      const pendingPackingMaterialCount = packingMaterialRequests.filter(req => req.status === 'pending_ho').length;
      const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
      const pendingGRNCount = grns.filter(grn => grn.status === 'pending').length;

      setDashboardData({
        pendingMaterialRequests: pendingMaterialCount,
        pendingProductRequests: pendingProductCount,
        pendingPackingMaterialRequests: pendingPackingMaterialCount,
        activeSuppliers,
        pendingGRNs: pendingGRNCount
      });

      // Combine all pending requests for approval queue
      const allPendingRequests = [
        ...materialRequests.filter(req => req.status === 'pending').map(req => ({
          ...req,
          type: 'material',
          title: `Material Request - ${req.materialName || 'Unknown Material'}`
        })),
        ...productRequests.filter(req => req.status === 'pending').map(req => ({
          ...req,
          type: 'product',
          title: `Product Request - ${req.productName || 'Unknown Product'}`
        })),
        ...packingMaterialRequests.filter(req => req.status === 'pending_ho').map(req => ({
          ...req,
          type: 'packing',
          title: `Packing Material Request - ${req.items?.[0]?.materialName || 'Multiple Items'}`
        }))
      ];

      setPendingApprovals(allPendingRequests.slice(0, 5)); // Show only first 5

      // Generate recent activities
      const activities = [
        ...materialRequests.slice(0, 3).map(req => ({
          type: 'material_request',
          message: `Material request for ${req.materialName || 'Unknown Material'} ${req.status}`,
          timestamp: req.createdAt || new Date().toISOString(),
          status: req.status
        })),
        ...productRequests.slice(0, 2).map(req => ({
          type: 'product_request',
          message: `Product request for ${req.productName || 'Unknown Product'} ${req.status}`,
          timestamp: req.createdAt || new Date().toISOString(),
          status: req.status
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

      setRecentActivities(activities);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId, action, requestType) => {
    try {
      if (requestType === 'material') {
        if (action === 'approve') {
          await requestService.approveRequest(requestId);
        } else {
          await requestService.rejectRequest(requestId);
        }
      } else if (requestType === 'product') {
        if (action === 'approve') {
          await requestService.approveProductRequest(requestId);
        } else {
          await requestService.rejectProductRequest(requestId);
        }
      } else if (requestType === 'packing') {
        if (action === 'approve') {
          await packingMaterialsService.approvePurchaseRequest(requestId);
        } else {
          await packingMaterialsService.rejectPurchaseRequest(requestId);
        }
      }

      // Reload data after approval/rejection
      loadDashboardData();
    } catch (err) {
      console.error('Error processing approval:', err);
      setError('Failed to process approval. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Error Display */}
      {error && (
        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800 font-medium">Error:</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Head of Operations Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor and manage all operational activities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Material Requests</p>
              <p className="text-2xl font-bold text-blue-600">{dashboardData.pendingMaterialRequests}</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Product Requests</p>
              <p className="text-2xl font-bold text-green-600">{dashboardData.pendingProductRequests}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Packing Requests</p>
              <p className="text-2xl font-bold text-purple-600">{dashboardData.pendingPackingMaterialRequests}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
              <p className="text-2xl font-bold text-orange-600">{dashboardData.activeSuppliers}</p>
            </div>
            <Users className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending GRNs</p>
              <p className="text-2xl font-bold text-red-600">{dashboardData.pendingGRNs}</p>
            </div>
            <ClipboardList className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Approvals */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h3>
          {pendingApprovals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending approvals at the moment</p>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map((request, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{request.title}</h4>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Pending
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Requested: {new Date(request.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproval(request.id, 'approve', request.type)}
                      className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(request.id, 'reject', request.type)}
                      className="flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          {recentActivities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activities</p>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-1 rounded-full ${
                    activity.status === 'approved' ? 'bg-green-100' :
                    activity.status === 'rejected' ? 'bg-red-100' :
                    'bg-yellow-100'
                  }`}>
                    {activity.status === 'approved' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : activity.status === 'rejected' ? (
                      <XCircle className="w-4 h-4 text-red-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/ho/approval-queue')}
          className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ClipboardList className="w-5 h-5 mr-2" />
          Approval Queue
        </button>
        <button
          onClick={() => navigate('/ho/request-history')}
          className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FileText className="w-5 h-5 mr-2" />
          Request History
        </button>
        <button
          onClick={() => navigate('/ho/supplier-monitoring')}
          className="flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <TrendingUp className="w-5 h-5 mr-2" />
          Supplier Monitoring
        </button>
      </div>
    </div>
  );
};

export default Dashboard;