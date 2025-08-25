import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package, Save, ArrowLeft, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { auth } from '../../../firebase/auth';
import { grnService } from '../../../services/grnService';
import { purchaseOrderService } from '../../../services/purchaseOrderService';

const CreateGRN = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const poData = location.state?.po;
  
  const [formData, setFormData] = useState({
    poId: poData?.id || '',
    poNumber: poData?.poNumber || '',
    supplierId: poData?.supplierId || '',
    supplierName: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    receivedBy: auth.currentUser?.displayName || 'Warehouse Staff',
    packagingCondition: 'good',
    transportCondition: 'good',
    notes: '',
    items: poData?.items?.map(item => ({
      materialId: item.materialId,
      materialName: item.materialName,
      orderedQty: item.quantity,
      deliveredQty: 0,
      unit: item.unit,
      lotNumber: '',
      mfgDate: '',
      expiryDate: '',
      packagingType: '',
      condition: 'good'
    })) || []
  });
  
  const [pos, setPOs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!poData) {
      loadPOs();
    }
  }, []);

  const loadPOs = async () => {
    try {
      const poList = await purchaseOrderService.getPOs({ status: 'issued' });
      setPOs(poList);
    } catch (error) {
      setError('Failed to load purchase orders');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePOSelect = async (poId) => {
    try {
      const selectedPO = pos.find(po => po.id === poId);
      if (selectedPO) {
        setFormData(prev => ({
          ...prev,
          poId: selectedPO.id,
          poNumber: selectedPO.poNumber,
          supplierId: selectedPO.supplierId,
          items: selectedPO.items.map(item => ({
            materialId: item.materialId,
            materialName: item.materialName,
            orderedQty: item.quantity,
            deliveredQty: 0,
            unit: item.unit,
            lotNumber: '',
            mfgDate: '',
            expiryDate: '',
            packagingType: '',
            condition: 'good'
          }))
        }));
      }
    } catch (error) {
      setError('Failed to load PO details');
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const calculateVariances = () => {
    return formData.items.map(item => {
      const variance = (item.deliveredQty || 0) - (item.orderedQty || 0);
      const variancePercent = item.orderedQty ? (variance / item.orderedQty) * 100 : 0;
      return {
        ...item,
        variance,
        variancePercent,
        isOverDelivery: variance > 0,
        isShortDelivery: variance < 0
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const grnData = {
        ...formData,
        items: calculateVariances()
      };
      
      await grnService.createGRN(grnData);
      navigate('/warehouse/goods-receipts');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const variances = calculateVariances();
  const hasVariances = variances.some(item => Math.abs(item.variancePercent) > 5);

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/warehouse/goods-receipts')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Package className="h-8 w-8 mr-3 text-green-600" />
              Create Goods Receipt (GRN)
            </h1>
            <p className="text-gray-600 mt-2">Record delivery receipt against purchase order</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-6xl">
        {/* GRN Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Receipt Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!poData && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Order *
                </label>
                <select
                  value={formData.poId}
                  onChange={(e) => handlePOSelect(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select PO</option>
                  {pos.map(po => (
                    <option key={po.id} value={po.id}>{po.poNumber} - {getSupplierName(po.supplierId)}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Date *
              </label>
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Received By
              </label>
              <input
                type="text"
                name="receivedBy"
                value={formData.receivedBy}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Packaging Condition
              </label>
              <select
                name="packagingCondition"
                value={formData.packagingCondition}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="good">Good</option>
                <option value="damaged">Damaged</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transport Condition
              </label>
              <select
                name="transportCondition"
                value={formData.transportCondition}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="good">Good</option>
                <option value="damaged">Damaged</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Delivery notes or observations"
              />
            </div>
          </div>
        </div>

        {/* Received Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Received Items</h2>

          {hasVariances && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-yellow-800 font-medium">Delivery Variances Detected</p>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                Some items have significant quantity variances (>5%). Please verify and add notes.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {formData.items.map((item, index) => {
              const variance = variances[index];
              return (
                <div key={index} className={`border rounded-lg p-4 ${
                  Math.abs(variance?.variancePercent || 0) > 5 ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Material
                      </label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                        {item.materialName}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ordered Qty
                      </label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                        {item.orderedQty} {item.unit}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivered Qty *
                      </label>
                      <input
                        type="number"
                        value={item.deliveredQty}
                        onChange={(e) => handleItemChange(index, 'deliveredQty', parseFloat(e.target.value) || 0)}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lot/Batch Number *
                      </label>
                      <input
                        type="text"
                        value={item.lotNumber}
                        onChange={(e) => handleItemChange(index, 'lotNumber', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter lot number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Condition
                      </label>
                      <select
                        value={item.condition}
                        onChange={(e) => handleItemChange(index, 'condition', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="good">Good</option>
                        <option value="damaged">Damaged</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mfg Date
                      </label>
                      <input
                        type="date"
                        value={item.mfgDate}
                        onChange={(e) => handleItemChange(index, 'mfgDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={item.expiryDate}
                        onChange={(e) => handleItemChange(index, 'expiryDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Packaging Type
                      </label>
                      <input
                        type="text"
                        value={item.packagingType}
                        onChange={(e) => handleItemChange(index, 'packagingType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., Bags, Drums, Boxes"
                      />
                    </div>

                    {variance && Math.abs(variance.variancePercent) > 0 && (
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Variance
                        </label>
                        <div className={`px-3 py-2 rounded-lg text-sm ${
                          Math.abs(variance.variancePercent) > 5 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {variance.variance > 0 ? '+' : ''}{variance.variance.toFixed(2)} {item.unit} 
                          ({variance.variancePercent > 0 ? '+' : ''}{variance.variancePercent.toFixed(1)}%)
                          {variance.isOverDelivery && ' - Over Delivery'}
                          {variance.isShortDelivery && ' - Short Delivery'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
            onClick={() => navigate('/warehouse/goods-receipts')}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Creating...' : 'Create GRN'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGRN;