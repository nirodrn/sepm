import React from 'react';
import { Package, AlertTriangle, CheckCircle, Clock, FileText, Receipt, TruckIcon, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { requestService } from '../../services/requestService';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import { invoiceService } from '../../services/invoiceService';
import { inventoryService } from '../../services/inventoryService';

const WarehouseOperationsDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = React.useState([]);
  const [recentActivities, setRecentActivities] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [requests, pos, invoices, lowStockAlerts] = await Promise.all([
        requestService.getMaterialRequests({ status: 'pending' }),
        purchaseOrderService.getPOs(),
        invoiceService.getInvoices({ status: 'pending' }),
        inventoryService.getLowStockAlerts()
      ]);

      setStats([
        {
          name: 'Pending Requests',
          value: requests.length.toString(),
          change: 'Awaiting approval',
          changeType: 'neutral',
          icon: Clock,
          color: 'yellow'
        },
        {
          name: 'Active POs',
          value: pos.filter(po => ['issued', 'partially_received'].includes(po.status)).length.toString(),
          change: 'In progress',
          changeType: 'neutral',
          icon: FileText,
          color: 'blue'
        },
        {
          name: 'Pending Invoices',
          value: invoices.length.toString(),
          change: 'Awaiting payment',
          changeType: 'neutral',
          icon: Receipt,
          color: 'purple'
        },
        {
          name: 'Low Stock Items',
          value: lowStockAlerts.length.toString(),
          change: 'Requires attention',
          changeType: lowStockAlerts.length > 0 ? 'negative' : 'neutral',
          icon: AlertTriangle,
          color: 'red'
        }
      ]);

      // Create recent activities
      const activities = [
        ...requests.slice(0, 2).map(req => ({
          action: `Material request submitted`,
          details: `${req.items?.[0]?.materialName || 'Multiple items'}`,
          time: new Date(req.createdAt).toLocaleDateString(),
          type: 'request'
        })),
        ...pos.slice(0, 2).map(po => ({
          action: `PO ${po.status === 'issued' ? 'issued' : 'updated'}`,
          details: po.poNumber,
          time: new Date(po.updatedAt).toLocaleDateString(),
          type: 'po'
        }))
      ];

      setRecentActivities(activities);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const colorClasses = {
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600'
  };

  const quickActions = [
    {
      title: 'Request Raw Materials',
      description: 'Submit new material request',
      icon: Package,
      color: 'bg-blue-600 hover:bg-blue-700',
      path: '/warehouse/raw-materials/request'
    },
    {
      title: 'Create Purchase Order',
      description: 'Create PO for approved request',
      icon: FileText,
      color: 'bg-green-600 hover:bg-green-700',
      path: '/warehouse/purchase-orders/create'
    },
    {
      title: 'Record Payment',
      description: 'Record supplier payment',
      icon: CreditCard,
      color: 'bg-purple-600 hover:bg-purple-700',
      path: '/warehouse/invoices'
    },
    {
      title: 'View Suppliers',
      description: 'Manage supplier information',
      icon: TruckIcon,
      color: 'bg-orange-600 hover:bg-orange-700',
      path: '/warehouse/suppliers'
    }
  ];

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
        <h1 className="text-3xl font-bold text-gray-900">Warehouse Operations</h1>
        <p className="text-gray-600">Manage materials, suppliers, and warehouse operations.</p>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="space-y-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className={`w-full p-4 rounded-lg text-white text-left transition-colors ${action.color}`}
              >
                <div className="flex items-center space-x-3">
                  <action.icon className="h-6 w-6" />
                  <div>
                    <h4 className="font-medium">{action.title}</h4>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-full ${
                  activity.type === 'request' ? 'bg-blue-100' :
                  activity.type === 'po' ? 'bg-green-100' :
                  activity.type === 'payment' ? 'bg-purple-100' :
                  'bg-gray-100'
                }`}>
                  {activity.type === 'request' && <Package className="h-4 w-4 text-blue-600" />}
                  {activity.type === 'po' && <FileText className="h-4 w-4 text-green-600" />}
                  {activity.type === 'payment' && <Receipt className="h-4 w-4 text-purple-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.details} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseOperationsDashboard;