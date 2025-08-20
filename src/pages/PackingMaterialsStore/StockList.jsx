import React, { useState } from 'react';
import { Archive, Search, Filter, Edit, Plus } from 'lucide-react';

const StockList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const inventory = [
    { 
      id: 1, 
      material: 'Cardboard Boxes - Small', 
      stock: 450, 
      reorderLevel: 100, 
      location: 'A1-B2', 
      supplier: 'ABC Packaging',
      lastUpdated: '2025-01-15'
    },
    { 
      id: 2, 
      material: 'Cardboard Boxes - Medium', 
      stock: 320, 
      reorderLevel: 80, 
      location: 'A1-B3', 
      supplier: 'ABC Packaging',
      lastUpdated: '2025-01-15'
    },
    { 
      id: 3, 
      material: 'Cardboard Boxes - Large', 
      stock: 180, 
      reorderLevel: 50, 
      location: 'A1-B4', 
      supplier: 'ABC Packaging',
      lastUpdated: '2025-01-14'
    },
    { 
      id: 4, 
      material: 'Bubble Wrap Rolls', 
      stock: 25, 
      reorderLevel: 30, 
      location: 'B2-C1', 
      supplier: 'Protective Materials Ltd',
      lastUpdated: '2025-01-13'
    },
    { 
      id: 5, 
      material: 'Packing Tape', 
      stock: 89, 
      reorderLevel: 25, 
      location: 'B2-C2', 
      supplier: 'Adhesive Solutions',
      lastUpdated: '2025-01-15'
    },
    { 
      id: 6, 
      material: 'Labels - Product', 
      stock: 1200, 
      reorderLevel: 200, 
      location: 'C1-A1', 
      supplier: 'Label Pro',
      lastUpdated: '2025-01-14'
    }
  ];

  const getStatusInfo = (stock, reorderLevel) => {
    if (stock <= reorderLevel) {
      return { status: 'Low', color: 'bg-red-100 text-red-800' };
    } else if (stock <= reorderLevel * 2) {
      return { status: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: 'Good', color: 'bg-green-100 text-green-800' };
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!filterStatus) return matchesSearch;
    
    const statusInfo = getStatusInfo(item.stock, item.reorderLevel);
    return matchesSearch && statusInfo.status === filterStatus;
  });

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Archive className="h-8 w-8 mr-3 text-blue-600" />
              Stock List
            </h1>
            <p className="text-gray-600 mt-2">Manage packing materials inventory</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Material</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search materials or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="Good">Good</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Material
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reorder Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => {
                const statusInfo = getStatusInfo(item.stock, item.reorderLevel);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.material}</div>
                        <div className="text-sm text-gray-500">Last updated: {item.lastUpdated}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.reorderLevel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                        {statusInfo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.supplier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Edit Material"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <Archive className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No materials found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus ? 'Try adjusting your search criteria.' : 'Get started by adding materials.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockList;