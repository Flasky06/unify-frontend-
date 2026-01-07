import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import CreateBusiness from "../pages/auth/CreateBusiness";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import Dashboard from "../pages/Dashboard";
import AdminDashboard from "../pages/super-admin/SuperAdminDashboard";
import AdminUsers from "../pages/super-admin/AdminUsers";
import Profile from "../pages/Profile";
import { UserList } from "../pages/users/UserList";
import { SuperAdminUserList } from "../pages/users/SuperAdminUserList";
import { BusinessDetails } from "../pages/super-admin/BusinessDetails";
import SubscriptionsManagement from "../pages/super-admin/SubscriptionsManagement";
import RoleManagement from "../pages/users/RoleManagement";
import { ProductList } from "../pages/products/ProductList";
import { ProductCategoryList } from "../pages/products/ProductCategoryList";
import { BrandList } from "../pages/products/BrandList";
import { ShopList } from "../pages/shops/ShopList";
import StockList from "../pages/stocks/StockList";
import StockReturnList from "../pages/stocks/StockReturnList";
import StockTransfers from "../pages/stocks/StockTransfers";
import AddStock from "../pages/stocks/AddStock";
import { SupplierList } from "../pages/suppliers/SupplierList";
import { PurchaseOrderList } from "../pages/suppliers/PurchaseOrderList";
import { PurchaseOrderCreate } from "../pages/suppliers/PurchaseOrderCreate";
import SalesHistory from "../pages/sales/SalesHistory";
import { InvoiceList } from "../pages/sales/InvoiceList";
import SalesByItem from "../pages/sales/SalesByItem";
import { ServiceCategoryList } from "../pages/services/ServiceCategoryList";
import { ServiceList } from "../pages/services/ServiceList";
import { ExpenseCategoryList } from "../pages/expenses/ExpenseCategoryList";
import { ExpenseList } from "../pages/expenses/ExpenseList";
import ExpenseAnalytics from "../pages/expenses/ExpenseAnalytics";
import { PaymentMethodList } from "../pages/paymentMethods/PaymentMethodList";
import SalesAnalytics from "../pages/sales/SalesAnalytics";
import ReportsDashboard from "../pages/reports/ReportsDashboard";
import { SalesReport } from "../pages/reports/SalesReport";
import StockMovementReport from "../pages/reports/StockMovementReport";
import { EmployeeList } from "../pages/employees/EmployeeList";
import { EmployeeDetails } from "../pages/employees/EmployeeDetails";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/create-business",
    element: (
      <ProtectedRoute>
        <CreateBusiness />
      </ProtectedRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "users",
        element: <UserList />,
      },
      {
        path: "employees",
        children: [
          {
            index: true,
            element: <EmployeeList />,
          },
          {
            path: ":id",
            element: <EmployeeDetails />,
          },
        ],
      },
      {
        path: "users/roles",
        element: <RoleManagement />,
      },
      {
        path: "products",
        children: [
          {
            index: true,
            element: <ProductList />,
          },
          {
            path: "categories",
            element: <ProductCategoryList />,
          },
          {
            path: "brands",
            element: <BrandList />,
          },
        ],
      },
      {
        path: "shops",
        element: <ShopList />,
      },
      {
        path: "stocks",
        element: <StockList />,
      },
      {
        path: "stocks/add",
        element: <AddStock />,
      },
      {
        path: "stocks/returns",
        element: <StockReturnList />,
      },
      {
        path: "transfers",
        element: <StockTransfers />,
      },
      {
        path: "suppliers",
        element: <SupplierList />,
      },
      {
        path: "purchase-orders",
        element: <PurchaseOrderList />,
      },
      {
        path: "purchase-orders/create",
        element: <PurchaseOrderCreate />,
      },
      {
        path: "sales",
        element: <SalesHistory />,
      },
      {
        path: "invoices",
        element: <InvoiceList />,
      },
      {
        path: "sales/items",
        element: <SalesByItem />,
      },
      {
        path: "sales/analytics",
        element: <SalesAnalytics />,
      },
      {
        path: "services/categories",
        element: <ServiceCategoryList />,
      },
      {
        path: "services/products",
        element: <ServiceList />,
      },
      {
        path: "expenses/categories",
        element: <ExpenseCategoryList />,
      },
      {
        path: "expenses",
        element: <ExpenseList />,
      },
      {
        path: "expenses/analytics",
        element: <ExpenseAnalytics />,
      },
      {
        path: "reports",
        element: <ReportsDashboard />,
      },
      {
        path: "reports/sales",
        element: <SalesReport />,
      },
      {
        path: "reports/stock-movement",
        element: <StockMovementReport />,
      },
      {
        path: "payment-methods",
        element: <PaymentMethodList />,
      },
    ],
  },
  {
    path: "/super-admin",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "super-admin",
        element: <AdminDashboard />,
      },
      {
        path: "users",
        element: <AdminUsers />,
      },
      {
        path: "business-owners",
        element: <SuperAdminUserList />,
      },
      {
        path: "business/:id",
        element: <BusinessDetails />,
      },
      {
        path: "subscriptions",
        element: <SubscriptionsManagement />,
      },
    ],
  },
  {
    path: "/unauthorized",
    element: (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    ),
  },
  {
    path: "*",
    element: (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600">Page not found.</p>
        </div>
      </div>
    ),
  },
]);
