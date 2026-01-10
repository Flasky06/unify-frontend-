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
      question: "Is mflow hard to learn?",
      answer:
        "No. mflow is designed to feel familiar. If you can use WhatsApp or write in a notebook, you can use mflow. Most businesses are fully set up in under a day.",
    },
    {
      question: "Can I use mflow for my specific business?",
      answer:
        "Yes. mflow works effectively for retail shops, spare parts dealers, electronics, laundry businesses, and other stock-based businesses.",
    },
    {
      question: "What if I have multiple shops?",
      answer:
        "You can manage multiple shops under one business, transfer stock between them, and view reports per shop or combined—all from one account.",
    },
    {
      question: "Does mflow work offline?",
      answer:
        "Yes, keep selling even without internet. Your sales data syncs automatically the moment you're back online, so business never stops.",
    },
    {
      question: "Can I export my data?",
      answer:
        "Absolutely. You can export detailed sales, expense, and profit reports to help with accounting and performance analysis.",
    },
    {
      question: "What kind of support do you offer?",
      answer:
        "We provide 24/7 priority support via chat and email. Our expert team is ready to help you resolve any issues quickly.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="text-white font-bold text-2xl">m</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              mflow
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
              <>
                <Link
                  to="/login"
                  className="font-medium text-gray-500 hover:text-gray-900 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-32">
          <div className="text-center w-full">
            <div className="flex justify-center mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-100">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Trusted by growing retail businesses in Kenya
              </span>
            </div>
            <h1 className="text-3xl md:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight leading-tight">
              Manage Stock, Sales & Expenses
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {" "}
                With Automated Reports
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              The simple{" "}
              <span className="font-semibold text-gray-800">
                Retail POS System
              </span>{" "}
              to track what comes in, what goes out, and your real profits
              across one or multiple shops.
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
                    Start Free Trial
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 mb-16"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 bg-white/80 inline-block px-6 py-2 rounded-full backdrop-blur-sm border border-gray-100 shadow-sm">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 mt-2">
            Subscription per shop. No commissions. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Monthly Plan */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl flex flex-col transform hover:-translate-y-1 transition duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Monthly</h3>
            <div className="flex items-baseline mb-4">
              <span className="text-4xl font-extrabold text-gray-900">
                KES 1,500
              </span>
              <span className="text-gray-500 ml-2 font-medium">/shop</span>
            </div>
            <p className="text-gray-600 mb-6 text-sm font-medium">
              Flexible pay-as-you-go billing. Cancel anytime.
            </p>
            <ul className="space-y-3 mb-6 flex-1 text-sm font-medium">
              {[
                "Sales, stock, expenses & staff management",
                "Inventory Management",
                "Unlimited Staff",
                "Sales Analytics",
                "Email Support",
              ].map((feature) => (
                <li key={feature} className="flex items-center text-gray-600">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              to="/register?plan=MONTHLY"
              className="block w-full py-3 px-4 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl text-center hover:bg-blue-50 transition text-lg"
            >
              Choose Monthly
            </Link>
          </div>

          {/* Quarterly Plan */}
          <div className="bg-blue-600 rounded-2xl p-6 shadow-2xl transform md:scale-105 relative flex flex-col z-20">
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
              POPULAR
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Quarterly</h3>
            <div className="flex items-baseline mb-1">
              <span className="text-4xl font-extrabold text-white">
                KES 4,000
              </span>
              <span className="text-blue-100 ml-2 font-medium">/shop</span>
            </div>
            <p className="text-yellow-300 text-xs font-bold mb-4">
              Save KES 500 every 3 months
            </p>
            <p className="text-blue-100 mb-6 text-sm font-medium">
              Perfect for growing businesses. Billed every 3 months. Cancel
              anytime.
            </p>
            <ul className="space-y-3 mb-6 flex-1 text-sm font-medium">
              {[
                "All Monthly Features",
                "Priority Support",
                "Advanced Reporting",
                "Stock Transfers",
                "Employee Permissions",
              ].map((feature) => (
                <li key={feature} className="flex items-center text-blue-50">
                  <svg
                    className="w-5 h-5 text-blue-300 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              to="/register?plan=QUARTERLY"
              className="block w-full py-3 px-4 bg-white text-blue-600 font-bold rounded-xl text-center hover:bg-gray-50 transition shadow-lg text-lg"
            >
              Choose Quarterly
            </Link>
          </div>

          {/* Annual Plan */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl flex flex-col transform hover:-translate-y-1 transition duration-300">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Annually</h3>
            <div className="flex items-baseline mb-1">
              <span className="text-3xl font-bold text-gray-900">
                KES 15,000
              </span>
              <span className="text-gray-500 ml-2">/shop</span>
            </div>
            <p className="text-green-600 text-xs font-bold mb-4">
              Save KES 3,000 per year
            </p>
            <p className="text-gray-600 mb-6 text-sm">
              Best value for established businesses. Billed annually. Cancel
              anytime.
            </p>
            <ul className="space-y-3 mb-6 flex-1 text-sm">
              {[
                "All Quarterly Features",
                "Dedicated Account Manager",
                "Custom Training",
                "Data Migration Support",
                "SLA Guarantee",
              ].map((feature) => (
                <li key={feature} className="flex items-center text-gray-600">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
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
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              to="/register?plan=ANNUALLY"
              className="block w-full py-2 px-4 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl text-center hover:bg-blue-50 transition"
            >
              Choose Annually
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Comprehensive Tools for Modern Retail
            </h2>
            <p className="text-lg text-gray-600">
              Powerful features built for modern retailers
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Advanced Inventory */}
            <div className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition duration-300 group text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition duration-300 mx-auto">
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
                Know what you have at any time. Track stock levels across one or
                multiple shops. See what’s selling, what’s stuck, and when to
                restock.
              </p>
            </div>

            {/* Feature 2: Performance Analytics */}
            <div className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition duration-300 group text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition duration-300 mx-auto">
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
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Performance Analytics
              </h3>
              <p className="text-sm text-gray-600">
                Make data-driven decisions. Uncover trends and insights that
                drive growth with powerful, easy-to-understand dashboards.
              </p>
            </div>

            {/* Feature 3: Multi-Shop Support */}
            <div className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition duration-300 group text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition duration-300 mx-auto">
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
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Multi-Shop Support
              </h3>
              <p className="text-sm text-gray-600">
                Expand your empire. Seamlessly manage multiple branches from one
                central hub, no matter where you are.
              </p>
            </div>

            {/* Feature 4: Expense Tracking */}
            <div className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition duration-300 group text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition duration-300 mx-auto">
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
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Expense Tracking
              </h3>
              <p className="text-sm text-gray-600">
                See where your money actually goes. Record rent, labour,
                transport, utilities, and daily expenses. Know your real profit
                — not just sales.
              </p>
            </div>

            {/* Feature 5: Staff Permissions */}
            <div className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition duration-300 group text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition duration-300 mx-auto">
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
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Staff Permissions
              </h3>
              <p className="text-sm text-gray-600">
                Empower your team safely. Give staff the exact tools they need
                while keeping sensitive business data secure.
              </p>
            </div>

            {/* Feature 6: Products & Services */}
            <div className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition duration-300 group text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition duration-300 mx-auto">
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
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Products & Services
              </h3>
              <p className="text-sm text-gray-600">
                Create and manage your offerings with ease. Organize products
                and services to speed up checkout and delight customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-10"
      >
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => toggleFaq(index)}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-gray-900">
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
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">m</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  mflow
                </h2>
              </div>
              <p className="text-gray-400 mb-6 max-w-sm">
                Built for growing businesses that want control, clarity, and
                peace of mind.
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
              &copy; {new Date().getFullYear()} mflow. All rights reserved.
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
