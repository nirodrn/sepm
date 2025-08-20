import React from 'react';
import { Users, Package, TruckIcon, BarChart3 } from 'lucide-react';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { userService } from '../../services/userService';
import { materialService } from '../../services/materialService';
import { supplierService } from '../../services/supplierService';

const AdminDashboard = () => {
  const [stats, setStats] = React.useState([]);
  const [recentActivities, setRecentActivities] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [users, rawMaterials, packingMaterials, suppliers] = await Promise.all([
        userService.getAllUsers(),
        materialService.getRawMaterials(),
        materialService.getPackingMaterials(),
        supplierService.getSuppliers()
      ]);

      const activeUsers = users.filter(u => u.status === 'active').length;
      const totalMaterials = rawMaterials.length + packingMaterials.length;
      const activeSuppliers = suppliers.filter(s => s.status === 'active').length;

      setStats([
        {
          name: 'Total Users',
          value: activeUsers.toString(),
          change: 'Active accounts',
          changeType: 'neutral',
          icon: Users
        },
        {
          name: 'Total Materials',
          value: totalMaterials.toString(),
          change: `${rawMaterials.length} raw, ${packingMaterials.length} packing`,
          changeType: 'neutral',
          icon: Package
        },
        {
          name: 'Active Suppliers',
          value: activeSuppliers.toString(),
          change: 'Verified suppliers',
          changeType: 'neutral',
          icon: TruckIcon
        },
        {
          name: 'System Status',
          value: 'Online',
          change: 'All systems operational',
          changeType: 'positive',
          icon: BarChart3
        }
      ]);

      // Load recent activities
      setRecentActivities([
        { action: 'New user registered', user: 'System', time: '2 hours ago', type: 'user' },
        { action: 'Material request submitted', user: 'Warehouse Staff', time: '4 hours ago', type: 'request' },
        { action: 'QC completed for Raw Material A', user: 'QC Officer', time: '6 hours ago', type: 'qc' }
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500"> vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'user' ? 'bg-green-500' :
                  activity.type === 'request' ? 'bg-blue-500' :
                  activity.type === 'qc' ? 'bg-purple-500' :
                  'bg-gray-500'
                }`}></div>
                <span className="text-gray-600">{activity.action}</span>
                <span className="text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database Status</span>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Response Time</span>
              <span className="text-sm font-medium text-gray-900">124ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Sessions</span>
              <span className="text-sm font-medium text-gray-900">18</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;