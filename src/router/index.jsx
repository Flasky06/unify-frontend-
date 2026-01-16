import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import PermissionRoute from "../components/PermissionRoute";
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
import { AccountsSummaryReport } from "../pages/reports/AccountsSummaryReport";
import NotFound from "../pages/NotFound";

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
        element: (
          <PermissionRoute requiredRole="BUSINESS_OWNER">
            <UserList />
          </PermissionRoute>
        ),
      },
      {
        path: "employees",
        children: [
          {
            index: true,
            element: (
              <PermissionRoute requiredPermission="MANAGE_EMPLOYEES">
                <EmployeeList />
              </PermissionRoute>
            ),
          },
          {
            path: ":id",
            element: (
              <PermissionRoute requiredPermission="MANAGE_EMPLOYEES">
                <EmployeeDetails />
              </PermissionRoute>
            ),
          },
        ],
      },
      {
        path: "users/roles",
        element: (
          <PermissionRoute requiredRole="BUSINESS_OWNER">
            <RoleManagement />
          </PermissionRoute>
        ),
      },
      {
        path: "products",
        children: [
          {
            index: true,
            element: (
              <PermissionRoute requiredPermission="VIEW_PRODUCTS">
                <ProductList />
              </PermissionRoute>
            ),
          },
          {
            path: "categories",
            element: (
              <PermissionRoute requiredPermission="MANAGE_PRODUCT_CATEGORIES">
                <ProductCategoryList />
              </PermissionRoute>
            ),
          },
          {
            path: "brands",
            element: (
              <PermissionRoute requiredPermission="MANAGE_PRODUCTS">
                <BrandList />
              </PermissionRoute>
            ),
          },
        ],
      },
      {
        path: "shops",
        element: (
          <PermissionRoute requiredPermission="MANAGE_SHOPS">
            <ShopList />
          </PermissionRoute>
        ),
      },
      {
        path: "stocks",
        children: [
          {
            index: true,
            element: (
              <PermissionRoute requiredPermission="VIEW_STOCK">
                <StockList />
              </PermissionRoute>
            ),
          },
          {
            path: "returns",
            element: (
              <PermissionRoute requiredPermission="PROCESS_RETURNS">
                <StockReturnList />
              </PermissionRoute>
            ),
          },
          {
            path: "transfers",
            element: (
              <PermissionRoute requiredPermission="VIEW_STOCK_TRANSFERS">
                <StockTransfers />
              </PermissionRoute>
            ),
          },
        ],
      },
      {
        path: "suppliers",
        element: (
          <PermissionRoute requiredPermission="VIEW_SUPPLIERS">
            <SupplierList />
          </PermissionRoute>
        ),
      },
      {
        path: "purchase-orders",
        element: (
          <PermissionRoute requiredPermission="VIEW_PURCHASES">
            <PurchaseOrderList />
          </PermissionRoute>
        ),
      },
      {
        path: "purchase-orders/create",
        element: (
          <PermissionRoute requiredPermission="CREATE_PURCHASES">
            <PurchaseOrderCreate />
          </PermissionRoute>
        ),
      },
      {
        path: "sales",
        children: [
          {
            index: true,
            element: (
              <PermissionRoute requiredPermission="VIEW_SALES">
                <SalesHistory />
              </PermissionRoute>
            ),
          },
          {
            path: "invoices",
            element: (
              <PermissionRoute requiredPermission="VIEW_SALES">
                <InvoiceList />
              </PermissionRoute>
            ),
          },
          {
            path: "items",
            element: (
              <PermissionRoute requiredPermission="VIEW_SALES">
                <SalesByItem />
              </PermissionRoute>
            ),
          },
          {
            path: "analytics",
            element: (
              <PermissionRoute requiredPermission="VIEW_REPORTS">
                <SalesAnalytics />
              </PermissionRoute>
            ),
          },
        ],
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
        element: (
          <PermissionRoute requiredPermission="MANAGE_EXPENSE_CATEGORIES">
            <ExpenseCategoryList />
          </PermissionRoute>
        ),
      },
      {
        path: "expenses",
        children: [
          {
            index: true,
            element: (
              <PermissionRoute requiredPermission="VIEW_EXPENSES">
                <ExpenseList />
              </PermissionRoute>
            ),
          },
          {
            path: "analytics",
            element: (
              <PermissionRoute requiredPermission="VIEW_REPORTS">
                <ExpenseAnalytics />
              </PermissionRoute>
            ),
          },
        ],
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
        path: "reports/accounts-summary",
        element: (
          <PermissionRoute requiredPermission="VIEW_FINANCIAL_REPORTS">
            <AccountsSummaryReport />
          </PermissionRoute>
        ),
      },
      {
        path: "payment-methods",
        element: (
          <PermissionRoute requiredPermission="MANAGE_PAYMENT_METHODS">
            <PaymentMethodList />
          </PermissionRoute>
        ),
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
        element: <AdminUsers />,
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
    element: <NotFound />,
  },
]);
