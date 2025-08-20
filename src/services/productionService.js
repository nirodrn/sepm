import { getData, setData, updateData, pushData } from '../firebase/db';

export const productionService = {
  // Batches
  async getBatches() {
    return await getData('productionBatches');
  },

  async createBatch(batch) {
    return await pushData('productionBatches', {
      ...batch,
      status: 'created',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  },

  async updateBatchStatus(batchId, status, qcData = {}) {
    return await updateData(`productionBatches/${batchId}`, {
      status,
      qcData,
      updatedAt: Date.now()
    });
  },

  // QC Records
  async recordQCData(batchId, stage, qcData) {
    const qcRecord = {
      batchId,
      stage, // 'mixing', 'heating', 'cooling'
      ...qcData,
      timestamp: Date.now()
    };
    
    return await pushData(`qcRecords/${batchId}`, qcRecord);
  },

  async getQCRecords(batchId) {
    return await getData(`qcRecords/${batchId}`);
  }
};