import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";

const Home = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-blue-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">UNIFY</h1>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-6 py-2 text-white hover:text-gray-100 font-medium transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Business Management
            <br />
            <span className="text-blue-600">Simplified</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            UNIFY streamlines your sales, inventory, and operations with an
            all-in-one business management solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-gray-900 text-white rounded-lg font-semibold text-lg hover:bg-gray-800 transition"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <h3 className="text-xl font-bold text-blue-600 mb-3">
              Sales Management
            </h3>
            <p className="text-gray-600">
              Track sales, manage transactions, and monitor performance across
              all locations.
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-xl font-bold text-blue-600 mb-3">
              Inventory Control
            </h3>
            <p className="text-gray-600">
              Real-time stock tracking, automated alerts, and seamless transfers
              between shops.
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-xl font-bold text-blue-600 mb-3">
              Multi-Location
            </h3>
            <p className="text-gray-600">
              Manage multiple shops, assign managers, and control access with
              role-based permissions.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-20 border-t border-gray-200">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">Fast</div>
              <p className="text-gray-600">Lightning-fast performance</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                Secure
              </div>
              <p className="text-gray-600">Enterprise-grade security</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                Reliable
              </div>
              <p className="text-gray-600">99.9% uptime guarantee</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 text-center border-t border-gray-200">
          <h2 className="text-3xl font-bold text-blue-600 mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join businesses already using UNIFY to streamline their operations.
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition"
            >
              Start Free Trial
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-white">
            <p>&copy; 2025 UNIFY. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
