import React, { useState } from 'react';
import { Send, Package, ArrowRight } from 'lucide-react';

const SendToPackingArea = () => {
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [quantities, setQuantities] = useState({});

  const availableMaterials = [
    { id: 1, name: 'Cardboard Boxes - Small', stock: 450, unit: 'pieces' },
    { id: 2, name: 'Cardboard Boxes - Medium', stock: 320, unit: 'pieces' },
    { id: 3, name: 'Cardboard Boxes - Large', stock: 180, unit: 'pieces' },
    { id: 4, name: 'Bubble Wrap Rolls', stock: 25, unit: 'rolls' },
    { id: 5, name: 'Packing Tape', stock: 89, unit: 'rolls' },
    { id: 6, name: 'Labels - Product', stock: 1200, unit: 'sheets' }
  ];

  const handleMaterialSelect = (materialId) => {
    if (selectedMaterials.includes(materialId)) {
      setSelectedMaterials(selectedMaterials.filter(id => id !== materialId));
      const newQuantities = { ...quantities };
      delete newQuantities[materialId];
      setQuantities(newQuantities);
    } else {
      setSelectedMaterials([...selectedMaterials, materialId]);
    }
  };

  const handleQuantityChange = (materialId, quantity) => {
    setQuantities({
      ...quantities,
      [materialId]: parseInt(quantity) || 0
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle sending materials to packing area
    console.log('Sending materials:', selectedMaterials.map(id => ({
      materialId: id,
      quantity: quantities[id]
    })));
  };

  const getTotalItems = () => {
    return selectedMaterials.reduce((total, id) => total + (quantities[id] || 0), 0);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Send className="h-8 w-8 mr-3 text-blue-600" />
          Send to Packing Area
        </h1>
        <p className="text-gray-600 mt-2">Transfer materials to the packing area</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Materials</h2>
            
            <div className="space-y-4">
              {availableMaterials.map((material) => (
                <div
                  key={material.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    selectedMaterials.includes(material.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedMaterials.includes(material.id)}
                        onChange={() => handleMaterialSelect(material.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{material.name}</h3>
                        <p className="text-sm text-gray-500">Available: {material.stock} {material.unit}</p>
                      </div>
                    </div>
                    
                    {selectedMaterials.includes(material.id) && (
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-700">Quantity:</label>
                        <input
                          type="number"
                          min="1"
                          max={material.stock}
                          value={quantities[material.id] || ''}
                          onChange={(e) => handleQuantityChange(material.id, e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                        <span className="text-sm text-gray-500">{material.unit}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Summary</h3>
            
            {selectedMaterials.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No materials selected</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <p className="text-sm text-gray-600">Selected Materials: {selectedMaterials.length}</p>
                  <p className="text-sm text-gray-600">Total Items: {getTotalItems()}</p>
                </div>
                
                <div className="space-y-2">
                  {selectedMaterials.map(id => {
                    const material = availableMaterials.find(m => m.id === id);
                    const quantity = quantities[id] || 0;
                    return (
                      <div key={id} className="flex justify-between text-sm">
                        <span className="text-gray-900">{material.name}</span>
                        <span className="text-gray-600">{quantity} {material.unit}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Details</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Packing Area - Line 1</option>
                  <option>Packing Area - Line 2</option>
                  <option>Packing Area - Line 3</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any special instructions..."
                />
              </div>

              <button
                type="submit"
                disabled={selectedMaterials.length === 0 || getTotalItems() === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>Send Materials</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendToPackingArea;