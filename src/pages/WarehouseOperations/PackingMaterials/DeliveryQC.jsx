import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ClipboardCheck, Save, ArrowLeft, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { auth } from '../../../firebase/auth';
import { packingMaterialsService } from '../../../services/packingMaterialsService';
import { supplierService } from '../../../services/supplierService';
import { materialService } from '../../../services/materialService';

const PackingMaterialDeliveryQC = () => {
  const navigate = useNavigate();
  const { deliveryId } = useParams();
  
  const [formData, setFormData] = useState({
    materialId: '',
    materialName: '',
    supplierId: '',
    supplierName: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    quantityReceived: '',
    quantityAccepted: '',
    unit: '',
    batchNumber: '',
    lotNumber: '',
    mfgDate: '',
    expiryDate: '',
    appearance: '',
    dimensions: '',
    strength: '',
    printQuality: '',
    adhesion: '',
    defectRate: '',
    packagingCondition: 'good',
    overallGrade: 'A',
    acceptanceStatus: 'accepted',
    remarks: '',
    qcOfficer: '',
    qcDate: new Date().toISOString().split('T')[0],
    unitPrice: ''
  });
  
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (deliveryId) {
      loadDeliveryData();
    } else {
      // If no delivery ID, load basic data for manual entry
      loadBasicData();
    }
  }, [deliveryId]);

  const loadDeliveryData = async () => {
    try {
      const deliveries = await getData('packingMaterialDeliveries');
      const deliveryData = deliveries?.[deliveryId];
      
      if (deliveryData) {
        setDelivery(deliveryData);
        setFormData(prev => ({
          ...prev,
          materialId: deliveryData.materialId,
          materialName: deliveryData.materialName,
          supplierId: deliveryData.supplierId,
          supplierName: deliveryData.supplierName,
          deliveryDate: new Date(deliveryData.deliveryDate).toISOString().split('T')[0],
          quantityReceived: deliveryData.quantityReceived?.toString() || '',
          unit: deliveryData.unit,
          batchNumber: deliveryData.batchNumber || '',
          unitPrice: deliveryData.unitPrice?.toString() || ''
        }));
      } else {
        setError('Delivery not found');
      }
    } catch (error) {
      setError('Failed to load delivery data');
    } finally {
      setLoading(false);
    }
  };

  const loadBasicData = async () => {
    try {
      const currentUser = auth.currentUser;
      setFormData(prev => ({
        ...prev,
        qcOfficer: currentUser?.displayName || currentUser?.email || 'QC Officer'
      }));
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-set accepted quantity when received quantity changes
    if (name === 'quantityReceived' && formData.acceptanceStatus === 'accepted') {
      setFormData(prev => ({
        ...prev,
        quantityAccepted: value
      }));
    }

    // Clear accepted quantity if rejected
    if (name === 'acceptanceStatus' && value === 'rejected') {
      setFormData(prev => ({
        ...prev,
        quantityAccepted: '0'
      }));
    } else if (name === 'acceptanceStatus' && value === 'accepted') {
      setFormData(prev => ({
        ...prev,
        quantityAccepted: prev.quantityReceived
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const qcData = {
        deliveryId: deliveryId || null,
        materialId: formData.materialId,
        materialType: 'packingMaterial',
        supplierId: formData.supplierId,
        ...formData,
        quantityReceived: parseInt(formData.quantityReceived),
        quantityAccepted: parseInt(formData.quantityAccepted) || 0,
        defectRate: parseFloat(formData.defectRate) || 0,
        unitPrice: parseFloat(formData.unitPrice) || 0
      };
      
      await packingMaterialsService.recordQCData(qcData);
      navigate('/warehouse/packing-materials');
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'D':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    return status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
              <ClipboardCheck className="h-8 w-8 mr-3 text-green-600" />
              Packing Material Quality Control
            </h1>
            <p className="text-gray-600 mt-2">Record quality check results for packing materials</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Delivery Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Name *
              </label>
              <input
                type="text"
                name="materialName"
                value={formData.materialName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter material name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Name *
              </label>
              <input
                type="text"
                name="supplierName"
                value={formData.supplierName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter supplier name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Date *
              </label>
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleChange}
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
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter batch or lot number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Received *
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="quantityReceived"
                  value={formData.quantityReceived}
                  onChange={handleChange}
                  required
                  min="0"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter quantity"
                />
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Unit"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Price
              </label>
              <input
                type="number"
                step="0.01"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manufacturing Date
              </label>
              <input
                type="date"
                name="mfgDate"
                value={formData.mfgDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quality Parameters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appearance
              </label>
              <textarea
                name="appearance"
                rows={2}
                value={formData.appearance}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Describe the visual appearance..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensions Accuracy
              </label>
              <input
                type="text"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Check dimensions accuracy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Strength/Durability
              </label>
              <input
                type="text"
                name="strength"
                value={formData.strength}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Assess material strength"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Print Quality
              </label>
              <input
                type="text"
                name="printQuality"
                value={formData.printQuality}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Check print quality if applicable"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adhesion Quality
              </label>
              <input
                type="text"
                name="adhesion"
                value={formData.adhesion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Check adhesive properties if applicable"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Defect Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                name="defectRate"
                value={formData.defectRate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter defect percentage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Packaging Condition
              </label>
              <select
                name="packagingCondition"
                value={formData.packagingCondition}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QC Officer *
              </label>
              <input
                type="text"
                name="qcOfficer"
                value={formData.qcOfficer}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter QC officer name"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quality Assessment</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Grade *
              </label>
              <select
                name="overallGrade"
                value={formData.overallGrade}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="A">Grade A - Excellent</option>
                <option value="B">Grade B - Good</option>
                <option value="C">Grade C - Acceptable</option>
                <option value="D">Grade D - Poor</option>
              </select>
              <div className="mt-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(formData.overallGrade)}`}>
                  Grade {formData.overallGrade}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acceptance Status *
              </label>
              <select
                name="acceptanceStatus"
                value={formData.acceptanceStatus}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="mt-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(formData.acceptanceStatus)}`}>
                  {formData.acceptanceStatus === 'accepted' ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Accepted</>
                  ) : (
                    <><AlertTriangle className="h-3 w-3 mr-1" /> Rejected</>
                  )}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Accepted *
              </label>
              <input
                type="number"
                name="quantityAccepted"
                value={formData.quantityAccepted}
                onChange={handleChange}
                required
                min="0"
                max={formData.quantityReceived}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter accepted quantity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QC Date *
              </label>
              <input
                type="date"
                name="qcDate"
                value={formData.qcDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QC Officer Remarks
              </label>
              <textarea
                name="remarks"
                rows={3}
                value={formData.remarks}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Add any additional remarks or observations..."
              />
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
            onClick={() => navigate('/warehouse/packing-materials')}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{submitting ? 'Saving...' : 'Save QC Results'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PackingMaterialDeliveryQC;