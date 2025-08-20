import { getData, setData, updateData, pushData } from '../firebase/db';

export const fgStoreService = {
  // Inventory
  async getInventory() {
    return await getData('finishedGoodsInventory');
  },

  async updateStock(productId, quantity, location) {
    const updates = {
      quantity,
      location,
      lastUpdated: Date.now()
    };
    
    return await updateData(`finishedGoodsInventory/${productId}`, updates);
  },

  // Dispatches
  async getDispatches() {
    return await getData('dispatches');
  },

  async createDispatch(dispatch) {
    return await pushData('dispatches', {
      ...dispatch,
      status: 'pending',
      createdAt: Date.now()
    });
  },

  // Expiry Alerts
  async getExpiryAlerts() {
    const inventory = await this.getInventory();
    if (!inventory) return [];

    const currentDate = new Date();
    const thirtyDaysFromNow = new Date(currentDate.getTime() + (30 * 24 * 60 * 60 * 1000));

    return Object.entries(inventory).filter(([id, item]) => {
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= thirtyDaysFromNow;
    }).map(([id, item]) => ({ id, ...item }));
  }
};