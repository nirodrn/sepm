import React from 'react';
import { Factory, PlayCircle, PauseCircle, CheckCircle2 } from 'lucide-react';

const ProductionDashboard = () => {
  const stats = [
    {
      name: 'Active Batches',
      value: '6',
      change: '2 in mixing',
      changeType: 'neutral',
      icon: PlayCircle,
      color: 'blue'
    },
    {
      name: 'Completed Today',
      value: '4',
      change: '+1 vs yesterday',
      changeType: 'positive',
      icon: CheckCircle2,
      color: 'green'
    },
    {
      name: 'On Hold',
      value: '2',
      change: 'QC pending',
      changeType: 'neutral',
      icon: PauseCircle,
      color: 'yellow'
    },
    {
      name: 'Total Production',
      value: '2,450kg',
      change: 'This month',
      changeType: 'neutral',
      icon: Factory,
      color: 'purple'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  const batches = [
    { id: 'BATCH001', product: 'Product A', stage: 'Mixing', progress: 25, status: 'active' },
    { id: 'BATCH002', product: 'Product B', stage: 'Heating', progress: 60, status: 'active' },
    { id: 'BATCH003', product: 'Product C', stage: 'Cooling', progress: 90, status: 'active' },
    { id: 'BATCH004', product: 'Product A', stage: 'QC', progress: 100, status: 'qc' }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Production Dashboard</h1>
        <p className="text-gray-600">Monitor production batches and manufacturing processes.</p>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Production Batches</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Batch ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Product</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Current Stage</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Progress</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-blue-600">{batch.id}</td>
                  <td className="py-3 px-4 text-gray-900">{batch.product}</td>
                  <td className="py-3 px-4 text-gray-600">{batch.stage}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{width: `${batch.progress}%`}}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{batch.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      batch.status === 'active' ? 'bg-green-100 text-green-800' :
                      batch.status === 'qc' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {batch.status === 'active' ? 'Active' :
                       batch.status === 'qc' ? 'QC Pending' : 'Unknown'}
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

export default ProductionDashboard;