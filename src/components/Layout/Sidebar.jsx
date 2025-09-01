import React from 'react';
import { NavLink } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import {
  Home, Users, Package, TruckIcon, FileText, BarChart3,
  Settings, ShoppingCart, Clipboard, Archive, Factory, Package2, Send,
  Eye, Database, Receipt, CheckCircle, Clock, TrendingUp, Crown, ClipboardCheck
} from 'lucide-react';

const Sidebar = () => {
  const { userRole, hasRole } = useRole();

  const getMenuItems = () => {
    if (!userRole) return [];

    const baseItems = [
      {
        title: 'Dashboard',
        icon: Home,
        path: '/dashboard',
        roles: ['all']
      }
    ];

    // Admin gets full access to everything
    if (hasRole('Admin')) {
      return [
        ...baseItems,
        {
          title: 'User Management',
          icon: Users,
          path: '/admin/users',
          roles: ['Admin']
        },
        {
          title: 'Supplier Management',
          icon: TruckIcon,
          path: '/admin/suppliers',
          roles: ['Admin']
        },
        {
          title: 'Product Management',
          icon: Package,
          path: '/admin/products',
          roles: ['Admin']
        },
        {
          title: 'Material Management',
          icon: Package2,
          path: '/admin/materials',
          roles: ['Admin']
        },
        {
          title: 'Data Entry',
          icon: FileText,
          path: '/admin/data-entry',
          roles: ['Admin']
        },
        {
          title: 'Admin Reports',
          icon: BarChart3,
          path: '/admin/reports/supplier-performance',
          roles: ['Admin']
        },
        {
          title: 'Packing Material Status',
          icon: ShoppingCart,
          path: '/admin/reports/packing-material-requests',
          roles: ['Admin']
        },
        {
          title: 'System Override',
          icon: Settings,
          path: '/admin/system/data-override',
          roles: ['Admin']
        }
      ];
    }

    // ReadOnly Admin
    if (hasRole('ReadOnlyAdmin')) {
      return [
        ...baseItems,
        {
          title: 'View Users',
          icon: Eye,
          path: '/admin/users',
          roles: ['ReadOnlyAdmin']
        },
        {
          title: 'View Suppliers',
          icon: TruckIcon,
          path: '/admin/suppliers',
          roles: ['ReadOnlyAdmin']
        },
        {
          title: 'Reports',
          icon: BarChart3,
          path: '/reports',
          roles: ['ReadOnlyAdmin']
        }
      ];
    }

    // Warehouse Staff
    if (hasRole('WarehouseStaff')) {
      return [
        ...baseItems,
        {
          title: 'Raw Materials',
          icon: Package,
          path: '/warehouse/raw-materials',
          roles: ['WarehouseStaff']
        },
        {
          title: 'Raw Material Requests',
          icon: Package,
          path: '/warehouse/raw-materials/requests',
          roles: ['WarehouseStaff']
        },
        {
          title: 'Packing Materials',
          icon: Archive,
          path: '/warehouse/packing-materials',
          roles: ['WarehouseStaff']
        },
        {
          title: 'Packing Material Requests',
          icon: ShoppingCart,
          path: '/warehouse/packing-materials/requests',
          roles: ['WarehouseStaff']
        },
        {
          title: 'Purchase Orders',
          icon: FileText,
          path: '/warehouse/purchase-orders',
          roles: ['WarehouseStaff']
        },
        {
          title: 'Goods Receipts',
          icon: Package,
          path: '/warehouse/goods-receipts',
          roles: ['WarehouseStaff']
        },
        {
          title: 'Invoices & Payments',
          icon: Receipt,
          path: '/warehouse/invoices',
          roles: ['WarehouseStaff']
        },
        {
          title: 'Purchase Preparation',
          icon: ShoppingCart,
          path: '/warehouse/purchase-preparation',
          roles: ['WarehouseStaff']
        },
        {
          title: 'Packing Material QC',
          icon: ClipboardCheck,
          path: '/warehouse/packing-materials/delivery-qc',
          roles: ['WarehouseStaff']
        },
        {
          title: 'GRN Quality Control',
          icon: ClipboardCheck,
          path: '/warehouse/qc/grn-list',
          roles: ['WarehouseStaff']
        },
        {
          title: 'Request History',
          icon: Clock,
          path: '/approvals/history',
          roles: ['WarehouseStaff', 'Admin']
        }
      ];
    }

    // Production Manager
    if (hasRole('ProductionManager')) {
      return [
        ...baseItems,
        {
          title: 'Production',
          icon: Factory,
          path: '/production',
          roles: ['ProductionManager']
        },
        {
          title: 'Raw Materials',
          icon: Package,
          path: '/warehouse/raw-materials',
          roles: ['ProductionManager']
        }
      ];
    }

    // Packing Materials Store Manager
    if (hasRole('PackingMaterialsStoreManager')) {
      return [
        ...baseItems,
        {
          title: 'Stock List',
          icon: Archive,
          path: '/packing-materials/stock',
          roles: ['PackingMaterialsStoreManager']
        },
        {
          title: 'Internal Requests',
          icon: Package,
          path: '/packing-materials/requests/internal',
          roles: ['PackingMaterialsStoreManager']
        },
        {
          title: 'Send to Packing',
          icon: ShoppingCart,
          path: '/packing-materials/send',
          roles: ['PackingMaterialsStoreManager']
        },
        {
          title: 'Request Purchase',
          icon: ShoppingCart,
          path: '/packing-materials/request',
          roles: ['PackingMaterialsStoreManager']
        },
        {
          title: 'Request History',
          icon: Clock,
          path: '/packing-materials/requests/history',
          roles: ['PackingMaterialsStoreManager']
        },
        {
          title: 'Dispatch History',
          icon: Send,
          path: '/packing-materials/dispatches',
          roles: ['PackingMaterialsStoreManager']
        },
        {
          title: 'All Request History',
          icon: FileText,
          path: '/approvals/history',
          roles: ['PackingMaterialsStoreManager', 'Admin']
        }
      ];
    }

    // Finished Goods Store Manager
    if (hasRole('FinishedGoodsStoreManager')) {
      return [
        ...baseItems,
        {
          title: 'Finished Goods',
          icon: ShoppingCart,
          path: '/finished-goods',
          roles: ['FinishedGoodsStoreManager']
        }
      ];
    }

    // Head of Operations
    if (hasRole('HeadOfOperations')) {
      return [
        ...baseItems,
        {
          title: 'Approval Queue',
          icon: CheckCircle,
          path: '/approvals',
          roles: ['HeadOfOperations']
        },
        {
          title: 'Request History',
          icon: Clock,
          path: '/approvals/history',
          roles: ['HeadOfOperations']
        },
        {
          title: 'Supplier Monitoring',
          icon: TrendingUp,
          path: '/approvals/supplier-monitoring',
          roles: ['HeadOfOperations']
        },
        {
          title: 'Reports',
          icon: BarChart3,
          path: '/reports',
          roles: ['HeadOfOperations']
        },
        {
          title: 'Packing Material Status',
          icon: ShoppingCart,
          path: '/admin/reports/packing-material-requests',
          roles: ['HeadOfOperations']
        }
      ];
    }

    // Main Director
    if (hasRole('MainDirector')) {
      return [
        ...baseItems,
        {
          title: 'Final Approval Queue',
          icon: Crown,
          path: '/approvals',
          roles: ['MainDirector']
        },
        {
          title: 'Request History',
          icon: Clock,
          path: '/approvals/history',
          roles: ['MainDirector', 'Admin']
        },
        {
          title: 'Strategic Reports',
          icon: BarChart3,
          path: '/reports',
          roles: ['MainDirector']
        },
        {
          title: 'Supplier Analysis',
          icon: TrendingUp,
          path: '/reports/supplier-performance',
          roles: ['MainDirector']
        },
        {
          title: 'Packing Material Status',
          icon: ShoppingCart,
          path: '/admin/reports/packing-material-requests',
          roles: ['MainDirector']
        }
      ];
    }

    // Packing Area Manager
    if (hasRole('PackingAreaManager')) {
      return [
        ...baseItems,
        {
          title: 'Request Products',
          icon: Package,
          path: '/packing-area/request-products',
          roles: ['PackingAreaManager']
        },
        {
          title: 'Request Materials',
          icon: Archive,
          path: '/packing-area/request-materials',
          roles: ['PackingAreaManager']
        },
        {
          title: 'Dispatch to FG Store',
          icon: Send,
          path: '/packing-area/dispatch',
          roles: ['PackingAreaManager']
        }
      ];
    }

    // Data Entry
    if (hasRole('DataEntry')) {
      return [
        ...baseItems,
        {
          title: 'Data Entry',
          icon: FileText,
          path: '/data-entry',
          roles: ['DataEntry']
        }
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen">
      <div className="p-6">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold">{userRole?.department}</h2>
          <p className="text-gray-400 text-sm">{userRole?.role}</p>
        </div>
        
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;