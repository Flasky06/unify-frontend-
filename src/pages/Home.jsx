import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { useState } from "react";

const Home = () => {
  const { isAuthenticated } = useAuthStore();
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "Can I use UNIFY for multiple separate businesses?",
      answer:
        "UNIFY is designed for a single business entity but supports multiple locations and shops, giving you a centralized view of your entire operation.",
    },
    {
      question: "Who has access to my data?",
      answer:
        "You have complete control. Our granular permissions system allows you to define exactly what each staff member can see and do. Your data is encrypted and secure.",
    },
    {
      question: "Can I export my financial reports?",
      answer:
        "Absolutely. You can export detailed sales, expense, and profit reports to help with accounting and performance analysis.",
    },
    {
      question: "Does UNIFY work offline?",
      answer:
        "Yes, keep selling even without internet. Your sales data syncs automatically the moment you're back online, so business never stops.",
    },
    {
      question: "Is it hard to switch to UNIFY?",
      answer:
        "Not at all. We offer seamless data migration tools and dedicated support to ensure a smooth, zero-downtime transition from your old system.",
    },
    {
      question: "What kind of support do you offer?",
      answer:
        "We provide 24/7 priority support via chat and email for all plans. Our expert team is always ready to help you resolve any issues quickly.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="text-white font-bold text-2xl">U</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              UNIFY
            </span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/register"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Start Free Trial
              </Link>
            )}
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-32 lg:h-[80vh] lg:flex lg:items-center">
          <div className="text-center w-full">
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 tracking-tight">
              Run Your Entire Business
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Simplify Operations
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
              The comprehensive business management solution for modern
              businesses. Effortlessly manage stock across multiple locations,
              track product & service sales, and gain deep insights with
              real-time analytics all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-200 transform hover:-translate-y-1"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-200 transform hover:-translate-y-1"
                  >
                    Start 14-Day Free Trial
                  </Link>
                  <Link
                    to="/demo"
                    className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-100 rounded-xl font-bold text-lg hover:border-blue-200 hover:bg-blue-50 transition duration-300"
                  >
                    Watch Demo
                  </Link>
                </>
              )}
            </div>
            <div className="mt-16 flex items-center justify-center gap-8 text-gray-400 text-sm font-medium">
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                14-day free trial
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 -mt-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1: Advanced Inventory */}
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
              Take full control of your stock. Real-time tracking across all
              your locations ensures you never run out of what sells best.
            </p>
          </div>

          {/* Feature 2: Performance Analytics */}
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
              Performance Analytics
            </h3>
            <p className="text-gray-600">
              Make data-driven decisions. Uncover trends and insights that drive
              growth with powerful, easy-to-understand dashboards.
            </p>
          </div>

          {/* Feature 3: Multi-Shop Support */}
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
              Expand your empire. Seamlessly manage multiple branches from one
              central hub, no matter where you are.
            </p>
          </div>

          {/* Feature 4: Expense Tracking */}
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
              Maximize your profits. Keep a pulse on every penny spent and
              optimize your operational costs for a healthier bottom line.
            </p>
          </div>

          {/* Feature 5: Staff Permissions */}
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
              Staff Permissions
            </h3>
            <p className="text-gray-600">
              Empower your team safely. Give staff the exact tools they need
              while keeping sensitive business data secure.
            </p>
          </div>

          {/* Feature 6: Products & Services */}
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
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Products & Services
            </h3>
            <p className="text-gray-600">
              Create and manage your offerings with ease. Organize products and
              services to speed up checkout and delight customers.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mb-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => toggleFaq(index)}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-gray-900">
                  {faq.question}
                </h3>
                <svg
                  className={`w-6 h-6 text-blue-600 transform transition-transform duration-300 ${
                    openFaqIndex === index ? "rotate-180" : ""
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
              </div>
              {openFaqIndex === index && (
                <p className="text-gray-600 mt-4 animate-fadeIn">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">U</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  UNIFY
                </h2>
              </div>
              <p className="text-gray-400 mb-6 max-w-sm">
                Building the operating system for modern retail businesses.
              </p>
            </div>

            <div className="md:text-right">
              <h3 className="text-white font-bold text-lg mb-6">Contact</h3>
              <ul className="space-y-4 inline-block text-left">
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
