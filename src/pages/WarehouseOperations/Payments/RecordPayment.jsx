import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreditCard, Save, ArrowLeft, Receipt, DollarSign } from 'lucide-react';
import { paymentService } from '../../../services/paymentService';
import { invoiceService } from '../../../services/invoiceService';
import { supplierService } from '../../../services/supplierService';

const RecordPayment = () => {
  const navigate = useNavigate();
  const { invoiceId } = useParams();
  
  const [formData, setFormData] = useState({
    invoiceId: invoiceId || '',
    method: 'card',
    referenceNumber: '',
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
    bankName: '',
    chequeNumber: '',
    cardType: 'credit',
    cardLast4: ''
  });
  
  const [invoice, setInvoice] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (invoiceId) {
      loadInvoiceData();
    }
  }, [invoiceId]);

  const loadInvoiceData = async () => {
    try {
      const invoices = await invoiceService.getInvoices();
      const invoiceData = invoices.find(inv => inv.id === invoiceId);
      
      if (invoiceData) {
        setInvoice(invoiceData);
        setFormData(prev => ({
          ...prev,
          amount: invoiceData.remainingAmount || invoiceData.total || 0
        }));
        
        // Load supplier data
        const suppliers = await supplierService.getSuppliers();
        const supplierData = suppliers.find(s => s.id === invoiceData.supplierId);
        setSupplier(supplierData);
      } else {
        setError('Invoice not found');
      }
    } catch (error) {
      setError('Failed to load invoice data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const paymentData = {
        ...formData,
        supplierId: invoice.supplierId,
        amount: parseFloat(formData.amount)
      };
      
      await paymentService.recordPayment(paymentData);
      navigate('/warehouse/invoices');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentMethodFields = () => {
    switch (formData.method) {
      case 'card':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Type
              </label>
              <select
                name="cardType"
                value={formData.cardType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="credit">Credit Card</option>
                <option value="debit">Debit Card</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Last 4 Digits
              </label>
              <input
                type="text"
                name="cardLast4"
                value={formData.cardLast4}
                onChange={handleInputChange}
                maxLength="4"
                pattern="[0-9]{4}"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="1234"
              />
            </div>
          </>
        );
      
      case 'cheque':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter bank name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cheque Number
              </label>
              <input
                type="text"
                name="chequeNumber"
                value={formData.chequeNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter cheque number"
              />
            </div>
          </>
        );
      
      case 'cash':
        return (
          <div className="md:col-span-2">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-yellow-800 font-medium">Cash Payment</p>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                Ensure proper cash handling procedures are followed and receipt is issued.
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/warehouse/invoices')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <CreditCard className="h-8 w-8 mr-3 text-green-600" />
              Record Payment
            </h1>
            <p className="text-gray-600 mt-2">Record payment for supplier invoice</p>
          </div>
        </div>
      </div>

      {invoice && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">Invoice: {invoice.invoiceNumber}</h3>
              <p className="text-blue-700 text-sm">Supplier: {supplier?.name}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-900 font-medium">Total: ${(invoice.total || 0).toFixed(2)}</p>
              <p className="text-blue-700 text-sm">Remaining: ${(invoice.remainingAmount || invoice.total || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method *
              </label>
              <select
                name="method"
                value={formData.method}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="card">Card</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                min="0.01"
                max={invoice?.remainingAmount || invoice?.total || 0}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date *
              </label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference Number
              </label>
              <input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Transaction reference"
              />
            </div>

            {renderPaymentMethodFields()}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Additional payment notes or remarks"
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
            onClick={() => navigate('/warehouse/invoices')}
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
            <span>{loading ? 'Recording...' : 'Record Payment'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecordPayment;