import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, isSuperAdmin } = useAuthStore();
  const [expandedMenu, setExpandedMenu] = useState(null);

  const toggleMenu = (name) => {
    // Accordion: close same menu if clicked, OR open new one and close others (set to name)
    setExpandedMenu((prev) => (prev === name ? null : name));
  };

  const isActive = (path) => location.pathname === path;
  const isParentActive = (item) => {
    if (item.children) {
      return item.children.some((child) => location.pathname === child.path);
    }
    return false;
  };

  // Super Admin Navigation
  const superAdminNav = [
    {
      name: "Dashboard",
      path: "/super-admin/super-admin",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: "Users",
      path: "/super-admin/users",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
  ];

  // Business Owner Navigation
  const businessNav = [
    {
      name: "Sales",
      path: "/dashboard",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: "Shop Management",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      children: [{ name: "Shops", path: "/shops" }],
    },
    {
      name: "Product Management",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      children: [
        { name: "Categories", path: "/products/categories" },
        { name: "Brands", path: "/products/brands" },
        { name: "Products", path: "/products" },
      ],
    },
    {
      name: "Stock Management",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      ),
      children: [
        { name: "Stock", path: "/stocks" },
        { name: "Add Stock", path: "/stocks/add" },
        { name: "Stock Movement", path: "/transfers" },
      ],
    },
    {
      name: "Sales Management",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
      children: [
        { name: "Sales History", path: "/sales" },
        { name: "Sales By Item", path: "/sales/items" },
        { name: "Sales Analytics", path: "/sales/analytics" },
      ],
    },

    {
      name: "Service Management",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      children: [
        { name: "Service Categories", path: "/services/categories" },
        { name: "Services", path: "/services/products" },
      ],
    },
    {
      name: "Expense Management",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      children: [
        { name: "Expense Categories", path: "/expenses/categories" },
        { name: "Expenses", path: "/expenses" },
        { name: "Expense Analytics", path: "/expenses/analytics" },
      ],
    },
    {
      name: "Payment Methods",
      path: "/payment-methods",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
    },
    {
      name: "Staff Members",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      children: [{ name: "Users", path: "/users" }],
    },
    {
      name: "Profile",
      path: "/profile",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ];

  // Filter navigation based on user role
  // Filter navigation based on user role
  const getFilteredBusinessNav = () => {
    // SALES_REP: Very restricted
    if (user?.role === "SALES_REP") {
      return businessNav.map((item) => {
        // Disable Staff Members, Shop Management, and Product Management (All)
        if (
          item.name === "Staff Members" ||
          item.name === "Shop Management" ||
          item.name === "Product Management"
        ) {
          return { ...item, disabled: true };
        }

        // Stock Management: Disable 'Add Stock' only
        if (item.name === "Stock Management") {
          return {
            ...item,
            children: item.children.map((child) => {
              if (
                child.name === "Add Stock" ||
                child.name === "Stock Movement"
              ) {
                return { ...child, disabled: true };
              }
              return child;
            }),
          };
        }
        return item;
      });
    }

    // SHOP_MANAGER: Moderate restriction
    if (user?.role === "SHOP_MANAGER") {
      return businessNav.map((item) => {
        // Disable Staff Members and Shop Management
        if (item.name === "Staff Members" || item.name === "Shop Management") {
          return { ...item, disabled: true };
        }

        // For Product Management, disable Categories/Brands
        if (item.name === "Product Management") {
          return {
            ...item,
            children: item.children.map((child) => {
              if (child.name === "Brands" || child.name === "Categories") {
                return { ...child, disabled: true };
              }
              return child;
            }),
          };
        }
        return item;
      });
    }

    return businessNav;
  };

  const navigation = isSuperAdmin() ? superAdminNav : getFilteredBusinessNav();

  const renderNavItem = (item) => {
    if (item.children) {
      const isExpanded = expandedMenu === item.name;
      const isChildActive = isParentActive(item);

      // Auto-expand if child is active and no menu is manually toggled yet
      if (isChildActive && expandedMenu === null) {
        // This is a side-effect, but safe enough here for initial loading
        // better to use useEffect but strict mode might flicker
      }

      return (
        <div key={item.name} className="mb-1">
          <button
            onClick={() => {
              if (item.disabled) return;
              toggleMenu(item.name);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
              item.disabled
                ? "opacity-50 cursor-not-allowed text-gray-400"
                : isChildActive || isExpanded
                ? "text-white bg-gray-800"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              {item.icon}
              <span className="font-medium text-sm truncate">{item.name}</span>
            </div>
            <svg
              className={`w-4 h-4 flex-shrink-0 transition-transform ${
                isExpanded ? "transform rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1 pl-4 border-l border-gray-700">
              {item.children.map((child) => (
                <Link
                  key={child.path}
                  to={child.disabled ? "#" : child.path}
                  onClick={(e) => {
                    if (child.disabled) {
                      e.preventDefault();
                      return;
                    }
                    onClose();
                  }}
                  className={`block px-3 py-2 text-sm rounded-lg transition-colors truncate ${
                    child.disabled
                      ? "opacity-50 cursor-not-allowed text-gray-500 hover:text-gray-500 hover:bg-transparent"
                      : isActive(child.path)
                      ? "text-blue-400 bg-gray-800"
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.disabled ? "#" : item.path}
        onClick={(e) => {
          if (item.disabled) {
            e.preventDefault();
            return;
          }
          onClose();
        }}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 mb-1 ${
          item.disabled
            ? "opacity-50 cursor-not-allowed text-gray-500 hover:text-gray-500 hover:bg-transparent"
            : isActive(item.path)
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        }`}
      >
        {item.icon}
        <span className="font-medium text-sm truncate">{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`
        fixed inset-y-0 right-0 z-50 w-[90vw] max-w-sm bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen flex flex-col transition-transform duration-300 ease-in-out md:w-64 lg:static lg:translate-x-0 lg:w-60 lg:left-0 lg:right-auto flex-shrink-0
        ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Header with Close Button */}
        <div className="p-5 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              UNIFY
            </h1>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
              {isSuperAdmin() ? "Admin Panel" : "Business Management"}
            </p>
          </div>
          {/* Close button - only visible on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => renderNavItem(item))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-3 border-t border-gray-700 bg-gray-900/50">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {user?.email}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {user?.role?.replace("_", " ")}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              useAuthStore.getState().logout();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20 hover:border-red-500/30"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};
