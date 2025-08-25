import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TruckIcon, Save, ArrowLeft, Star, Download } from 'lucide-react';
import { purchasePreparationService } from '../../../services/purchasePreparationService';
import { supplierService } from '../../../services/supplierService';
import LoadingSpinner from '../../../components/Common/LoadingSpinner';

const AssignSupplier = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [preparation, setPreparation] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [supplierGrades, setSupplierGrades] = useState({});
  const [formData, setFormData] = useState({
    supplierId: '',
    supplierName: '',
    unitPrice: '',
    expectedDeliveryDate: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [preparations, supplierData] = await Promise.all([
        purchasePreparationService.getPurchasePreparations(),
        supplierService.getSuppliers()
      ]);
      
      const prep = preparations.find(p => p.id === id);
      if (!prep) {
        setError('Purchase preparation not found');
        return;
      }
      
      setPreparation(prep);
      setSuppliers(supplierData.filter(s => s.status === 'active'));
      
      // Load supplier grades
      const grades = {};
      for (const supplier of supplierData) {
        try {
          const gradeInfo = await purchasePreparationService.getSupplierGrade(supplier.id);
          grades[supplier.id] = gradeInfo;
        } catch (error) {
          grades[supplier.id] = { grade: 'Not graded yet', isNew: true };
        }
      }
      setSupplierGrades(grades);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierSelect = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      setFormData(prev => ({
        ...prev,
        supplierId,
        supplierName: supplier.name
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const supplierData = {
        ...formData,
        quantity: preparation.requiredQuantity,
        unitPrice: parseFloat(formData.unitPrice) || 0
      };
      
      await purchasePreparationService.assignSupplier(id, supplierData);
      
      // Generate PDF
      purchasePreparationService.generateAllocationPDF(preparation, [{
        ...supplierData,
        quantity: preparation.requiredQuantity
      }]);
      
      navigate('/warehouse/purchase-preparation');
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'text-green-600';
      case 'B': return 'text-blue-600';
      case 'C': return 'text-yellow-600';
      case 'D': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getGradeStars = (grade) => {
    const gradePoints = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
    const points = gradePoints[grade] || 0;
    
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < points ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
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
              <TruckIcon className="h-8 w-8 mr-3 text-blue-600" />
              Assign Supplier
            </h1>
            <p className="text-gray-600 mt-2">Assign supplier for approved material purchase</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-900">Material Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 text-sm">
          <div>
            <span className="text-blue-700">Material:</span>
            <span className="font-medium text-blue-900 ml-2">{preparation.materialName}</span>
          </div>
          <div>
            <span className="text-blue-700">Required Quantity:</span>
            <span className="font-medium text-blue-900 ml-2">{preparation.requiredQuantity} {preparation.unit}</span>
          </div>
          <div>
            <span className="text-blue-700">Type:</span>
            <span className="font-medium text-blue-900 ml-2">
              {preparation.requestType === 'material' ? 'Raw Material' : 'Packing Material'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Suppliers</h3>
          <div className="space-y-4">
            {suppliers.map((supplier) => {
              const gradeInfo = supplierGrades[supplier.id] || { grade: 'Not graded yet', isNew: true };
              const isSelected = formData.supplierId === supplier.id;
              
              return (
                <div
                  key={supplier.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSupplierSelect(supplier.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          checked={isSelected}
                          onChange={() => handleSupplierSelect(supplier.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{supplier.name}</h4>
                          <p className="text-sm text-gray-500">{supplier.email}</p>
                          <p className="text-sm text-gray-500">{supplier.phone}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          {getGradeStars(gradeInfo.grade)}
                          <span className={`text-sm font-medium ml-2 ${getGradeColor(gradeInfo.grade)}`}>
                            {gradeInfo.isNew ? 'Not graded yet' : `Grade ${gradeInfo.grade}`}
                          </span>
                        </div>
                        {!gradeInfo.isNew && (
                          <span className="text-sm text-gray-500">
                            {gradeInfo.totalDeliveries} deliveries
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Details</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Price (LKR) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter unit price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Delivery Date *
              </label>
              <input
                type="date"
                value={formData.expectedDeliveryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any special instructions or notes..."
              />
            </div>

            {formData.supplierId && formData.unitPrice && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Cost Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{preparation.requiredQuantity} {preparation.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unit Price:</span>
                    <span className="font-medium">LKR {parseFloat(formData.unitPrice).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-1">
                    <span className="text-gray-900 font-medium">Total Cost:</span>
                    <span className="font-bold text-blue-600">
                      LKR {(parseFloat(formData.unitPrice) * preparation.requiredQuantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/warehouse/purchase-preparation')}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !formData.supplierId || !formData.unitPrice || !formData.expectedDeliveryDate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{submitting ? 'Assigning...' : 'Assign Supplier'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignSupplier;