import { getData, setData, updateData, pushData } from '../firebase/db';
import { auth } from '../firebase/auth';

export const paymentService = {
  async recordPayment(paymentData) {
    try {
      const payment = {
        ...paymentData,
        paymentNumber: await this.generatePaymentNumber(),
        status: 'posted',
        createdBy: auth.currentUser?.uid,
        createdAt: Date.now()
      };
      
      const id = await pushData('payments', payment);
      
      // Update invoice payment status
      await this.updateInvoicePaymentStatus(paymentData.invoiceId, paymentData.amount);
      
      return { id, ...payment };
    } catch (error) {
      throw new Error(`Failed to record payment: ${error.message}`);
    }
  },

  async getPayments(filters = {}) {
    try {
      const payments = await getData('payments');
      if (!payments) return [];
      
      let filteredPayments = Object.entries(payments).map(([id, payment]) => ({
        id,
        ...payment
      }));

      if (filters.invoiceId) {
        filteredPayments = filteredPayments.filter(payment => payment.invoiceId === filters.invoiceId);
      }
      
      if (filters.supplierId) {
        filteredPayments = filteredPayments.filter(payment => payment.supplierId === filters.supplierId);
      }

      return filteredPayments.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }
  },

  async updateInvoicePaymentStatus(invoiceId, paidAmount) {
    try {
      const invoice = await getData(`invoices/${invoiceId}`);
      if (!invoice) return;
      
      const totalPaid = (invoice.totalPaid || 0) + paidAmount;
      const remaining = invoice.total - totalPaid;
      
      let paymentStatus = 'pending';
      if (remaining <= 0) {
        paymentStatus = 'paid';
      } else if (totalPaid > 0) {
        paymentStatus = 'partially_paid';
      }
      
      await updateData(`invoices/${invoiceId}`, {
        totalPaid,
        remainingAmount: Math.max(0, remaining),
        paymentStatus,
        lastPaymentDate: Date.now(),
        updatedAt: Date.now()
      });
    } catch (error) {
      throw new Error(`Failed to update invoice payment status: ${error.message}`);
    }
  },

  async generatePaymentNumber() {
    try {
      const payments = await getData('payments');
      const count = payments ? Object.keys(payments).length : 0;
      const year = new Date().getFullYear();
      return `PAY${year}${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      return `PAY${new Date().getFullYear()}${String(Date.now()).slice(-4)}`;
    }
  }
};