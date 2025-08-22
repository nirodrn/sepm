import React, { useState, useEffect } from 'react';
import { Archive, Package, Send, ShoppingCart, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { packingMaterialsService } from '../../services/packingMaterialsService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const PackingMaterialsStoreDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [
        stockReport,
        internalRequests,
        purchaseRequests,
        dispatches,
        lowStock
      ] = await Promise.all([
        packingMaterialsService.getStockReport(),
        packingMaterialsService.getInternalRequests({ status: 'pending' }),
        packingMaterialsService.getPurchaseRequests(),
        packingMaterialsService.getDispatches(),
        packingMaterialsService.getLowStockAlerts()
      ]);

      const totalStock = stockReport.reduce((sum, item) => sum + item.currentStock, 0);
      const lowStockCount = lowStock.length;
      const weekStart = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const sentThisWeek = dispatches.filter(d => d.dispatchedAt >= weekStart).length;
      const pendingPurchaseRequests = purchaseRequests.filter(r => 
        ['pending_ho', 'pending_md'].includes(r.status)
      ).length;

      setStats([
        {
          name: 'Total Stock Items',
          value: stockReport.length.toString(),
          change: `${totalStock} total units`,
          changeType: 'neutral',
          icon: Archive,
          color: 'blue'
        },
        {
          name: 'Low Stock Items',
          value: lowStockCount.toString(),
          change: 'Need reorder',
          changeType: lowStockCount > 0 ? 'negative' : 'neutral',
          icon: AlertTriangle,
          color: 'red'
        },
        {
          name: 'Dispatched This Week',
          value: sentThisWeek.toString(),
          change: 'To packing area',
          changeType: 'positive',
          icon: Send,
          color: 'green'
        },
        {
          name: 'Purchase Requests',
          value: pendingPurchaseRequests.toString(),
          change: 'Pending approval',
          changeType: 'neutral',
          icon: ShoppingCart,
          color: 'yellow'
        }
      ]);

      setPendingRequests(internalRequests);
      setLowStockAlerts(lowStock);

      // Create recent activities from actual data
      const activities = [
        ...dispatches.slice(0, 2).map(dispatch => ({
          action: `Dispatched materials to ${dispatch.destination?.replace('line', 'Line ') || 'Packing Area'}`,
          details: `${dispatch.items?.length || 0} items`,
          time: new Date(dispatch.dispatchedAt).toLocaleDateString(),
          type: 'dispatch'
        })),
        ...internalRequests.slice(0, 2).map(request => ({
          action: `New request from Packing Area`,
          details: `${request.items?.length || 0} items requested`,
          time: new Date(request.createdAt).toLocaleDateString(),
          type: 'request'
        })),
        ...purchaseRequests.slice(0, 1).map(request => ({
          action: `Purchase request ${request.status?.replace('_', ' ')}`,
          details: `${request.items?.length || 0} items`,
          time: new Date(request.updatedAt).toLocaleDateString(),
          type: 'purchase'
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

      setRecentActivities(activities);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  };

  const handleFulfillRequest = async (requestId) => {
    try {
      navigate('/packing-materials/send', { state: { requestId } });
    } catch (error) {
      setError(error.message);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'dispatch':
        return <Send className="h-4 w-4 text-blue-600" />;
      case 'request':
        return <Package className="h-4 w-4 text-green-600" />;
      case 'purchase':
        return <ShoppingCart className="h-4 w-4 text-purple-600" />;
      default:
        return <Archive className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="p-6">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Archive className="h-8 w-8 mr-3 text-blue-600" />
          Packing Materials Store
        </h1>
        <p className="text-gray-600 mt-2">Manage packing materials inventory and distribution</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Internal Requests</h3>
            <button
              onClick={() => navigate('/packing-materials/requests/internal')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {pendingRequests.slice(0, 3).map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Request from Packing Area
                    </p>
                    <p className="text-sm text-gray-500">
                      {request.items?.length || 0} items • {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      ID: {request.id.slice(-8)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleFulfillRequest(request.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Fulfill
                  </button>
                </div>
              </div>
            ))}
            
            {pendingRequests.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-8 w-8 text-green-400" />
                <p className="mt-2 text-sm text-gray-500">No pending requests</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
            <button
              onClick={() => navigate('/packing-materials/request')}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Request Purchase
            </button>
          </div>
          <div className="space-y-4">
            {lowStockAlerts.slice(0, 4).map((alert) => (
              <div key={alert.materialId} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-900">{alert.materialName}</p>
                    <p className="text-sm text-red-700">
                      Current: {alert.currentStock} {alert.unit} • Reorder at: {alert.reorderLevel} {alert.unit}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Last updated: {new Date(alert.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    alert.alertLevel === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {alert.alertLevel}
                  </span>
                </div>
              </div>
            ))}
            
            {lowStockAlerts.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-8 w-8 text-green-400" />
                <p className="mt-2 text-sm text-gray-500">All stock levels are good</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
          <button
            onClick={() => navigate('/packing-materials/dispatches')}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View All Dispatches
          </button>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
          <button
            onClick={() => navigate('/packing-materials/dispatches')}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View All Dispatches
          </button>
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-1 rounded-full bg-gray-100">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.details} • {activity.time}</p>
              </div>
            </div>
          ))}
          
          {recentActivities.length === 0 && (
            <div className="text-center py-8">
              <Archive className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No recent activities</p>
            </div>
          )}
        </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <button 
          onClick={() => navigate('/packing-materials/stock')}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <Archive className="h-5 w-5" />
          <span>View Stock List</span>
        </button>
        <button 
          onClick={() => navigate('/packing-materials/send')}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <Send className="h-5 w-5" />
          <span>Send to Packing Area</span>
        </button>
        <button 
          onClick={() => navigate('/packing-materials/request')}
          className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <ShoppingCart className="h-5 w-5" />
          <span>Request Purchase</span>
        </button>
        <button 
          onClick={() => navigate('/packing-materials/requests/history')}
          className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <Clock className="h-5 w-5" />
          <span>Request History</span>
        </button>
      </div>
    </div>
  );
};

export default PackingMaterialsStoreDashboard;