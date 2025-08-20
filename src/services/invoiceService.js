import { getData, setData, updateData, pushData } from '../firebase/db';
import { auth } from '../firebase/auth';

export const invoiceService = {
  async createInvoice(invoiceData) {
    try {
      const invoice = {
        ...invoiceData,
        invoiceNumber: await this.generateInvoiceNumber(),
        status: 'pending',
        paymentStatus: 'pending',
        totalPaid: 0,
        remainingAmount: invoiceData.total,
        createdBy: auth.currentUser?.uid,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const id = await pushData('invoices', invoice);
      return { id, ...invoice };
    } catch (error) {
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  },

  async generateInvoiceNumber() {
    try {
      const invoices = await getData('invoices');
      const count = invoices ? Object.keys(invoices).length : 0;
      const year = new Date().getFullYear();
      return `INV${year}${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      return `INV${new Date().getFullYear()}${String(Date.now()).slice(-4)}`;
    }
  },

  async getInvoices(filters = {}) {
    try {
      const invoices = await getData('invoices');
      if (!invoices) return [];
      
      let filteredInvoices = Object.entries(invoices).map(([id, invoice]) => ({
        id,
        ...invoice
      }));

      if (filters.status) {
        filteredInvoices = filteredInvoices.filter(inv => inv.status === filters.status);
      }
      
      if (filters.paymentStatus) {
        filteredInvoices = filteredInvoices.filter(inv => inv.paymentStatus === filters.paymentStatus);
      }
      
      if (filters.supplierId) {
        filteredInvoices = filteredInvoices.filter(inv => inv.supplierId === filters.supplierId);
      }

      return filteredInvoices.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      throw new Error(`Failed to fetch invoices: ${error.message}`);
    }
  },

  async perform3WayMatch(invoiceId, poId, grnId) {
    try {
      const [invoice, po, grn] = await Promise.all([
        getData(`invoices/${invoiceId}`),
        getData(`purchaseOrders/${poId}`),
        getData(`goodsReceipts/${grnId}`)
      ]);

      const variances = [];
      
      // Compare quantities and prices
      invoice.items.forEach(invItem => {
        const poItem = po.items.find(item => item.materialId === invItem.materialId);
        const grnItem = grn.items.find(item => item.materialId === invItem.materialId);
        
        if (poItem && grnItem) {
          const qtyVariance = Math.abs(invItem.quantity - grnItem.deliveredQty);
          const priceVariance = Math.abs(invItem.unitPrice - poItem.unitPrice);
          
          if (qtyVariance > 0 || priceVariance > 0.01) {
            variances.push({
              materialId: invItem.materialId,
              materialName: invItem.materialName,
              qtyVariance,
              priceVariance,
              invoiceQty: invItem.quantity,
              grnQty: grnItem.deliveredQty,
              invoicePrice: invItem.unitPrice,
              poPrice: poItem.unitPrice
            });
          }
        }
      });

      const matchResult = {
        hasVariances: variances.length > 0,
        variances,
        matchedAt: Date.now(),
        matchedBy: auth.currentUser?.uid
      };

      await updateData(`invoices/${invoiceId}`, {
        matchResult,
        status: variances.length > 0 ? 'variance_review' : 'verified',
        updatedAt: Date.now()
      });

      return matchResult;
    } catch (error) {
      throw new Error(`Failed to perform 3-way match: ${error.message}`);
    }
  },

  async updatePaymentStatus(invoiceId, paymentData) {
    try {
      const updates = {
        paymentStatus: paymentData.status,
        paymentMethod: paymentData.method,
        paymentDate: paymentData.date,
        paymentAmount: paymentData.amount,
        paymentNotes: paymentData.notes || '',
        updatedAt: Date.now(),
        updatedBy: auth.currentUser?.uid
      };
      
      await updateData(`invoices/${invoiceId}`, updates);
      return updates;
    } catch (error) {
      throw new Error(`Failed to update payment status: ${error.message}`);
    }
  }
};