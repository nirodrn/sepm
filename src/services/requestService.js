import { getData, setData, updateData, pushData } from '../firebase/db';
import { auth } from '../firebase/auth';

export const requestService = {
  // Material Requests
  async createMaterialRequest(requestData) {
    try {
      const request = {
        ...requestData,
        requestedBy: auth.currentUser?.uid,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const id = await pushData('materialRequests', request);
      
      // Notify HO about new request
      await this.notifyHeadOfOperations(id, request);
      
      return { id, ...request };
    } catch (error) {
      throw new Error(`Failed to create material request: ${error.message}`);
    }
  },

  async getMaterialRequests(filters = {}) {
    try {
      const requests = await getData('materialRequests');
      if (!requests) return [];
      
      let filteredRequests = Object.entries(requests).map(([id, request]) => ({
        id,
        ...request
      }));

      if (filters.status) {
        filteredRequests = filteredRequests.filter(req => req.status === filters.status);
      }
      
      if (filters.requestedBy) {
        filteredRequests = filteredRequests.filter(req => req.requestedBy === filters.requestedBy);
      }
      
      if (filters.requestType) {
        filteredRequests = filteredRequests.filter(req => req.requestType === filters.requestType);
      }
      
      if (filters.dateFrom) {
        filteredRequests = filteredRequests.filter(req => req.createdAt >= filters.dateFrom);
      }

      return filteredRequests.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      throw new Error(`Failed to fetch material requests: ${error.message}`);
    }
  },

  async approveRequest(requestId, approvalData) {
    try {
      const updates = {
        status: 'ho_approved',
        approvedBy: auth.currentUser?.uid,
        approvedAt: Date.now(),
        approvalNotes: approvalData.notes || '',
        updatedAt: Date.now()
      };
      
      await updateData(`materialRequests/${requestId}`, updates);
      
      // Notify requester about approval
      await this.notifyRequestStatus(requestId, 'approved');
      
      return updates;
    } catch (error) {
      throw new Error(`Failed to approve request: ${error.message}`);
    }
  },

  async mdApproveRequest(requestId, approvalData) {
    try {
      const updates = {
        status: 'md_approved',
        mdApprovedBy: auth.currentUser?.uid,
        mdApprovedAt: Date.now(),
        mdApprovalNotes: approvalData.notes || '',
        updatedAt: Date.now()
      };
      
      await updateData(`materialRequests/${requestId}`, updates);
      
      // Notify warehouse staff that they can create PO
      await this.notifyRequestStatus(requestId, 'md_approved');
      
      return updates;
    } catch (error) {
      throw new Error(`Failed to MD approve request: ${error.message}`);
    }
  },

  async rejectRequest(requestId, rejectionData) {
    try {
      const updates = {
        status: 'rejected',
        rejectedBy: auth.currentUser?.uid,
        rejectedAt: Date.now(),
        rejectionReason: rejectionData.reason || '',
        updatedAt: Date.now()
      };
      
      await updateData(`materialRequests/${requestId}`, updates);
      
      // Notify requester about rejection
      await this.notifyRequestStatus(requestId, 'rejected');
      
      return updates;
    } catch (error) {
      throw new Error(`Failed to reject request: ${error.message}`);
    }
  },

  // Product Requests (DR/Distributor)
  async createProductRequest(requestData) {
    try {
      const request = {
        ...requestData,
        requestedBy: auth.currentUser?.uid,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const id = await pushData('productRequests', request);
      
      // Notify HO about new product request
      await this.notifyHeadOfOperations(id, request, 'product');
      
      return { id, ...request };
    } catch (error) {
      throw new Error(`Failed to create product request: ${error.message}`);
    }
  },

  async getProductRequests(filters = {}) {
    try {
      const requests = await getData('productRequests');
      if (!requests) return [];
      
      let filteredRequests = Object.entries(requests).map(([id, request]) => ({
        id,
        ...request
      }));

      if (filters.status) {
        filteredRequests = filteredRequests.filter(req => req.status === filters.status);
      }
      
      if (filters.requestType) {
        filteredRequests = filteredRequests.filter(req => req.requestType === filters.requestType);
      }

      return filteredRequests.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      throw new Error(`Failed to fetch product requests: ${error.message}`);
    }
  },

  // Product Requests (DR/Distributor)
  async createProductRequest(requestData) {
    try {
      const request = {
        ...requestData,
        requestedBy: auth.currentUser?.uid,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const id = await pushData('productRequests', request);
      
      // Notify HO about new product request
      await this.notifyHeadOfOperations(id, request, 'product');
      
      return { id, ...request };
    } catch (error) {
      throw new Error(`Failed to create product request: ${error.message}`);
    }
  },

  async getProductRequests(filters = {}) {
    try {
      const requests = await getData('productRequests');
      if (!requests) return [];
      
      let filteredRequests = Object.entries(requests).map(([id, request]) => ({
        id,
        ...request
      }));

      if (filters.status) {
        filteredRequests = filteredRequests.filter(req => req.status === filters.status);
      }
      
      if (filters.requestType) {
        filteredRequests = filteredRequests.filter(req => req.requestType === filters.requestType);
      }

      return filteredRequests.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      throw new Error(`Failed to fetch product requests: ${error.message}`);
    }
  },

  async approveProductRequest(requestId, approvalData) {
    try {
      const updates = {
        status: 'ho_approved',
        approvedBy: auth.currentUser?.uid,
        approvedAt: Date.now(),
        approvalNotes: approvalData.notes || '',
        updatedAt: Date.now()
      };
      
      await updateData(`productRequests/${requestId}`, updates);
      
      // Notify requester about approval
      await this.notifyRequestStatus(requestId, 'approved', 'product');
      
      return updates;
    } catch (error) {
      throw new Error(`Failed to approve product request: ${error.message}`);
    }
  },

  async rejectProductRequest(requestId, rejectionData) {
    try {
      const updates = {
        status: 'rejected',
        rejectedBy: auth.currentUser?.uid,
        rejectedAt: Date.now(),
        rejectionReason: rejectionData.reason || '',
        updatedAt: Date.now()
      };
      
      await updateData(`productRequests/${requestId}`, updates);
      
      // Notify requester about rejection
      await this.notifyRequestStatus(requestId, 'rejected', 'product');
      
      return updates;
    } catch (error) {
      throw new Error(`Failed to reject product request: ${error.message}`);
    }
  },

  // Supplier Allocation
  async createSupplierAllocation(allocationData) {
    try {
      const allocation = {
        ...allocationData,
        createdBy: auth.currentUser?.uid,
        createdAt: Date.now(),
        status: 'allocated'
      };
      
      const id = await pushData('supplierAllocations', allocation);
      
      // Update request status
      await updateData(`materialRequests/${allocationData.requestId}`, {
        status: 'allocated',
        allocationId: id,
        updatedAt: Date.now()
      });
      
      return { id, ...allocation };
    } catch (error) {
      throw new Error(`Failed to create supplier allocation: ${error.message}`);
    }
  },

  async getSupplierAllocations(filters = {}) {
    try {
      const allocations = await getData('supplierAllocations');
      if (!allocations) return [];
      
      let filteredAllocations = Object.entries(allocations).map(([id, allocation]) => ({
        id,
        ...allocation
      }));

      if (filters.requestId) {
        filteredAllocations = filteredAllocations.filter(alloc => alloc.requestId === filters.requestId);
      }

      return filteredAllocations.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      throw new Error(`Failed to fetch supplier allocations: ${error.message}`);
    }
  },

  // Notifications
  async notifyHeadOfOperations(requestId, requestData, type = 'material') {
    try {
      const notification = {
        type: `${type}_request`,
        requestId,
        message: `New ${type} request from ${requestData.requestedBy}`,
        status: 'unread',
        createdAt: Date.now()
      };
      
      await pushData('notifications/ho', notification);
    } catch (error) {
      console.error('Failed to notify HO:', error);
    }
  },

  async notifyRequestStatus(requestId, status, type = 'material') {
    try {
      const requestPath = type === 'material' ? 'materialRequests' : 'productRequests';
      const request = await getData(`${requestPath}/${requestId}`);
      if (!request) return;
      
      const notification = {
        type: 'request_status',
        requestId,
        message: `Your ${type} request has been ${status}`,
        status: 'unread',
        createdAt: Date.now()
      };
      
      await pushData(`notifications/${request.requestedBy}`, notification);
    } catch (error) {
      console.error(`Failed to notify ${type} request status:`, error);
    }
  }
};