import React from 'react';
import { Package, AlertTriangle, TruckIcon, BarChart } from 'lucide-react';

const FinishedGoodsStoreDashboard = () => {
  const stats = [
    {
      name: 'Total Inventory',
      value: '1,247',
      change: 'Units in stock',
      changeType: 'neutral',
      icon: Package,
      color: 'blue'
    },
    {
      name: 'Expiry Alerts',
      value: '8',
      change: 'Next 30 days',
      changeType: 'negative',
      icon: AlertTriangle,
      color: 'red'
    },
    {
      name: 'Pending Dispatches',
      value: '5',
      change: '2 urgent',
      changeType: 'neutral',
      icon: TruckIcon,
      color: 'yellow'
    },
    {
      name: 'Monthly Throughput',
      value: '2.4K',
      change: '+8% vs last month',
      changeType: 'positive',
      icon: BarChart,
      color: 'green'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600'
  };

  const inventory = [
    { product: 'Product A - 500g', stock: 245, reorderLevel: 50, location: 'A1-B2', expiry: '2025-06-15' },
    { product: 'Product B - 1kg', stock: 128, reorderLevel: 30, location: 'A2-C1', expiry: '2025-08-20' },
    { product: 'Product C - 250g', stock: 89, reorderLevel: 25, location: 'B1-A3', expiry: '2025-07-10' },
    { product: 'Product D - 2kg', stock: 156, reorderLevel: 40, location: 'C1-B2', expiry: '2025-09-05' }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Finished Goods Store</h1>
        <p className="text-gray-600">Manage inventory, dispatches, and stock levels.</p>
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

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Inventory Status</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Product</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Stock Level</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Location</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Expiry Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">{item.product}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900">{item.stock}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.stock <= item.reorderLevel ? 'bg-red-100 text-red-800' :
                        item.stock <= item.reorderLevel * 2 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.stock <= item.reorderLevel ? 'Low' :
                         item.stock <= item.reorderLevel * 2 ? 'Medium' : 'Good'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{item.location}</td>
                  <td className="py-3 px-4 text-gray-600">{item.expiry}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Available
                    </span>
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

export default FinishedGoodsStoreDashboard;