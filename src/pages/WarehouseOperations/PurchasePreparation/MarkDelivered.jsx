import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package, Save, ArrowLeft, ClipboardCheck } from 'lucide-react';
import { purchasePreparationService } from '../../../services/purchasePreparationService';
import LoadingSpinner from '../../../components/Common/LoadingSpinner';

const MarkDelivered = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [preparation, setPreparation] = useState(null);
  const [formData, setFormData] = useState({
    deliveredQuantity: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    batchNumber: '',
    packagingCondition: 'good',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadPreparationData();
    }
  }, [id]);

  const loadPreparationData = async () => {
    try {
      setLoading(true);
      const preparations = await purchasePreparationService.getPurchasePreparations();
      const prep = preparations.find(p => p.id === id);
      
      if (!prep) {
        setError('Purchase preparation not found');
        return;
      }
      
      setPreparation(prep);
      setFormData(prev => ({
        ...prev,
        deliveredQuantity: prep.requiredQuantity.toString(),
        batchNumber: `${prep.materialName?.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`
      }));
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const deliveryData = {
        ...formData,
        deliveredQuantity: parseInt(formData.deliveredQuantity)
      };
      
      const result = await purchasePreparationService.markAsDelivered(id, deliveryData);
      
      // Navigate to QC form with delivery data
      navigate(`/warehouse/delivery-qc/${result.deliveryId}`, {
        state: { 
          delivery: result.deliveryRecord,
          preparation 
        }
      });
      
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading preparation data..." />;
  }

  if (!preparation) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Preparation not found</h3>
          <button
            onClick={() => navigate('/warehouse/purchase-preparation')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Purchase Preparation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/warehouse/purchase-preparation')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Package className="h-8 w-8 mr-3 text-green-600" />
              Mark as Delivered
            </h1>
            <p className="text-gray-600 mt-2">Record delivery and proceed to quality check</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-900">Purchase Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2 text-sm">
          <div>
            <span className="text-blue-700">Material:</span>
            <span className="font-medium text-blue-900 ml-2">{preparation.materialName}</span>
          </div>
          <div>
            <span className="text-blue-700">Ordered Quantity:</span>
            <span className="font-medium text-blue-900 ml-2">{preparation.requiredQuantity} {preparation.unit}</span>
          </div>
          <div>
            <span className="text-blue-700">Supplier:</span>
            <span className="font-medium text-blue-900 ml-2">{preparation.supplierName}</span>
          </div>
          <div>
            <span className="text-blue-700">Expected:</span>
            <span className="font-medium text-blue-900 ml-2">
              {preparation.expectedDeliveryDate ? new Date(preparation.expectedDeliveryDate).toLocaleDateString() : 'Not set'}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Delivery Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivered Quantity *
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  min="0"
                  max={preparation.requiredQuantity}
                  value={formData.deliveredQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveredQuantity: e.target.value }))}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter delivered quantity"
                />
                <input
                  type="text"
                  value={preparation.unit}
                  readOnly
                  className="w-16 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Date *
              </label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch/Lot Number *
              </label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter batch or lot number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Packaging Condition
              </label>
              <select
                value={formData.packagingCondition}
                onChange={(e) => setFormData(prev => ({ ...prev, packagingCondition: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Notes
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Add any delivery notes or observations..."
              />
            </div>
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mt-8 flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/warehouse/purchase-preparation')}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ClipboardCheck className="h-4 w-4" />
              <span>{submitting ? 'Processing...' : 'Mark Delivered & Start QC'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MarkDelivered;