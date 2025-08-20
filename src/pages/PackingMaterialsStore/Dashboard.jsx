import React from 'react';
import { Archive, Package, Send, ShoppingCart } from 'lucide-react';

const PackingMaterialsStoreDashboard = () => {
  const stats = [
    {
      name: 'Total Stock',
      value: '2,847',
      change: 'Units available',
      changeType: 'neutral',
      icon: Archive,
      color: 'blue'
    },
    {
      name: 'Low Stock Items',
      value: '3',
      change: 'Need reorder',
      changeType: 'negative',
      icon: Package,
      color: 'red'
    },
    {
      name: 'Sent to Packing',
      value: '156',
      change: 'This week',
      changeType: 'positive',
      icon: Send,
      color: 'green'
    },
    {
      name: 'Purchase Requests',
      value: '2',
      change: 'Pending approval',
      changeType: 'neutral',
      icon: ShoppingCart,
      color: 'yellow'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  };

  const inventory = [
    { material: 'Cardboard Boxes - Small', stock: 450, reorderLevel: 100, location: 'A1-B2' },
    { material: 'Cardboard Boxes - Medium', stock: 320, reorderLevel: 80, location: 'A1-B3' },
    { material: 'Cardboard Boxes - Large', stock: 180, reorderLevel: 50, location: 'A1-B4' },
    { material: 'Bubble Wrap Rolls', stock: 25, reorderLevel: 30, location: 'B2-C1' },
    { material: 'Packing Tape', stock: 89, reorderLevel: 25, location: 'B2-C2' },
    { material: 'Labels - Product', stock: 1200, reorderLevel: 200, location: 'C1-A1' }
  ];

  const recentActivities = [
    { action: 'Sent 50 small boxes to packing area', time: '2 hours ago', type: 'send' },
    { action: 'Received bubble wrap delivery', time: '4 hours ago', type: 'receive' },
    { action: 'Purchase request for labels submitted', time: '1 day ago', type: 'request' },
    { action: 'Stock count completed for Section A', time: '2 days ago', type: 'count' }
  ];

  return (
    <div className="p-6">
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Inventory</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-semibold text-gray-900">Material</th>
                  <th className="text-left py-2 text-sm font-semibold text-gray-900">Stock</th>
                  <th className="text-left py-2 text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-gray-900">{item.material}</p>
                        <p className="text-sm text-gray-500">{item.location}</p>
                      </div>
                    </td>
                    <td className="py-3 text-gray-900">{item.stock}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.stock <= item.reorderLevel ? 'bg-red-100 text-red-800' :
                        item.stock <= item.reorderLevel * 2 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.stock <= item.reorderLevel ? 'Low' :
                         item.stock <= item.reorderLevel * 2 ? 'Medium' : 'Good'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-1 rounded-full ${
                  activity.type === 'send' ? 'bg-blue-100' :
                  activity.type === 'receive' ? 'bg-green-100' :
                  activity.type === 'request' ? 'bg-yellow-100' :
                  'bg-purple-100'
                }`}>
                  {activity.type === 'send' && <Send className="h-4 w-4 text-blue-600" />}
                  {activity.type === 'receive' && <Package className="h-4 w-4 text-green-600" />}
                  {activity.type === 'request' && <ShoppingCart className="h-4 w-4 text-yellow-600" />}
                  {activity.type === 'count' && <Archive className="h-4 w-4 text-purple-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
          <Archive className="h-5 w-5" />
          <span>View Stock List</span>
        </button>
        <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
          <Send className="h-5 w-5" />
          <span>Send to Packing Area</span>
        </button>
        <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
          <ShoppingCart className="h-5 w-5" />
          <span>Request Purchase</span>
        </button>
      </div>
    </div>
  );
};

export default PackingMaterialsStoreDashboard;