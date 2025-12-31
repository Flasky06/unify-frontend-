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
import RoleManagement from "../pages/users/RoleManagement";
import { ProductList } from "../pages/products/ProductList";
import { CategoryList } from "../pages/products/CategoryList";
import { BrandList } from "../pages/products/BrandList";
import { ShopList } from "../pages/shops/ShopList";
import StockList from "../pages/stocks/StockList";
import StockTransfers from "../pages/stocks/StockTransfers";
import AddStock from "../pages/stocks/AddStock";
import SalesHistory from "../pages/sales/SalesHistory";
import SalesByItem from "../pages/sales/SalesByItem";
import { ServiceCategoryList } from "../pages/services/ServiceCategoryList";
import { ServiceList } from "../pages/services/ServiceList";
import { ExpenseCategoryList } from "../pages/expenses/ExpenseCategoryList";
import { ExpenseList } from "../pages/expenses/ExpenseList";
import ExpenseAnalytics from "../pages/expenses/ExpenseAnalytics";
import { PaymentMethodList } from "../pages/paymentMethods/PaymentMethodList";
import SalesAnalytics from "../pages/sales/SalesAnalytics";
import ReportsDashboard from "../pages/reports/ReportsDashboard";

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
            element: <CategoryList />,
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
        path: "transfers",
        element: <StockTransfers />,
      },
      {
        path: "sales",
        element: <SalesHistory />,
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
