import { getData, setData, updateData, pushData } from '../firebase/db';
import { auth } from '../firebase/auth';

export const requestService = {
  async createMaterialRequest(requestData) {
    try {
      const currentUser = auth.currentUser;
      const request = {
        ...requestData,
        status: 'pending',
        requestedBy: auth.currentUser?.uid,
        requestedByName: currentUser?.displayName || currentUser?.email || 'Warehouse Staff',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const id = await pushData('materialRequests', request);
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

      return filteredRequests.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      throw new Error(`Failed to fetch material requests: ${error.message}`);
    }
  },

  async createProductRequest(requestData) {
    try {
      const currentUser = auth.currentUser;
      const request = {
        ...requestData,
        status: 'pending',
        requestedBy: auth.currentUser?.uid,
        requestedByName: currentUser?.displayName || currentUser?.email || 'Packing Area Manager',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const id = await pushData('productRequests', request);
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
      
      if (filters.requestedBy) {
        filteredRequests = filteredRequests.filter(req => req.requestedBy === filters.requestedBy);
      }

      return filteredRequests.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      throw new Error(`Failed to fetch product requests: ${error.message}`);
    }
  },

  async getRequests(filters = {}) {
    try {
      const [materialRequests, productRequests] = await Promise.all([
        this.getMaterialRequests(filters),
        this.getProductRequests(filters)
      ]);

      // Add type identifier to each request
      const allRequests = [
        ...materialRequests.map(req => ({ ...req, type: 'material' })),
        ...productRequests.map(req => ({ ...req, type: 'product' }))
      ];

      return allRequests.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      throw new Error(`Failed to fetch all requests: ${error.message}`);
    }
  },

  async approveRequest(requestId, approverData) {
    try {
      const updates = {
        status: 'approved_by_ho',
        approvedBy: approverData?.approvedBy || auth.currentUser?.uid,
        hoApprovedBy: approverData?.approvedBy || auth.currentUser?.uid,
        hoApprovedAt: Date.now(),
        hoApprovalComments: approverData?.comments || '',
        updatedAt: Date.now()
      };
      
      await updateData(`materialRequests/${requestId}`, updates);
      return updates;
    } catch (error) {
      throw new Error(`Failed to HO approve material request: ${error.message}`);
    }
  },

  async forwardToMD(requestId, forwardData) {
    try {
      // First check if HO has approved this request
      const request = await getData(`materialRequests/${requestId}`);
      if (!request || request.status !== 'approved_by_ho') {
        throw new Error('Request must be approved by HO before forwarding to MD');
      }
      
      const updates = {
        status: 'forwarded_to_md',
        forwardedToMD: true,
        forwardedBy: auth.currentUser?.uid,
        forwardedAt: Date.now(),
        forwardComments: forwardData?.comments || '',
        updatedAt: Date.now()
      };
      
      await updateData(`materialRequests/${requestId}`, updates);
      return updates;
    } catch (error) {
      throw new Error(`Failed to forward request to MD: ${error.message}`);
    }
  },

  async mdApproveRequest(requestId, approvalData) {
    try {
      // Check if request was forwarded by HO
      const request = await getData(`materialRequests/${requestId}`);
      if (!request || request.status !== 'forwarded_to_md') {
        throw new Error('Only requests forwarded by HO can be approved by MD');
      }
      
      const updates = {
        status: 'md_approved',
        mdApprovedBy: auth.currentUser?.uid,
        mdApprovedAt: Date.now(),
        mdApprovalComments: approvalData?.comments || '',
        finalApproval: true,
        updatedAt: Date.now()
      };
      
      await updateData(`materialRequests/${requestId}`, updates);
      return updates;
    } catch (error) {
      throw new Error(`Failed to MD approve material request: ${error.message}`);
    }
  },

  async approveProductRequest(requestId, approverData) {
    try {
      const updates = {
        status: 'approved_by_ho',
        approvedAt: Date.now(),
        approverComments: approverData?.comments || '',
        updatedAt: Date.now()
      };
      
      await updateData(`materialRequests/${requestId}`, updates);
      return updates;
    } catch (error) {
      throw new Error(`Failed to approve material request: ${error.message}`);
    }
  },

  async rejectRequest(requestId, rejectorData) {
    try {
      const updates = {
        status: 'rejected',
        rejectedBy: rejectorData?.rejectedBy || auth.currentUser?.uid,
        rejectedAt: Date.now(),
        rejectionReason: rejectorData?.reason || '',
        updatedAt: Date.now()
      };
      
      await updateData(`materialRequests/${requestId}`, updates);
      return updates;
    } catch (error) {
      throw new Error(`Failed to reject material request: ${error.message}`);
    }
  },

  async approveProductRequest(requestId, approverData) {
    try {
      const updates = {
        status: 'approved',
        approvedBy: approverData?.approvedBy || auth.currentUser?.uid,
        hoApprovedBy: approverData?.approvedBy || auth.currentUser?.uid,
        hoApprovedAt: Date.now(),
        hoApprovalComments: approverData?.comments || '',
        updatedAt: Date.now()
      };
      
      await updateData(`productRequests/${requestId}`, updates);
      return updates;
    } catch (error) {
      throw new Error(`Failed to HO approve product request: ${error.message}`);
    }
  },

  async forwardProductToMD(requestId, forwardData) {
    try {
      // First check if HO has approved this request
      const request = await getData(`productRequests/${requestId}`);
      if (!request || request.status !== 'approved_by_ho') {
        throw new Error('Request must be approved by HO before forwarding to MD');
      }
      
      const updates = {
        status: 'forwarded_to_md',
        forwardedToMD: true,
        forwardedBy: auth.currentUser?.uid,
        forwardedAt: Date.now(),
        forwardComments: forwardData?.comments || '',
        updatedAt: Date.now()
      };
      
      await updateData(`productRequests/${requestId}`, updates);
      return updates;
    } catch (error) {
      throw new Error(`Failed to forward product request to MD: ${error.message}`);
    }
  },

  async mdApproveProductRequest(requestId, approvalData) {
    try {
      // Check if request was forwarded by HO
      const request = await getData(`productRequests/${requestId}`);
      if (!request || request.status !== 'forwarded_to_md') {
        throw new Error('Only requests forwarded by HO can be approved by MD');
      }
      
      const updates = {
        status: 'md_approved',
        mdApprovedBy: auth.currentUser?.uid,
        mdApprovedAt: Date.now(),
        mdApprovalComments: approvalData?.comments || '',
        finalApproval: true,
        updatedAt: Date.now()
      };
      
      await updateData(`productRequests/${requestId}`, updates);
      return updates;
    } catch (error) {
      throw new Error(`Failed to MD approve product request: ${error.message}`);
    }
  },

  async rejectProductRequest(requestId, rejectorData) {
    try {
      const updates = {
        status: 'rejected',
        rejectedBy: rejectorData?.rejectedBy || auth.currentUser?.uid,
        rejectedAt: Date.now(),
        rejectionReason: rejectorData?.reason || '',
        updatedAt: Date.now()
      };
      
      await updateData(`productRequests/${requestId}`, updates);
      return updates;
    } catch (error) {
      throw new Error(`Failed to reject product request: ${error.message}`);
    }
  },

  async getRequestById(requestId) {
    try {
      const materialRequest = await getData(`materialRequests/${requestId}`);
      if (materialRequest) {
        return {
          id: requestId,
          type: 'material',
          ...materialRequest
        };
      }

      const productRequest = await getData(`productRequests/${requestId}`);
      if (productRequest) {
        return {
          id: requestId,
          type: 'product',
          ...productRequest
        };
      }

      return null;
    } catch (error) {
      throw new Error(`Failed to fetch request by ID: ${error.message}`);
    }
  },

  async updateRequestStatus(requestId, status, updateData = {}) {
    try {
      const materialRequest = await getData(`materialRequests/${requestId}`);
      if (materialRequest) {
        await updateData(`materialRequests/${requestId}`, {
          status,
          ...updateData,
          updatedAt: Date.now()
        });
        return true;
      }
      
      const productRequest = await getData(`productRequests/${requestId}`);
      if (productRequest) {
        await updateData(`productRequests/${requestId}`, {
          status,
          ...updateData,
          updatedAt: Date.now()
        });
        return true;
      }
      
      throw new Error('Request not found');
    } catch (error) {
      throw new Error(`Failed to update request status: ${error.message}`);
    }
  },

  async getPendingRequestsCount() {
    try {
      const [materialRequests, productRequests] = await Promise.all([
        this.getMaterialRequests({ status: 'pending' }),
        this.getProductRequests({ status: 'pending' })
      ]);
      
      return materialRequests.length + productRequests.length;
    } catch (error) {
      throw new Error(`Failed to get pending requests count: ${error.message}`);
    }
  },

  // MD Approval methods
  async mdApproveRequest(requestId, approvalData) {
    try {
      const updates = {
        status: 'md_approved',
        mdApprovedBy: auth.currentUser?.uid,
        mdApprovedAt: Date.now(),
        mdApprovalNotes: approvalData?.notes || '',
        updatedAt: Date.now()
      };
      
      await updateData(`productRequests/${requestId}`, updates);
      return updates;
    } catch (error) {
      throw new Error(`Failed to MD approve product request: ${error.message}`);
    }
  }
};