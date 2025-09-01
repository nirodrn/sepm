import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Search, Filter, Eye, CheckCircle, XCircle, Package, Archive, Calendar } from 'lucide-react';
import { grnService } from '../../../services/grnService';
import { supplierService } from '../../../services/supplierService';
import { materialService } from '../../../services/materialService';
import { inventoryService } from '../../../services/inventoryService';
import { invoiceService } from '../../../services/invoiceService';
import { updateData } from '../../../firebase/db';
import LoadingSpinner from '../../../components/Common/LoadingSpinner';
import { formatDate } from '../../../utils/formatDate';

const GRNQCList = () => {
  const navigate = useNavigate();
  const [grns, setGRNs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMaterialType, setFilterMaterialType] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [grnData, supplierData] = await Promise.all([
        grnService.getGRNs(),
        supplierService.getSuppliers()
      ]);
      
      setGRNs(grnData);
      setSuppliers(supplierData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_qc':
        return 'bg-yellow-100 text-yellow-800';
      case 'qc_passed':
        return 'bg-green-100 text-green-800';
      case 'qc_failed':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown Supplier';
  };

  const getMaterialTypeIcon = (materialType) => {
    return materialType === 'material' ? Package : Archive;
  };

  const getMaterialTypeLabel = (materialType) => {
    return materialType === 'material' ? 'Raw Material' : 'Packing Material';
  };

  const handleApproveGRN = async (grn) => {
    setSelectedGRN(grn);
    setShowApprovalModal(true);
  };

  const confirmApproval = async () => {
    if (!selectedGRN) return;

    try {
      setApproving(true);
      setError('');

      // Update GRN status to approved
      await grnService.updateGRNStatus(selectedGRN.id, 'qc_passed', {
        qcApprovedAt: Date.now(),
        qcApprovedBy: 'QC Officer'
      });

      // Update stock levels for each item
      for (const item of selectedGRN.items) {
        const stockPath = item.materialType === 'material' ? 'rawMaterialsStock' : 'packingMaterialsStock';
        
        // Record stock movement
        await inventoryService.recordStockMovement({
          materialId: item.materialId,
          materialType: item.materialType === 'material' ? 'rawMaterial' : 'packingMaterial',
          type: 'in',
          quantity: item.deliveredQty,
          reason: `GRN Approved - ${selectedGRN.grnNumber}`,
          batchNumber: item.batchNumber || selectedGRN.grnNumber,
          supplierId: selectedGRN.supplierId,
          unitPrice: item.unitPrice,
          qualityGrade: item.qualityGrade
        });

        // Update material stock
        if (item.materialType === 'material') {
          await inventoryService.updateRawMaterialStock(item.materialId, item.deliveredQty, 'in');
        } else {
          await inventoryService.updatePackingMaterialStock(item.materialId, item.deliveredQty, 'in');
        }
      }

      // Create invoice for this GRN
      await createInvoiceFromGRN(selectedGRN);

      // Reload data
      await loadData();
      
      setShowApprovalModal(false);
      setSelectedGRN(null);
    } catch (error) {
      setError('Failed to approve GRN: ' + error.message);
    } finally {
      setApproving(false);
    }
  };

  const createInvoiceFromGRN = async (grn) => {
    try {
      const invoiceData = {
        grnId: grn.id,
        grnNumber: grn.grnNumber,
        supplierId: grn.supplierId,
        supplierName: grn.supplierName,
        poId: grn.poId,
        poNumber: grn.poNumber,
        invoiceDate: Date.now(),
        dueDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
        items: grn.items.map(item => ({
          materialId: item.materialId,
          materialName: item.materialName,
          materialType: item.materialType,
          quantity: item.deliveredQty,
          unit: item.unit,
          unitPrice: item.unitPrice,
          total: item.deliveredQty * item.unitPrice
        })),
        subtotal: grn.totalAmount,
        tax: grn.totalAmount * 0.1, // 10% tax
        total: grn.totalAmount * 1.1,
        currency: 'LKR'
      };

      await invoiceService.createInvoice(invoiceData);
    } catch (error) {
      console.error('Failed to create invoice from GRN:', error);
    }
  };

  const handleRejectGRN = async (grnId) => {
    if (window.confirm('Are you sure you want to reject this GRN? This action cannot be undone.')) {
      try {
        await grnService.updateGRNStatus(grnId, 'qc_failed', {
          qcRejectedAt: Date.now(),
          qcRejectedBy: 'QC Officer',
          rejectionReason: 'Quality standards not met'
        });
        await loadData();
      } catch (error) {
        setError('Failed to reject GRN: ' + error.message);
      }
    }
  };

  const filteredGRNs = grns.filter(grn => {
    const matchesSearch = grn.grnNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grn.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grn.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || grn.status === filterStatus;
    const matchesSupplier = !filterSupplier || grn.supplierId === filterSupplier;
    
    let matchesMaterialType = true;
    if (filterMaterialType) {
      matchesMaterialType = grn.items?.some(item => item.materialType === filterMaterialType);
    }
    
    return matchesSearch && matchesStatus && matchesSupplier && matchesMaterialType;
  });

  if (loading) {
    return <LoadingSpinner text="Loading GRNs for quality control..." />;
  }

  return (
    <div className="p-6">
      {/* Approval Modal */}
      {showApprovalModal && selectedGRN && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Approve GRN: {selectedGRN.grnNumber}
            </h3>
            
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Supplier:</span>
                  <span className="font-medium text-blue-900 ml-2">{selectedGRN.supplierName}</span>
                </div>
                <div>
                  <span className="text-blue-700">PO Number:</span>
                  <span className="font-medium text-blue-900 ml-2">{selectedGRN.poNumber}</span>
                </div>
                <div>
                  <span className="text-blue-700">Delivery Date:</span>
                  <span className="font-medium text-blue-900 ml-2">
                    {new Date(selectedGRN.deliveryDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Total Amount:</span>
                  <span className="font-medium text-blue-900 ml-2">LKR {selectedGRN.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Items to be approved:</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedGRN.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.materialName}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.materialType === 'material' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {getMaterialTypeLabel(item.materialType)}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.deliveredQty} {item.unit}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(item.qualityGrade)}`}>
                            Grade {item.qualityGrade}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.condition === 'good' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.condition === 'good' ? 'Good' : 'Damaged'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ClipboardCheck className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">QC Approval Confirmation</h4>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>By approving this GRN, you confirm that:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>All materials have been quality checked</li>
                      <li>Materials meet required specifications</li>
                      <li>Stock levels will be automatically updated</li>
                      <li>An invoice will be generated for the supplier</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedGRN(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmApproval}
                disabled={approving}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>{approving ? 'Approving...' : 'Approve GRN'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <ClipboardCheck className="h-8 w-8 mr-3 text-green-600" />
          GRN Quality Control
        </h1>
        <p className="text-gray-600">Review and approve goods receipt notes for stock updates</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search GRN, PO, or supplier..."
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Status</option>
                <option value="pending_qc">Pending QC</option>
                <option value="qc_passed">QC Passed</option>
                <option value="qc_failed">QC Failed</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="relative">
              <select
                value={filterMaterialType}
                onChange={(e) => setFilterMaterialType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Material Types</option>
                <option value="material">Raw Materials</option>
                <option value="packing_material">Packing Materials</option>
              </select>
            </div>
            <div className="relative">
              <select
                value={filterSupplier}
                onChange={(e) => setFilterSupplier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Suppliers</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredGRNs.map((grn) => (
            <div key={grn.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="p-2 rounded-lg bg-green-100">
                    <ClipboardCheck className="h-5 w-5 text-green-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900">GRN: {grn.grnNumber}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(grn.status)}`}>
                        {grn.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">PO Number:</span>
                        <span className="ml-1">{grn.poNumber}</span>
                      </div>
                      <div>
                        <span className="font-medium">Supplier:</span>
                        <span className="ml-1">{grn.supplierName}</span>
                      </div>
                      <div>
                        <span className="font-medium">Delivery Date:</span>
                        <span className="ml-1">{formatDate(grn.deliveryDate)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Total Amount:</span>
                        <span className="ml-1 text-green-600 font-semibold">LKR {grn.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-700">Items ({grn.items?.length || 0}):</h5>
                      {grn.items?.map((item, index) => {
                        const MaterialIcon = getMaterialTypeIcon(item.materialType);
                        return (
                          <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <MaterialIcon className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="font-medium text-gray-900">{item.materialName}</p>
                                <p className="text-sm text-gray-500">
                                  {getMaterialTypeLabel(item.materialType)} • {item.deliveredQty} {item.unit}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(item.qualityGrade)}`}>
                                  Grade {item.qualityGrade}
                                </span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  item.condition === 'good' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {item.condition === 'good' ? 'Good' : 'Damaged'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">LKR {(item.deliveredQty * item.unitPrice).toFixed(2)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {grn.remarks && (
                      <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Remarks:</span> {grn.remarks}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {grn.status === 'pending_qc' && (
                    <>
                      <button
                        onClick={() => handleApproveGRN(grn)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Approve QC</span>
                      </button>
                      <button
                        onClick={() => handleRejectGRN(grn.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => navigate(`/warehouse/goods-receipts/${grn.id}`)}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredGRNs.length === 0 && (
          <div className="text-center py-12">
            <ClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No GRNs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus || filterSupplier || filterMaterialType 
                ? 'Try adjusting your search criteria.' 
                : 'No goods receipt notes available for quality control.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const getGradeColor = (grade) => {
  switch (grade) {
    case 'A': return 'bg-green-100 text-green-800';
    case 'B': return 'bg-blue-100 text-blue-800';
    case 'C': return 'bg-yellow-100 text-yellow-800';
    case 'D': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default GRNQCList;