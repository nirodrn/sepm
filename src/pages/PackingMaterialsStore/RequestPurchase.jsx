import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Send, ArrowLeft } from 'lucide-react';
import { packingMaterialsService } from '../../services/packingMaterialsService';
import { packingMaterialRequestService } from '../../services/packingMaterialRequestService';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';

const RequestPurchase = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({
    materials: [{ materialId: '', quantity: '', urgency: 'normal', notes: '' }],
    requestedBy: user?.uid || '',
    department: 'Packing Materials Store',
    priority: 'normal',
    notes: ''
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const materialsData = await packingMaterialsService.getAllMaterials();
      setMaterials(materialsData);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setError('Failed to load materials');
    }
  };

  const addMaterialRow = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, { materialId: '', quantity: '', urgency: 'normal', notes: '' }]
    }));
  };

  const removeMaterialRow = (index) => {
    if (formData.materials.length > 1) {
      setFormData(prev => ({
        ...prev,
        materials: prev.materials.filter((_, i) => i !== index)
      }));
    }
  };

  const updateMaterial = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map((material, i) => 
        i === index ? { ...material, [field]: value } : material
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      const validMaterials = formData.materials.filter(m => m.materialId && m.quantity);
      if (validMaterials.length === 0) {
        throw new Error('Please add at least one material with quantity');
      }

      // Prepare request data
      const requestData = {
        ...formData,
        materials: validMaterials.map(material => {
          const materialInfo = materials.find(m => m.id === material.materialId);
          return {
            ...material,
            materialName: materialInfo?.name || '',
            unit: materialInfo?.unit || '',
            quantity: parseFloat(material.quantity)
          };
        }),
        status: 'pending_ho_approval',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await packingMaterialRequestService.createPackingMaterialRequest(requestData);
      
      navigate('/packing-materials-store/dashboard', {
        state: { message: 'Purchase request submitted successfully!' }
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      setError(error.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return formData.materials.reduce((total, material) => {
      const materialInfo = materials.find(m => m.id === material.materialId);
      const price = materialInfo?.price || 0;
      const quantity = parseFloat(material.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };

  if (loading && materials.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/packing-materials-store/dashboard')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Request Purchase</h1>
              </div>
            </div>
          </div>

          {error && (
            <div className="px-6 py-4">
              <ErrorMessage message={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Request Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>

            {/* Materials Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Materials Required</h3>
                <button
                  type="button"
                  onClick={addMaterialRow}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Material</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.materials.map((material, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-200 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Material *
                      </label>
                      <select
                        value={material.materialId}
                        onChange={(e) => updateMaterial(index, 'materialId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Material</option>
                        {materials.map(mat => (
                          <option key={mat.id} value={mat.id}>
                            {mat.name} ({mat.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={material.quantity}
                        onChange={(e) => updateMaterial(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urgency
                      </label>
                      <select
                        value={material.urgency}
                        onChange={(e) => updateMaterial(index, 'urgency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={material.notes}
                        onChange={(e) => updateMaterial(index, 'notes', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Optional notes"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeMaterialRow(index)}
                        disabled={formData.materials.length === 1}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">
                  Estimated Total: LKR {calculateTotal().toLocaleString()}
                </span>
                <span className="text-sm text-gray-600">
                  {formData.materials.filter(m => m.materialId && m.quantity).length} items
                </span>
              </div>
            </div>

            {/* General Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional information or special requirements..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/packing-materials-store/dashboard')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestPurchase;