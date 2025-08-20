import { getData, setData, updateData, pushData } from '../firebase/db';
import { auth } from '../firebase/auth';

export const grnService = {
  async createGRN(grnData) {
    try {
      const grn = {
        ...grnData,
        grnNumber: await this.generateGRNNumber(),
        status: 'pending_qc',
        createdBy: auth.currentUser?.uid,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const id = await pushData('goodsReceipts', grn);
      
      // Update PO status if fully received
      if (grnData.poId) {
        await this.updatePOReceiptStatus(grnData.poId);
      }
      
      return { id, ...grn };
    } catch (error) {
      throw new Error(`Failed to create GRN: ${error.message}`);
    }
  },

  async getGRNs(filters = {}) {
    try {
      const grns = await getData('goodsReceipts');
      if (!grns) return [];
      
      let filteredGRNs = Object.entries(grns).map(([id, grn]) => ({
        id,
        ...grn
      }));

      if (filters.status) {
        filteredGRNs = filteredGRNs.filter(grn => grn.status === filters.status);
      }
      
      if (filters.poId) {
        filteredGRNs = filteredGRNs.filter(grn => grn.poId === filters.poId);
      }

      return filteredGRNs.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      throw new Error(`Failed to fetch GRNs: ${error.message}`);
    }
  },

  async updateGRNStatus(grnId, status, qcData = {}) {
    try {
      const updates = {
        status,
        qcData,
        updatedAt: Date.now(),
        updatedBy: auth.currentUser?.uid
      };
      
      await updateData(`goodsReceipts/${grnId}`, updates);
      return updates;
    } catch (error) {
      throw new Error(`Failed to update GRN status: ${error.message}`);
    }
  },

  async updatePOReceiptStatus(poId) {
    try {
      const po = await getData(`purchaseOrders/${poId}`);
      const grns = await this.getGRNs({ poId });
      
      if (!po) return;
      
      const totalOrdered = po.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalReceived = grns.reduce((sum, grn) => 
        sum + grn.items.reduce((itemSum, item) => itemSum + item.deliveredQty, 0), 0
      );
      
      let status = 'issued';
      if (totalReceived >= totalOrdered) {
        status = 'fully_received';
      } else if (totalReceived > 0) {
        status = 'partially_received';
      }
      
      await updateData(`purchaseOrders/${poId}`, {
        status,
        totalReceived,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Failed to update PO receipt status:', error);
    }
  },

  async generateGRNNumber() {
    try {
      const grns = await getData('goodsReceipts');
      const count = grns ? Object.keys(grns).length : 0;
      const year = new Date().getFullYear();
      return `GRN${year}${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      return `GRN${new Date().getFullYear()}${String(Date.now()).slice(-4)}`;
    }
  }
};