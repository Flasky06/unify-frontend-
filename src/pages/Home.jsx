import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";

const Home = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">U</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                UNIFY
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    to="/login"
                    className="text-gray-600 font-medium hover:text-blue-600 transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-32 lg:h-[80vh] lg:flex lg:items-center">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight">
            Manage Your Business,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Simplify Operations
            </span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-600 mb-12 leading-relaxed">
            The comprehensive business management solution for modern
            businesses. Effortlessly manage stock across multiple locations,
            track product & service sales, and gain deep insights with real-time
            analytics—all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-10 py-5 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-gray-800 transition shadow-xl"
              >
                Access Dashboard
              </Link>
            ) : (
              <Link
                to="/register"
                className="px-10 py-5 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-200"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white rounded-3xl shadow-xl mb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything your business needs
          </h2>
          <p className="text-gray-500 text-lg">
            Powerful tools to help you grow and manage your business
            efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-8 rounded-2xl bg-gray-50 hover:bg-blue-50 transition duration-300 group text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition duration-300 mx-auto">
              <svg
                className="w-6 h-6 text-blue-600 group-hover:text-white"
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
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Granular Controls
            </h3>
            <p className="text-gray-600">
              Go beyond roles. Set specific, fine-grained permission overrides
              for every staff member to secure your business data.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-2xl bg-gray-50 hover:bg-blue-50 transition duration-300 group text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition duration-300 mx-auto">
              <svg
                className="w-6 h-6 text-blue-600 group-hover:text-white"
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
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Advanced Inventory
            </h3>
            <p className="text-gray-600">
              Track unlimited products across multiple locations. Manage brands,
              categories, and stock transfers effortlessly.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-2xl bg-gray-50 hover:bg-blue-50 transition duration-300 group text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition duration-300 mx-auto">
              <svg
                className="w-6 h-6 text-blue-600 group-hover:text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Recall Analytics
            </h3>
            <p className="text-gray-600">
              Visualize daily, weekly, monthly and periodical data instantly.
              Deep dive into sales, expenses, and net profit with custom date
              filters.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-8 rounded-2xl bg-gray-50 hover:bg-blue-50 transition duration-300 group text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition duration-300 mx-auto">
              <svg
                className="w-6 h-6 text-blue-600 group-hover:text-white"
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
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Multi-Shop Support
            </h3>
            <p className="text-gray-600">
              Scale your business. Manage multiple branches, locations, staff,
              and inventories from a single centralized dashboard.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-8 rounded-2xl bg-gray-50 hover:bg-blue-50 transition duration-300 group text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition duration-300 mx-auto">
              <svg
                className="w-6 h-6 text-blue-600 group-hover:text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Expense Tracking
            </h3>
            <p className="text-gray-600">
              Categorize all your operational costs. Keep a close watch on
              spending and monitor burn rate to maximize profitability.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-8 rounded-2xl bg-gray-50 hover:bg-blue-50 transition duration-300 group text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition duration-300 mx-auto">
              <svg
                className="w-6 h-6 text-blue-600 group-hover:text-white"
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
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Customer & Stock Returns
            </h3>
            <p className="text-gray-600">
              Process returns instantly. Handle customer returns and damaged
              stock efficiently, keeping your inventory counts accurate.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mb-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Can I use UNIFY for multiple separate businesses?
            </h3>
            <p className="text-gray-600">
              Yes! UNIFY is designed to handle multiple shops and business
              entities under a single account, giving you a centralized view of
              your entire empire.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Who has access to my data?
            </h3>
            <p className="text-gray-600">
              You have complete control. Our granular permissions system allows
              you to define exactly what each staff member can see and do. Your
              data is encrypted and secure.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Can I export my financial reports?
            </h3>
            <p className="text-gray-600">
              Absolutely. You can export detailed sales, expense, and profit
              reports to help with accounting and performance analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">U</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  UNIFY
                </h2>
              </div>
              <p className="text-gray-400 mb-6">
                Building the operating system for modern retail businesses.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-6">Product</h3>
              <ul className="space-y-4">
                <li>
                  <Link to="#" className="hover:text-blue-400 transition">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-blue-400 transition">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-blue-400 transition">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-6">Company</h3>
              <ul className="space-y-4">
                <li>
                  <Link to="#" className="hover:text-blue-400 transition">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-blue-400 transition">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-blue-400 transition">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-6">Contact</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-blue-500">Email:</span>
                  <a
                    href="mailto:bonnienjuguna106@gmail.com"
                    className="hover:text-white transition"
                  >
                    bonnienjuguna106@gmail.com
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500">Cell:</span>
                  <span className="hover:text-white transition">
                    0717299106
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500">
              &copy; {new Date().getFullYear()} UNIFY. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link
                to="#"
                className="text-gray-500 hover:text-white transition"
              >
                Privacy Policy
              </Link>
              <Link
                to="#"
                className="text-gray-500 hover:text-white transition"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
