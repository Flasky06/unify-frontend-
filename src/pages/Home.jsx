import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";

const Home = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">UNIFY</h1>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-2 bg-white text-blue-700 rounded-lg font-medium hover:bg-gray-100 transition"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-6 py-2 text-white font-medium hover:text-gray-200 transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2 bg-white text-blue-700 rounded-lg font-medium hover:bg-gray-100 transition"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Modern Point of Sale
            <br />
            <span className="text-teal-300">Business Management Software</span>
          </h1>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            Streamline your sales, inventory, and operations with UNIFY - the
            all-in-one business management solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-white text-blue-700 rounded-xl font-semibold text-lg hover:bg-gray-100 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-blue-700 rounded-xl font-semibold text-lg hover:bg-gray-100 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-blue-600/20 backdrop-blur-sm text-white border-2 border-white rounded-xl font-semibold text-lg hover:bg-blue-600/30 transition"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32 grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition">
            <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Lightning Fast
            </h3>
            <p className="text-white/80">
              Process transactions in seconds with our optimized checkout
              system.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition">
            <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Real-time Analytics
            </h3>
            <p className="text-white/80">
              Track sales, inventory, and performance with live dashboards.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition">
            <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Secure & Reliable
            </h3>
            <p className="text-white/80">
              Enterprise-grade security to protect your business data.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
