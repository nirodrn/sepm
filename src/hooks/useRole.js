import { useAuth } from './useAuth';

export const useRole = () => {
  const { userRole } = useAuth();
  
  const hasRole = (roles) => {
    if (!userRole) return false;
    if (typeof roles === 'string') {
      return userRole.role === roles;
    }
    if (Array.isArray(roles)) {
      return roles.includes(userRole.role);
    }
    return false;
  };

  const isAdmin = () => hasRole('Admin');
  const isReadOnlyAdmin = () => hasRole('ReadOnlyAdmin');
  const isWarehouseStaff = () => hasRole('WarehouseStaff');
  const isHeadOfOperations = () => hasRole('HeadOfOperations');
  const isMainDirector = () => hasRole('MainDirector');
  const isProductionManager = () => hasRole('ProductionManager');
  const isPackingStoreManager = () => hasRole('PackingMaterialsStoreManager');
  const isFGStoreManager = () => hasRole('FinishedGoodsStoreManager');
  const isDataEntry = () => hasRole('DataEntry');
  const isPackingAreaManager = () => hasRole('PackingAreaManager');

  return {
    userRole,
    hasRole,
    isAdmin,
    isReadOnlyAdmin,
    isWarehouseStaff,
    isHeadOfOperations,
    isMainDirector,
    isProductionManager,
    isPackingStoreManager,
    isFGStoreManager,
    isDataEntry,
    isPackingAreaManager
  };
};