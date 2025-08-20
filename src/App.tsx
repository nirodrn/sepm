import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useRole } from './hooks/useRole';

// Layout Components
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';

// Dashboard Pages
import AdminDashboard from './pages/Admin/Dashboard';
import ReadOnlyAdminDashboard from './pages/ReadOnlyAdmin/Dashboard';
import WarehouseOperationsDashboard from './pages/WarehouseOperations/Dashboard';
import HeadOfOperationsDashboard from './pages/HeadOfOperations/Dashboard';
import MainDirectorDashboard from './pages/MainDirector/Dashboard';
import ProductionDashboard from './pages/Production/Dashboard';
import FinishedGoodsStoreDashboard from './pages/FinishedGoodsStore/Dashboard';
import PackingMaterialsStoreDashboard from './pages/PackingMaterialsStore/Dashboard';
import PackingAreaDashboard from './pages/PackingArea/Dashboard';

// Head of Operations Pages
import ApprovalQueue from './pages/HeadOfOperations/ApprovalQueue';
import RequestHistory from './pages/HeadOfOperations/RequestHistory';
import SupplierMonitoring from './pages/HeadOfOperations/SupplierMonitoring';

// Admin Pages
import UserList from './pages/Admin/UserManagement/List';
import AddUser from './pages/Admin/UserManagement/AddUser';
import UserDetail from './pages/Admin/UserManagement/UserDetail';
import SupplierList from './pages/Admin/SupplierManagement/List';
import AddSupplier from './pages/Admin/SupplierManagement/AddSupplier';
import SupplierDetail from './pages/Admin/SupplierManagement/SupplierDetail';
import ProductList from './pages/Admin/DataEntry/ProductList';
import EditProduct from './pages/Admin/DataEntry/EditProduct';
import MaterialList from './pages/Admin/DataEntry/MaterialList';
import EditMaterial from './pages/Admin/DataEntry/EditMaterial';
import DataOverride from './pages/Admin/SystemOverride/DataOverride';
import SupplierPerformance from './pages/Admin/Reports/SupplierPerformance';
import StockAnalysis from './pages/Admin/Reports/StockAnalysis';
import SalesPerformance from './pages/Admin/Reports/SalesPerformance';

// ReadOnly Admin Pages
import ReportsView from './pages/ReadOnlyAdmin/ReportsView';

// Packing Materials Store Pages
import StockList from './pages/PackingMaterialsStore/StockList';
import SendToPackingArea from './pages/PackingMaterialsStore/SendToPackingArea';
import RequestPurchase from './pages/PackingMaterialsStore/RequestPurchase';

// Warehouse Operations Pages
import RawMaterialsList from './pages/WarehouseOperations/RawMaterials/List';
import RawMaterialRequestForm from './pages/WarehouseOperations/RawMaterials/RequestForm';
import RawMaterialQCForm from './pages/WarehouseOperations/RawMaterials/QCForm';
import RawMaterialStockDetail from './pages/WarehouseOperations/RawMaterials/StockDetail';
import RawMaterialPriceQualityHistory from './pages/WarehouseOperations/RawMaterials/PriceQualityHistory';
import SupplierAllocation from './pages/WarehouseOperations/RawMaterials/SupplierAllocation';

// Packing Materials Pages
import PackingMaterialsList from './pages/WarehouseOperations/PackingMaterials/List';
import PackingMaterialRequestForm from './pages/WarehouseOperations/PackingMaterials/RequestForm';
import PackingMaterialQCForm from './pages/WarehouseOperations/PackingMaterials/QCForm';
import PackingMaterialStockDetail from './pages/WarehouseOperations/PackingMaterials/StockDetail';
import PackingMaterialPriceQualityHistory from './pages/WarehouseOperations/PackingMaterials/PriceQualityHistory';

// Purchase Order Pages
import PurchaseOrderList from './pages/WarehouseOperations/PurchaseOrders/List';
import CreatePO from './pages/WarehouseOperations/RawMaterials/CreatePO';

// Goods Receipt Pages
import GoodsReceiptList from './pages/WarehouseOperations/GoodsReceipts/List';
import CreateGRN from './pages/WarehouseOperations/GoodsReceipts/CreateGRN';

// Invoice and Payment Pages
import InvoiceList from './pages/WarehouseOperations/Invoices/List';
import RecordPayment from './pages/WarehouseOperations/Payments/RecordPayment';

// Data Entry Pages
import DataEntryDashboard from './pages/DataEntry/Dashboard';
import AddProduct from './pages/DataEntry/AddProduct';
import AddMaterial from './pages/DataEntry/AddMaterial';
import MaterialTypes from './pages/DataEntry/MaterialTypes';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, loading } = useAuth();
  const { hasRole } = useRole();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
};

// Dashboard Router Component
const DashboardRouter = () => {
  const { userRole } = useRole();

  if (!userRole) return null;

  switch (userRole.role) {
    case 'Admin':
      return <AdminDashboard />;
    case 'ReadOnlyAdmin':
      return <ReadOnlyAdminDashboard />;
    case 'WarehouseStaff':
      return <WarehouseOperationsDashboard />;
    case 'HeadOfOperations':
      return <HeadOfOperationsDashboard />;
    case 'MainDirector':
      return <MainDirectorDashboard />;
    case 'ProductionManager':
      return <ProductionDashboard />;
    case 'PackingAreaManager':
      return <PackingAreaDashboard />;
    case 'FinishedGoodsStoreManager':
      return <FinishedGoodsStoreDashboard />;
    case 'PackingMaterialsStoreManager':
      return <PackingMaterialsStoreDashboard />;
    case 'DataEntry':
      return <DataEntryDashboard />;
    default:
      return <AdminDashboard />;
  }
};

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user ? (
          <div className="flex">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <DashboardRouter />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/login" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Placeholder routes - will be implemented later */}
                  <Route path="/admin/users" element={<ProtectedRoute requiredRoles={['Admin']}><UserList /></ProtectedRoute>} />
                  <Route path="/admin/users/add" element={<ProtectedRoute requiredRoles={['Admin']}><AddUser /></ProtectedRoute>} />
                  <Route path="/admin/users/edit/:id" element={<ProtectedRoute requiredRoles={['Admin']}><AddUser /></ProtectedRoute>} />
                  <Route path="/admin/users/:id" element={<ProtectedRoute requiredRoles={['Admin']}><UserDetail /></ProtectedRoute>} />
                  
                  {/* Admin Supplier Management Routes */}
                  <Route path="/admin/suppliers" element={<ProtectedRoute requiredRoles={['Admin']}><SupplierList /></ProtectedRoute>} />
                  <Route path="/admin/suppliers/add" element={<ProtectedRoute requiredRoles={['Admin']}><AddSupplier /></ProtectedRoute>} />
                  <Route path="/admin/suppliers/edit/:id" element={<ProtectedRoute requiredRoles={['Admin']}><AddSupplier /></ProtectedRoute>} />
                  <Route path="/admin/suppliers/:id" element={<ProtectedRoute requiredRoles={['Admin']}><SupplierDetail /></ProtectedRoute>} />
                  
                  {/* Admin Product Management Routes */}
                  <Route path="/admin/products" element={<ProtectedRoute requiredRoles={['Admin']}><ProductList /></ProtectedRoute>} />
                  <Route path="/admin/products/edit/:id" element={<ProtectedRoute requiredRoles={['Admin']}><EditProduct /></ProtectedRoute>} />
                  
                  {/* Admin Material Management Routes */}
                  <Route path="/admin/materials" element={<ProtectedRoute requiredRoles={['Admin']}><MaterialList /></ProtectedRoute>} />
                  <Route path="/admin/materials/edit/:id" element={<ProtectedRoute requiredRoles={['Admin']}><EditMaterial /></ProtectedRoute>} />
                  
                  {/* Admin System Override Routes */}
                  <Route path="/admin/system/data-override" element={<ProtectedRoute requiredRoles={['Admin']}><DataOverride /></ProtectedRoute>} />
                  
                  {/* Admin Data Entry Routes */}
                  <Route path="/admin/data-entry" element={<ProtectedRoute requiredRoles={['Admin']}><DataEntryDashboard /></ProtectedRoute>} />
                  <Route path="/admin/data-entry/add-product" element={<ProtectedRoute requiredRoles={['Admin']}><AddProduct /></ProtectedRoute>} />
                  <Route path="/admin/data-entry/add-material" element={<ProtectedRoute requiredRoles={['Admin']}><AddMaterial /></ProtectedRoute>} />
                  <Route path="/admin/data-entry/material-types" element={<ProtectedRoute requiredRoles={['Admin']}><MaterialTypes /></ProtectedRoute>} />
                  
                  {/* Admin Reports Routes */}
                  <Route path="/admin/reports/supplier-performance" element={<ProtectedRoute requiredRoles={['Admin']}><SupplierPerformance /></ProtectedRoute>} />
                  <Route path="/admin/reports/stock-analysis" element={<ProtectedRoute requiredRoles={['Admin']}><StockAnalysis /></ProtectedRoute>} />
                  <Route path="/admin/reports/sales-performance" element={<ProtectedRoute requiredRoles={['Admin']}><SalesPerformance /></ProtectedRoute>} />
                  
                  <Route path="/admin/*" element={<ProtectedRoute requiredRoles={['Admin']}><div className="p-6">Other admin sections coming soon...</div></ProtectedRoute>} />
                  <Route path="/warehouse/*" element={<ProtectedRoute requiredRoles={['WarehouseStaff', 'Admin']}><div className="p-6">Warehouse section coming soon...</div></ProtectedRoute>} />
                  <Route path="/warehouse/raw-materials" element={<ProtectedRoute requiredRoles={['WarehouseStaff', 'Admin']}><RawMaterialsList /></ProtectedRoute>} />
                  <Route path="/warehouse/raw-materials/request" element={<ProtectedRoute requiredRoles={['WarehouseStaff', 'Admin']}><RawMaterialRequestForm /></ProtectedRoute>} />
                  <Route path="/warehouse/raw-materials/:id" element={<ProtectedRoute requiredRoles={['WarehouseStaff', 'Admin']}><RawMaterialStockDetail /></ProtectedRoute>} />
                  <Route path="/warehouse/raw-materials/:id/qc" element={<ProtectedRoute requiredRoles={['WarehouseStaff', 'Admin']}><RawMaterialQCForm /></ProtectedRoute>} />
                  <Route path="/warehouse/raw-materials/price-quality-history" element={<ProtectedRoute requiredRoles={['WarehouseStaff', 'Admin']}><RawMaterialPriceQualityHistory /></ProtectedRoute>} />
                  <Route path="/warehouse/raw-materials/supplier-allocation" element={<ProtectedRoute requiredRoles={['WarehouseStaff', 'Admin']}><SupplierAllocation /></ProtectedRoute>} />
                  
                  <Route path="/warehouse/packing-materials" element={<ProtectedRoute requiredRoles={['WarehouseStaff', 'Admin']}><PackingMaterialsList /></ProtectedRoute>} />
                  <Route path="/warehouse/packing-materials/request" element={<ProtectedRoute requiredRoles={['WarehouseStaff', 'Admin']}><PackingMaterialRequestForm /></ProtectedRoute>} />
                  <Route path="/warehouse/packing-materials/:id" element={<ProtectedRoute requiredRoles={['WarehouseStaff', 'Admin']}><PackingMaterialStockDetail /></ProtectedRoute>} />
                  <Route path="/warehouse/packing-materials/:id/qc" element={<ProtectedRoute requiredRoles={['WarehouseStaff', 'Admin']}><PackingMaterialQCForm /></ProtectedRoute>} />
                  <Route path="/warehouse/packing-materials/price-quality-history" element={<ProtectedRoute requiredRoles={['WarehouseStaff', 'Admin']}><PackingMaterialPriceQualityHistory /></ProtectedRoute>} />
                  
                  {/* Purchase Order Routes */}
                  <Route path="/warehouse/purchase-orders" element={<ProtectedRoute requiredRoles={['WarehouseStaff', 'Admin']}><PurchaseOrderList /></ProtectedRoute>} />
                  <Route path="/warehouse/purchase-orders/create" element={<ProtectedRoute requiredRoles={['WarehouseStaff', 'Admin']}><CreatePO /></ProtectedRoute>} />
                  
                  {/* Goods Receipt Routes */}
                  <Route path="/warehouse/goods-receipts" element={<ProtectedRoute requiredRoles={['WarehouseStaff', 'Admin']}><GoodsReceiptList /></ProtectedRoute>} />
                  <Route path="/warehouse/goods-receipts/create" element={<ProtectedRoute requiredRoles={['WarehouseStaff', 'Admin']}><CreateGRN /></ProtectedRoute>} />
                  
                  {/* Invoice and Payment Routes */}
                  <Route path="/warehouse/invoices" element={<ProtectedRoute requiredRoles={['WarehouseStaff', 'Admin']}><InvoiceList /></ProtectedRoute>} />
                  <Route path="/warehouse/invoices/:invoiceId/payment" element={<ProtectedRoute requiredRoles={['WarehouseStaff', 'Admin']}><RecordPayment /></ProtectedRoute>} />
                  
                  {/* Head of Operations Routes */}
                  <Route path="/approvals/*" element={<ProtectedRoute requiredRoles={['HeadOfOperations', 'MainDirector']}><div className="p-6">Approvals section coming soon...</div></ProtectedRoute>} />
                  
                  {/* Head of Operations Routes */}
                  <Route path="/approvals" element={<ProtectedRoute requiredRoles={['HeadOfOperations', 'MainDirector']}><ApprovalQueue /></ProtectedRoute>} />
                  <Route path="/approvals/history" element={<ProtectedRoute requiredRoles={['HeadOfOperations', 'MainDirector']}><RequestHistory /></ProtectedRoute>} />
                  <Route path="/approvals/supplier-monitoring" element={<ProtectedRoute requiredRoles={['HeadOfOperations', 'MainDirector']}><SupplierMonitoring /></ProtectedRoute>} />
                  
                  {/* Packing Area Routes */}
                  <Route path="/packing-area/*" element={<ProtectedRoute requiredRoles={['PackingAreaManager', 'Admin']}><div className="p-6">Packing area section coming soon...</div></ProtectedRoute>} />
                  
                  <Route path="/production/*" element={<ProtectedRoute requiredRoles={['ProductionManager', 'Admin']}><div className="p-6">Production section coming soon...</div></ProtectedRoute>} />
                  <Route path="/finished-goods/*" element={<ProtectedRoute requiredRoles={['FinishedGoodsStoreManager', 'Admin']}><div className="p-6">Finished goods section coming soon...</div></ProtectedRoute>} />
                  <Route path="/packing-materials/stock" element={<ProtectedRoute requiredRoles={['PackingMaterialsStoreManager', 'Admin']}><StockList /></ProtectedRoute>} />
                  <Route path="/packing-materials/send" element={<ProtectedRoute requiredRoles={['PackingMaterialsStoreManager', 'Admin']}><SendToPackingArea /></ProtectedRoute>} />
                  <Route path="/packing-materials/request" element={<ProtectedRoute requiredRoles={['PackingMaterialsStoreManager', 'Admin']}><RequestPurchase /></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute requiredRoles={['Admin', 'ReadOnlyAdmin', 'MainDirector', 'HeadOfOperations']}><ReportsView /></ProtectedRoute>} />
                  <Route path="/reports/*" element={<ProtectedRoute requiredRoles={['Admin', 'ReadOnlyAdmin', 'MainDirector', 'HeadOfOperations']}><div className="p-6">Other reports coming soon...</div></ProtectedRoute>} />
                  
                  {/* Data Entry Routes */}
                  <Route path="/data-entry" element={<ProtectedRoute requiredRoles={['DataEntry', 'Admin']}><DataEntryDashboard /></ProtectedRoute>} />
                  <Route path="/data-entry/add-product" element={<ProtectedRoute requiredRoles={['DataEntry', 'Admin']}><AddProduct /></ProtectedRoute>} />
                  <Route path="/data-entry/add-material" element={<ProtectedRoute requiredRoles={['DataEntry', 'Admin']}><AddMaterial /></ProtectedRoute>} />
                  <Route path="/data-entry/material-types" element={<ProtectedRoute requiredRoles={['DataEntry', 'Admin']}><MaterialTypes /></ProtectedRoute>} />
                  <Route path="/data-entry/*" element={<ProtectedRoute requiredRoles={['DataEntry', 'Admin']}><div className="p-6">Other data entry sections coming soon...</div></ProtectedRoute>} />
                </Routes>
              </main>
              <Footer />
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;