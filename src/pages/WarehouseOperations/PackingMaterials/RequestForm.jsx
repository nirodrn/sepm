import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, Send, ArrowLeft, Plus, Trash2 } from 'lucide-react';

const PackingMaterialRequestForm = () => {
  const navigate = useNavigate();
  const [requestItems, setRequestItems] = useState([
    { id: 1, material: '', quantity: '', unit: 'pieces', urgency: 'normal', reason: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const materialOptions = [
    'Cardboard Boxes - Small',
    'Cardboard Boxes - Medium',
    'Cardboard Boxes - Large',
    'Bubble Wrap Rolls',
    'Packing Tape',
    'Labels - Product',
    'Plastic Bags',
    'Foam Padding'
  ];

  const unitOptions = ['pieces', 'rolls', 'sheets', 'meters', 'kg'];

  const addItem = () => {
    const newId = Math.max(...requestItems.map(item => item.id)) + 1;
    setRequestItems([
      ...requestItems,
      { id: newId, material: '', quantity: '', unit: 'pieces', urgency: 'normal', reason: '' }
    ]);
  };

  const removeItem = (id) => {
    if (requestItems.length > 1) {
      setRequestItems(requestItems.filter(item => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setRequestItems(requestItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Submit request logic - will be sent to HO for approval
      console.log('Submitting packing material request:', requestItems);
      setTimeout(() => {
        navigate('/warehouse/packing-materials');
      }, 1000);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

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
              <Archive className="h-8 w-8 mr-3 text-green-600" />
              Request Packing Materials
            </h1>
            <p className="text-gray-600 mt-2">Submit a request for packing materials to Head of Operations</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-6xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Request Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="space-y-6">
            {requestItems.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Item {index + 1}</h3>
                  {requestItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material *
                    </label>
                    <select
                      value={item.material}
                      onChange={(e) => updateItem(item.id, 'material', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select material</option>
                      {materialOptions.map(material => (
                        <option key={material} value={material}>{material}</option>
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
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter quantity"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit *
                    </label>
                    <select
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {unitOptions.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency
                    </label>
                    <select
                      value={item.urgency}
                      onChange={(e) => updateItem(item.id, 'urgency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Request *
                  </label>
                  <textarea
                    rows={2}
                    value={item.reason}
                    onChange={(e) => updateItem(item.id, 'reason', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Explain why this material is needed..."
                  />
                </div>

                <div className="mt-3 flex justify-end">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(item.urgency)}`}>
                    {item.urgency.charAt(0).toUpperCase() + item.urgency.slice(1)} Priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Summary</h3>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Add any additional information for the Head of Operations..."
            />
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/warehouse/packing-materials')}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PackingMaterialRequestForm;