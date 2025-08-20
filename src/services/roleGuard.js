const ROLE_PERMISSIONS = {
  Admin: ['all'],
  ReadOnlyAdmin: ['view:all'],
  WarehouseStaff: ['manage:warehouse', 'view:suppliers', 'manage:invoices'],
  HeadOfOperations: ['approve:materials', 'approve:products', 'view:tracking'],
  MainDirector: ['approve:high-level', 'view:oversight'],
  ProductionManager: ['manage:production', 'manage:batches'],
  PackingMaterialsStoreManager: ['manage:packing-materials'],
  FinishedGoodsStoreManager: ['manage:finished-goods'],
  DataEntry: ['manage:data-entry']
};

export const hasPermission = (userRole, permission) => {
  if (!userRole || !userRole.role) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[userRole.role] || [];
  
  return rolePermissions.includes('all') || rolePermissions.includes(permission);
};

export const canAccessRoute = (userRole, routePermissions) => {
  if (!routePermissions) return true;
  
  return routePermissions.some(permission => hasPermission(userRole, permission));
};