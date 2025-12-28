import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/Dashboard";
import VerifyEmail from "../pages/auth/VerifyEmail";
import AdminDashboard from "../pages/super-admin/SuperAdminDashboard";
import AdminUsers from "../pages/super-admin/AdminUsers";
import Profile from "../pages/Profile";
import { UserList } from "../pages/users/UserList";
import { ProductList } from "../pages/products/ProductList";
import { CategoryList } from "../pages/products/CategoryList";
import { BrandList } from "../pages/products/BrandList";
import { ShopList } from "../pages/shops/ShopList";
import StockList from "../pages/stocks/StockList";
import StockTransfers from "../pages/stocks/StockTransfers";
import AddStock from "../pages/stocks/AddStock";
import SalesHistory from "../pages/sales/SalesHistory";
import ProductSales from "../pages/sales/ProductSales";
import ServiceSales from "../pages/sales/ServiceSales";
import SalesByItem from "../pages/sales/SalesByItem";
import { ServiceCategoryList } from "../pages/services/ServiceCategoryList";
import { ServiceList } from "../pages/services/ServiceList";

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
    path: "/verify-email",
    element: <VerifyEmail />,
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
        path: "sales/products",
        element: <ProductSales />,
      },
      {
        path: "sales/services",
        element: <ServiceSales />,
      },
      {
        path: "sales/items",
        element: <SalesByItem />,
      },
      {
        path: "services/categories",
        element: <ServiceCategoryList />,
      },
      {
        path: "services/products",
        element: <ServiceList />,
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
