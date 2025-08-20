import React, { useState } from 'react';
import { Archive, Search, Filter, Plus, Eye, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PackingMaterialsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const packingMaterials = [
    {
      id: 1,
      name: 'Cardboard Boxes - Small',
      code: 'PM001',
      category: 'Primary Packaging',
      currentStock: 450,
      reorderLevel: 100,
      unit: 'pieces',
      supplier: 'Quality Packaging Solutions',
      lastReceived: '2025-01-12',
      qualityGrade: 'A',
      pricePerUnit: 0.85,
      status: 'active'
    },
    {
      id: 2,
      name: 'Bubble Wrap Rolls',
      code: 'PM002',
      category: 'Protective Materials',
      currentStock: 25,
      reorderLevel: 30,
      unit: 'rolls',
      supplier: 'Protective Materials Ltd',
      lastReceived: '2025-01-08',
      qualityGrade: 'A',
      pricePerUnit: 15.50,
      status: 'active'
    },
    {
      id: 3,
      name: 'Labels - Product',
      code: 'PM003',
      category: 'Labels',
      currentStock: 1200,
      reorderLevel: 200,
      unit: 'sheets',
      supplier: 'Label Pro',
      lastReceived: '2025-01-14',
      qualityGrade: 'A',
      pricePerUnit: 0.12,
      status: 'active'
    },
    {
      id: 4,
      name: 'Packing Tape',
      code: 'PM004',
      category: 'Sealing Materials',
      currentStock: 89,
      reorderLevel: 25,
      unit: 'rolls',
      supplier: 'Adhesive Solutions',
      lastReceived: '2025-01-10',
      qualityGrade: 'B',
      pricePerUnit: 3.25,
      status: 'active'
    }
  ];

  const getStockStatus = (current, reorder) => {
    if (current <= reorder) return { status: 'Low', color: 'bg-red-100 text-red-800' };
    if (current <= reorder * 2) return { status: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'Good', color: 'bg-green-100 text-green-800' };
  };

  const getQualityColor = (grade) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMaterials = packingMaterials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!filterStatus) return matchesSearch;
    
    const stockStatus = getStockStatus(material.currentStock, material.reorderLevel);
    return matchesSearch && stockStatus.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Archive className="h-8 w-8 mr-3 text-green-600" />
              Packing Materials
            </h1>
            <p className="text-gray-600 mt-2">Manage packing material inventory and stock levels</p>
          </div>
          <button
            onClick={() => navigate('/warehouse/packing-materials/request')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Request Material</span>
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
                placeholder="Search packing materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Status</option>
                <option value="good">Good Stock</option>
                <option value="medium">Medium Stock</option>
                <option value="low">Low Stock</option>
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
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price/Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Received
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMaterials.map((material) => {
                const stockStatus = getStockStatus(material.currentStock, material.reorderLevel);
                return (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{material.name}</div>
                        <div className="text-sm text-gray-500">{material.code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {material.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">{material.currentStock} {material.unit}</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                          {stockStatus.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQualityColor(material.qualityGrade)}`}>
                        Grade {material.qualityGrade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {material.supplier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${material.pricePerUnit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {material.lastReceived}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/warehouse/packing-materials/${material.id}`)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/warehouse/packing-materials/${material.id}/qc`)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="QC Form"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMaterials.length === 0 && (
          <div className="text-center py-12">
            <Archive className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No materials found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus ? 'Try adjusting your search criteria.' : 'Get started by requesting materials.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackingMaterialsList;