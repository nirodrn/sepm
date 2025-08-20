import { getData, setData, updateData, pushData, removeData } from '../firebase/db';

export const warehouseService = {
  // Raw Materials
  async getRawMaterials() {
    return await getData('rawMaterials');
  },

  async addRawMaterial(material) {
    return await pushData('rawMaterials', {
      ...material,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  },

  async updateRawMaterial(id, updates) {
    return await updateData(`rawMaterials/${id}`, {
      ...updates,
      updatedAt: Date.now()
    });
  },

  // Suppliers
  async getSuppliers() {
    return await getData('suppliers');
  },

  async addSupplier(supplier) {
    return await pushData('suppliers', {
      ...supplier,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  },

  // Material Requests
  async createMaterialRequest(request) {
    return await pushData('materialRequests', {
      ...request,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  },

  async getMaterialRequests(filters = {}) {
    const requests = await getData('materialRequests');
    if (!requests) return [];

    let filteredRequests = Object.entries(requests).map(([id, request]) => ({
      id,
      ...request
    }));

    if (filters.status) {
      filteredRequests = filteredRequests.filter(req => req.status === filters.status);
    }

    return filteredRequests;
  }
};