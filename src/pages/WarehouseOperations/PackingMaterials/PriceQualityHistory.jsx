import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ArrowLeft, Calendar, Filter, Download } from 'lucide-react';

const PackingMaterialPriceQualityHistory = () => {
  const navigate = useNavigate();
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [dateRange, setDateRange] = useState('6months');

  const materials = ['Cardboard Boxes - Small', 'Bubble Wrap Rolls', 'Labels - Product', 'Packing Tape'];
  const suppliers = ['Quality Packaging Solutions', 'Protective Materials Ltd', 'Label Pro', 'Adhesive Solutions'];

  const historyData = [
    {
      id: 1,
      date: '2025-01-15',
      material: 'Cardboard Boxes - Small',
      supplier: 'Quality Packaging Solutions',
      quantity: 1000,
      unitPrice: 0.85,
      totalCost: 850,
      qualityGrade: 'A',
      strength: 'Excellent',
      defectRate: 0.5,
      deliveryTime: 2
    },
    {
      id: 2,
      date: '2025-01-12',
      material: 'Bubble Wrap Rolls',
      supplier: 'Protective Materials Ltd',
      quantity: 50,
      unitPrice: 15.50,
      totalCost: 775,
      qualityGrade: 'A',
      strength: 'Excellent',
      defectRate: 0.2,
      deliveryTime: 3
    },
    {
      id: 3,
      date: '2025-01-10',
      material: 'Labels - Product',
      supplier: 'Label Pro',
      quantity: 2000,
      unitPrice: 0.12,
      totalCost: 240,
      qualityGrade: 'A',
      strength: 'Good',
      defectRate: 0.8,
      deliveryTime: 1
    },
    {
      id: 4,
      date: '2025-01-08',
      material: 'Cardboard Boxes - Small',
      supplier: 'Alternative Packaging Co.',
      quantity: 500,
      unitPrice: 0.78,
      totalCost: 390,
      qualityGrade: 'B',
      strength: 'Good',
      defectRate: 1.2,
      deliveryTime: 4
    },
    {
      id: 5,
      date: '2025-01-05',
      material: 'Packing Tape',
      supplier: 'Adhesive Solutions',
      quantity: 100,
      unitPrice: 3.25,
      totalCost: 325,
      qualityGrade: 'B',
      strength: 'Good',
      defectRate: 1.5,
      deliveryTime: 3
    }
  ];

  const filteredData = historyData.filter(item => {
    if (selectedMaterial && item.material !== selectedMaterial) return false;
    if (selectedSupplier && item.supplier !== selectedSupplier) return false;
    return true;
  });

  const getQualityColor = (grade) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriceChange = (currentPrice, previousPrice) => {
    if (!previousPrice) return null;
    const change = ((currentPrice - previousPrice) / previousPrice) * 100;
    return {
      percentage: Math.abs(change).toFixed(1),
      direction: change >= 0 ? 'up' : 'down',
      color: change >= 0 ? 'text-red-600' : 'text-green-600'
    };
  };

  const calculateAverages = () => {
    if (filteredData.length === 0) return { avgPrice: 0, avgDefectRate: 0, avgDelivery: 0 };
    
    const avgPrice = filteredData.reduce((sum, item) => sum + item.unitPrice, 0) / filteredData.length;
    const avgDefectRate = filteredData.reduce((sum, item) => sum + item.defectRate, 0) / filteredData.length;
    const avgDelivery = filteredData.reduce((sum, item) => sum + item.deliveryTime, 0) / filteredData.length;
    
    return {
      avgPrice: avgPrice.toFixed(2),
      avgDefectRate: avgDefectRate.toFixed(1),
      avgDelivery: avgDelivery.toFixed(1)
    };
  };

  const averages = calculateAverages();

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/warehouse/packing-materials')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="h-8 w-8 mr-3 text-purple-600" />
              Packing Material Price & Quality History
            </h1>
            <p className="text-gray-600 mt-2">Track price trends and quality performance of packing materials</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">#</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Unit Price</p>
              <p className="text-2xl font-bold text-gray-900">${averages.avgPrice}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm font-bold">$</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Defect Rate</p>
              <p className="text-2xl font-bold text-gray-900">{averages.avgDefectRate}%</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-sm font-bold">!</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Delivery</p>
              <p className="text-2xl font-bold text-gray-900">{averages.avgDelivery} days</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-sm font-bold">⏱</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">All Materials</option>
                  {materials.map(material => (
                    <option key={material} value={material}>{material}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">All Suppliers</option>
                  {suppliers.map(supplier => (
                    <option key={supplier} value={supplier}>{supplier}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="1month">Last Month</option>
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                </select>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Defect Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((record, index) => {
                const previousRecord = filteredData[index + 1];
                const priceChange = previousRecord ? getPriceChange(record.unitPrice, previousRecord.unitPrice) : null;
                
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.material}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.supplier}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">${record.unitPrice}</span>
                        {priceChange && (
                          <span className={`text-xs ${priceChange.color}`}>
                            {priceChange.direction === 'up' ? '↑' : '↓'}{priceChange.percentage}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.totalCost.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQualityColor(record.qualityGrade)}`}>
                        Grade {record.qualityGrade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.defectRate}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.deliveryTime} days</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filter criteria to see more results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackingMaterialPriceQualityHistory;