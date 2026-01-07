import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, isSuperAdmin, hasPermission } = useAuthStore();
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
      name: "Subscriptions",
      path: "/super-admin/subscriptions",
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
    {
      name: "Business Owners",
      path: "/super-admin/business-owners",
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
    },
  ];

  // Business Owner Navigation
  const businessNav = [
    // 1. MAIN
    {
      name: "Dashboard",
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
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      name: "Reports",
      permission: "VIEW_REPORTS",
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
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      children: [
        {
          name: "Sales",
          path: "/reports/sales",
          permission: "VIEW_REPORTS",
        },
        {
          name: "Sales History",
          path: "/sales",
          permission: "VIEW_SALES",
        },
        {
          name: "Invoices",
          path: "/invoices",
          permission: "VIEW_SALES",
        },
        {
          name: "Stock Movement",
          path: "/reports/stock-movement",
          permission: "VIEW_REPORTS",
        },
      ],
    },

    // 2. PRODUCTS
    {
      name: "Products",
      permission: "VIEW_PRODUCTS",
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
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
      children: [
        {
          name: "Product List",
          path: "/products",
          permission: "VIEW_PRODUCTS",
        },
        {
          name: "Product Categories",
          path: "/products/categories",
          permission: "MANAGE_PRODUCT_CATEGORIES",
        },
        {
          name: "Brands",
          path: "/products/brands",
          permission: "MANAGE_PRODUCTS",
        },
      ],
    },

    // 3. INVENTORY
    {
      name: "Inventory",
      permission: "VIEW_STOCK",
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      children: [
        { name: "Stock List", path: "/stocks", permission: "VIEW_STOCK" },
        { name: "Add Stock", path: "/stocks/add", permission: "MANAGE_STOCK" },
        {
          name: "Stock Returns",
          path: "/stocks/returns",
          permission: "PROCESS_RETURNS",
        },
        {
          name: "Transfer Stock",
          path: "/transfers",
          permission: "MANAGE_STOCK",
        },
      ],
    },

    // 4. SUPPLIERS
    {
      name: "Suppliers",
      permission: "VIEW_STOCK",
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      children: [
        { name: "Supplier List", path: "/suppliers", permission: "VIEW_STOCK" },
        {
          name: "Purchase Orders",
          path: "/purchase-orders",
          permission: "VIEW_STOCK",
        },
      ],
    },

    // 4. EXPENSES
    {
      name: "Expenses",
      permission: "VIEW_EXPENSES",
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
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      children: [
        {
          name: "Expense List",
          path: "/expenses",
          permission: "VIEW_EXPENSES",
        },
        {
          name: "Expense Categories",
          path: "/expenses/categories",
          permission: "MANAGE_EXPENSE_CATEGORIES",
        },
      ],
    },

    // 5. SERVICES
    {
      name: "Services",
      permission: "VIEW_PRODUCTS", // Services are treated as products in this system
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
        {
          name: "Service List",
          path: "/services/products",
          permission: "VIEW_PRODUCTS",
        },
        {
          name: "Service Categories",
          path: "/services/categories",
          permission: "MANAGE_PRODUCT_CATEGORIES",
        },
      ],
    },

    // 6. ADMIN
    {
      name: "Admin",
      permission: "MANAGE_BUSINESS_SETTINGS", // Or check if ANY child is visible
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      children: [
        { name: "Shops", path: "/shops", permission: "MANAGE_SHOPS" },
        {
          name: "Employees",
          path: "/employees",
          permission: "MANAGE_EMPLOYEES",
        },
        {
          name: "Users",
          path: "/users",
          permission: "MANAGE_BUSINESS_SETTINGS",
        }, // Assuming Users = Business Settings scope for now
        {
          name: "Accounts",
          path: "/payment-methods",
          permission: "MANAGE_BUSINESS_SETTINGS",
        },
        {
          name: "Role Permissions",
          path: "/users/roles",
          permission: "MANAGE_BUSINESS_SETTINGS",
        },
      ],
    },

    // Profile (Always visible)
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

  // Filter navigation based on user permissions
  const getFilteredBusinessNav = () => {
    return businessNav.reduce((acc, item) => {
      // 1. Check Item Permission
      const isOwner =
        user?.role === "BUSINESS_OWNER" || user?.role === "BUSINESS_MANAGER";
      const isReports = item.name === "Reports";

      // Ensure specific items are always visible to owners regardless of permission check glitches
      if (
        item.permission &&
        !hasPermission(item.permission) &&
        !(isOwner && isReports)
      ) {
        // Special case: Admin block check - if it has children that are allowed, we might want to show it?
        // But for now, strict parent permission check.
        // Wait, "Admin" usually requires general admin access.
        // If I grant "MANAGE_EMPLOYEES" to a Manager but not "MANAGE_BUSINESS_SETTINGS",
        // and Admin parent requires "MANAGE_BUSINESS_SETTINGS", they won't see Employees.
        // FIX: If item has children, check if ANY child is visible.

        if (!item.children) return acc; // No permission and no children -> hide
      }

      // 2. Check Children
      if (item.children) {
        const visibleChildren = item.children.filter((child) => {
          return !child.permission || hasPermission(child.permission);
        });

        if (visibleChildren.length > 0) {
          // Include parent if it has visible children, even if parent permission failed?
          // Ideally, parent permission should be broader.
          // Let's assume if ANY child is visible, show parent (unless parent is strictly forbidden?)
          // For typical sidebar, Parent is just a grouper.
          acc.push({ ...item, children: visibleChildren });
        }
      } else {
        // No children, permission check passed (line 331 checked failure condition, but wait)
        // If I fell through to here, it means permission passed OR it had children (but 'else' means no children).
        // Wait, my logic at step 1:
        // if (item.permission && !hasPermission(item.permission)) {
        //    if (!item.children) return acc;
        // }
        // If it HAS children, I proceed to step 2.

        // Correct logic:
        const hasParentPermission =
          !item.permission || hasPermission(item.permission);

        if (item.children) {
          const visibleChildren = item.children.filter(
            (child) => !child.permission || hasPermission(child.permission)
          );

          if (visibleChildren.length > 0) {
            acc.push({ ...item, children: visibleChildren });
          }
        } else if (hasParentPermission) {
          acc.push(item);
        }
      }
      return acc;
    }, []);
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
      {/* Mobile Overlay - Only show on small mobile screens */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

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
