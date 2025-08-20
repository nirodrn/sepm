import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Users, TrendingUp, Eye, CheckSquare, X, AlertTriangle, Package, FileText } from 'lucide-react';
import { requestService } from '../../services/requestService';
import { supplierService } from '../../services/supplierService';
import { grnService } from '../../services/grnService';

const HeadOfOperationsDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [pendingMaterialRequests, setPendingMaterialRequests] = useState([]);
  const [pendingProductRequests, setPendingProductRequests] = useState([]);
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [materialRequests, productRequests, suppliers, grns] = await Promise.all([
        requestService.getMaterialRequests({ status: 'pending' }),
        requestService.getProductRequests({ status: 'pending' }),
        supplierService.getSuppliers(),
        grnService.getGRNs()
      ]);

      const pendingMaterialCount = materialRequests.length;
      const pendingProductCount = productRequests.length;
      const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
      
      // Calculate approvals this week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const approvedThisWeek = await requestService.getMaterialRequests({ 
        status: 'ho_approved',
        dateFrom: weekStart.getTime()
      });

      setStats([
        {
          name: 'Pending Material Requests',
          value: pendingMaterialCount.toString(),
          change: 'Awaiting HO approval',
          changeType: 'neutral',
          icon: Clock,
          color: 'yellow'
        },
        {
          name: 'Pending Product Requests',
          value: pendingProductCount.toString(),
          change: 'From DRs/Distributors',
          changeType: 'neutral',
          icon: Users,
          color: 'blue'
        },
        {
          name: 'Active Suppliers',
          value: activeSuppliers.toString(),
          change: 'Performance monitoring',
          changeType: 'neutral',
          icon: TrendingUp,
          color: 'green'
        },
        {
          name: 'Approved This Week',
          value: approvedThisWeek.length.toString(),
          change: 'Requests processed',
          changeType: 'positive',
          icon: CheckCircle,
          color: 'purple'
        }
      ]);

      setPendingMaterialRequests(materialRequests);
      setPendingProductRequests(productRequests);

      // Recent deliveries with QC results
      const recentGRNs = grns.slice(0, 5).map(grn => ({
        ...grn,
        supplierName: suppliers.find(s => s.id === grn.supplierId)?.name || 'Unknown',
        qcStatus: grn.status,
        deliveryDate: new Date(grn.deliveryDate).toLocaleDateString()
      }));
      
      setRecentDeliveries(recentGRNs);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMaterialRequest = async (requestId) => {
    const notes = prompt('Add approval notes (optional):');
    try {
      await requestService.approveRequest(requestId, { notes: notes || 'Approved by HO' });
      await loadDashboardData();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRejectMaterialRequest = async (requestId) => {
    const reason = prompt('Please provide rejection reason:');
    if (reason) {
      try {
        await requestService.rejectRequest(requestId, { reason });
        await loadDashboardData();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleApproveProductRequest = async (requestId) => {
    const notes = prompt('Add approval notes (optional):');
    try {
      await requestService.approveProductRequest(requestId, { notes: notes || 'Approved by HO' });
      await loadDashboardData();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRejectProductRequest = async (requestId) => {
    const reason = prompt('Please provide rejection reason:');
    if (reason) {
      try {
        await requestService.rejectProductRequest(requestId, { reason });
        await loadDashboardData();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const colorClasses = {
    yellow: 'bg-yellow-100 text-yellow-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  const getQCStatusColor = (status) => {
    switch (status) {
      case 'qc_passed':
        return 'bg-green-100 text-green-800';
      case 'qc_failed':
        return 'bg-red-100 text-red-800';
      case 'pending_qc':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
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
          Head of Operations Dashboard
        </h1>
        <p className="text-gray-600">Central approval authority and operations coordinator</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color]}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-600">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: Eye },
              { id: 'material-approvals', name: 'Material Approvals', icon: Package },
              { id: 'product-approvals', name: 'Product Approvals', icon: FileText },
              { id: 'supplier-monitoring', name: 'Supplier Monitoring', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Supplier Deliveries</h3>
                <div className="space-y-4">
                  {recentDeliveries.map((delivery, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium text-gray-900">{delivery.supplierName}</p>
                        <p className="text-sm text-gray-500">GRN: {delivery.grnNumber} • {delivery.deliveryDate}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQCStatusColor(delivery.qcStatus)}`}>
                        {delivery.qcStatus?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveTab('material-approvals')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg flex items-center justify-between transition-colors"
                  >
                    <span>Review Material Requests</span>
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                      {pendingMaterialRequests.length}
                    </span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('product-approvals')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg flex items-center justify-between transition-colors"
                  >
                    <span>Review Product Requests</span>
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                      {pendingProductRequests.length}
                    </span>
                  </button>
                  <button 
                    onClick={() => navigate('/reports/supplier-performance')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    <span>Supplier Performance</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'material-approvals' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Material Request Approvals</h3>
                <span className="text-sm text-gray-500">
                  {pendingMaterialRequests.length} pending requests
                </span>
              </div>
              
              <div className="space-y-4">
                {pendingMaterialRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-6 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Package className="h-5 w-5 text-blue-600" />
                          <h4 className="font-semibold text-gray-900">
                            {request.requestType === 'rawMaterial' ? 'Raw Material' : 'Packing Material'} Request
                          </h4>
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                            Pending HO Approval
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Requested Material:</p>
                            <p className="font-medium text-gray-900">{request.items?.[0]?.materialName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Quantity:</p>
                            <p className="font-medium text-gray-900">
                              {request.items?.[0]?.quantity} {request.items?.[0]?.unit}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Requested By:</p>
                            <p className="font-medium text-gray-900">{request.requesterName || 'Warehouse Staff'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Request Date:</p>
                            <p className="font-medium text-gray-900">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {request.items?.[0]?.reason && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-500">Purpose:</p>
                            <p className="text-gray-700">{request.items[0].reason}</p>
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            request.items?.[0]?.urgency === 'urgent' ? 'bg-red-100 text-red-800' :
                            request.items?.[0]?.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {request.items?.[0]?.urgency?.toUpperCase() || 'NORMAL'} Priority
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleApproveMaterialRequest(request.id)}
                          className="text-green-600 hover:text-green-800 p-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                          title="Approve & Forward to MD"
                        >
                          <CheckSquare className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleRejectMaterialRequest(request.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                          title="Reject Request"
                        >
                          <X className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/approvals/material-requests/${request.id}`)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {pendingMaterialRequests.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pending material requests</h3>
                    <p className="mt-1 text-sm text-gray-500">All material requests have been processed</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'product-approvals' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Product Request Approvals</h3>
                <span className="text-sm text-gray-500">
                  {pendingProductRequests.length} pending requests
                </span>
              </div>
              
              <div className="space-y-4">
                {pendingProductRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-6 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <FileText className="h-5 w-5 text-green-600" />
                          <h4 className="font-semibold text-gray-900">Product Distribution Request</h4>
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Pending HO Approval
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Requested Product:</p>
                            <p className="font-medium text-gray-900">{request.productName || 'Product Details'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Quantity:</p>
                            <p className="font-medium text-gray-900">{request.quantity || 'N/A'} units</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Requester Type:</p>
                            <p className="font-medium text-gray-900">
                              {request.requesterType === 'DR' ? 'Direct Representative' :
                               request.requesterType === 'Distributor' ? 'Distributor' :
                               request.requesterType === 'DS' ? 'Direct Showroom' : 'Unknown'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Request Date:</p>
                            <p className="font-medium text-gray-900">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {request.notes && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-500">Notes:</p>
                            <p className="text-gray-700">{request.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleApproveProductRequest(request.id)}
                          className="text-green-600 hover:text-green-800 p-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                          title="Approve Request"
                        >
                          <CheckSquare className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleRejectProductRequest(request.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                          title="Reject Request"
                        >
                          <X className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/approvals/product-requests/${request.id}`)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {pendingProductRequests.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pending product requests</h3>
                    <p className="mt-1 text-sm text-gray-500">All product requests have been processed</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'supplier-monitoring' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Supplier Performance Monitoring</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Recent QC Results by Supplier</h4>
                  <div className="space-y-3">
                    {recentDeliveries.map((delivery, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{delivery.supplierName}</p>
                          <p className="text-sm text-gray-500">Delivery: {delivery.deliveryDate}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQCStatusColor(delivery.qcStatus)}`}>
                            {delivery.qcStatus?.replace('_', ' ').toUpperCase()}
                          </span>
                          {delivery.qcData?.overallGrade && (
                            <p className="text-xs text-gray-500 mt-1">Grade: {delivery.qcData.overallGrade}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Supplier Alerts</h4>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Price Variance Alert</p>
                        <p className="text-xs text-yellow-600">Supplier A: +15% price increase detected</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Quality Issue</p>
                        <p className="text-xs text-red-600">Supplier B: 2 consecutive QC failures</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Delivery Delay</p>
                        <p className="text-xs text-blue-600">Supplier C: 3 days overdue</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => navigate('/approvals/history')}
          className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <Clock className="h-5 w-5" />
          <span>Request History</span>
        </button>
        <button 
          onClick={() => navigate('/reports/supplier-performance')}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <TrendingUp className="h-5 w-5" />
          <span>Supplier Reports</span>
        </button>
        <button 
          onClick={() => navigate('/reports/material-flow')}
          className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <Package className="h-5 w-5" />
          <span>Material Flow Analysis</span>
        </button>
      </div>
    </div>
  );
};

export default HeadOfOperationsDashboard;