import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TruckIcon, Save, ArrowLeft, Plus, Trash2, Calculator } from 'lucide-react';
import { supplierService } from '../../../services/supplierService';
import { requestService } from '../../../services/requestService';

const SupplierAllocation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const requestData = location.state?.request;
  
  const [allocations, setAllocations] = useState([
    { id: 1, supplierId: '', quantity: '', unitPrice: '', deliveryDate: '', notes: '' }
  ]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const supplierData = await supplierService.getSuppliers();
      setSuppliers(supplierData.filter(s => s.status === 'active'));
    } catch (error) {
      setError('Failed to load suppliers');
    }
  };

  const addAllocation = () => {
    const newId = Math.max(...allocations.map(a => a.id)) + 1;
    setAllocations([
      ...allocations,
      { id: newId, supplierId: '', quantity: '', unitPrice: '', deliveryDate: '', notes: '' }
    ]);
  };

  const removeAllocation = (id) => {
    if (allocations.length > 1) {
      setAllocations(allocations.filter(a => a.id !== id));
    }
  };

  const updateAllocation = (id, field, value) => {
    setAllocations(allocations.map(allocation =>
      allocation.id === id ? { ...allocation, [field]: value } : allocation
    ));
  };

  const getTotalAllocated = () => {
    return allocations.reduce((sum, allocation) => sum + (parseInt(allocation.quantity) || 0), 0);
  };

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Select Supplier';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const allocationData = {
        requestId: requestData?.id,
        materialName: requestData?.items?.[0]?.materialName,
        totalQuantity: requestData?.items?.[0]?.quantity,
        allocations: allocations.map(allocation => ({
          supplierId: allocation.supplierId,
          quantity: parseInt(allocation.quantity),
          unitPrice: parseFloat(allocation.unitPrice) || 0,
          deliveryDate: allocation.deliveryDate,
          notes: allocation.notes
        }))
      };
      
      // Save allocation data
      await requestService.createSupplierAllocation(allocationData);
      navigate('/warehouse/raw-materials');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/warehouse/raw-materials')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <TruckIcon className="h-8 w-8 mr-3 text-blue-600" />
              Supplier Allocation
            </h1>
            <p className="text-gray-600 mt-2">Allocate approved material request across suppliers</p>
          </div>
        </div>
      </div>

      {requestData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900">Request Details</h3>
          <p className="text-blue-700 text-sm">
            Material: {requestData.items?.[0]?.materialName} | 
            Total Quantity: {requestData.items?.[0]?.quantity} {requestData.items?.[0]?.unit}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-6xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Supplier Allocations</h2>
            <button
              type="button"
              onClick={addAllocation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Supplier</span>
            </button>
          </div>

          <div className="space-y-6">
            {allocations.map((allocation, index) => (
              <div key={allocation.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Supplier {index + 1}</h3>
                  {allocations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAllocation(allocation.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier *
                    </label>
                    <select
                      value={allocation.supplierId}
                      onChange={(e) => updateAllocation(allocation.id, 'supplierId', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select supplier</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={allocation.quantity}
                      onChange={(e) => updateAllocation(allocation.id, 'quantity', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter quantity"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={allocation.unitPrice}
                      onChange={(e) => updateAllocation(allocation.id, 'unitPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Delivery
                    </label>
                    <input
                      type="date"
                      value={allocation.deliveryDate}
                      onChange={(e) => updateAllocation(allocation.id, 'deliveryDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows={2}
                    value={allocation.notes}
                    onChange={(e) => updateAllocation(allocation.id, 'notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add supplier-specific notes..."
                  />
                </div>

                <div className="mt-3 flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Supplier: {getSupplierName(allocation.supplierId)}
                  </span>
                  {allocation.unitPrice && allocation.quantity && (
                    <span className="text-sm font-medium text-gray-900 flex items-center">
                      <Calculator className="h-4 w-4 mr-1" />
                      Total: ${(parseFloat(allocation.unitPrice) * parseInt(allocation.quantity)).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-600">Total Allocated:</span>
                <span className="text-lg font-semibold text-gray-900 ml-2">
                  {getTotalAllocated()} / {requestData?.items?.[0]?.quantity || 0} {requestData?.items?.[0]?.unit}
                </span>
              </div>
              {requestData?.items?.[0]?.quantity && (
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    getTotalAllocated() === requestData.items[0].quantity ? 'text-green-600' :
                    getTotalAllocated() > requestData.items[0].quantity ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {getTotalAllocated() === requestData.items[0].quantity ? 'Fully Allocated' :
                     getTotalAllocated() > requestData.items[0].quantity ? 'Over Allocated' :
                     'Partially Allocated'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/warehouse/raw-materials')}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || getTotalAllocated() !== (requestData?.items?.[0]?.quantity || 0)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : 'Save Allocation'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupplierAllocation;