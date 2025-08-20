import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Send, Archive, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const PackingAreaDashboard = () => {
  const navigate = useNavigate();
  
  const stats = [
    {
      name: 'Active Packing Lines',
      value: '4',
      change: '2 running at capacity',
      changeType: 'neutral',
      icon: Package,
      color: 'blue'
    },
    {
      name: 'Products to Pack',
      value: '156',
      change: 'From production',
      changeType: 'neutral',
      icon: Clock,
      color: 'yellow'
    },
    {
      name: 'Completed Today',
      value: '89',
      change: 'Units packed',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'green'
    },
    {
      name: 'Material Requests',
      value: '3',
      change: 'Pending from store',
      changeType: 'neutral',
      icon: AlertTriangle,
      color: 'red'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600'
  };

  const packingLines = [
    { id: 'LINE001', product: 'Product A - 500g', status: 'running', progress: 75, target: 200, completed: 150 },
    { id: 'LINE002', product: 'Product B - 1kg', status: 'running', progress: 45, target: 100, completed: 45 },
    { id: 'LINE003', product: 'Product C - 250g', status: 'setup', progress: 0, target: 150, completed: 0 },
    { id: 'LINE004', product: 'Product D - 2kg', status: 'maintenance', progress: 0, target: 0, completed: 0 }
  ];

  const quickActions = [
    {
      title: 'Request from Production',
      description: 'Request finished product batches',
      icon: Package,
      color: 'bg-blue-600 hover:bg-blue-700',
      path: '/packing-area/request-products'
    },
    {
      title: 'Request Packing Materials',
      description: 'Request materials from store',
      icon: Archive,
      color: 'bg-green-600 hover:bg-green-700',
      path: '/packing-area/request-materials'
    },
    {
      title: 'Dispatch to FG Store',
      description: 'Send packed products',
      icon: Send,
      color: 'bg-purple-600 hover:bg-purple-700',
      path: '/packing-area/dispatch'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Package className="h-8 w-8 mr-3 text-blue-600" />
          Packing Area Dashboard
        </h1>
        <p className="text-gray-600">Manage packing operations and material flow.</p>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Packing Line Status</h3>
          <div className="space-y-4">
            {packingLines.map((line) => (
              <div key={line.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{line.id}</p>
                    <p className="text-sm text-gray-500">{line.product}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    line.status === 'running' ? 'bg-green-100 text-green-800' :
                    line.status === 'setup' ? 'bg-yellow-100 text-yellow-800' :
                    line.status === 'maintenance' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {line.status}
                  </span>
                </div>
                {line.status === 'running' && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress: {line.completed}/{line.target}</span>
                      <span>{line.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{width: `${line.progress}%`}}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default PackingAreaDashboard;