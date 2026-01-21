import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { useState } from "react";
import mflowLogo from "../assets/mflow.png";
import mflowWhiteLogo from "../assets/mflow-white.png";

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
      question: "Do I need an internet connection?",
      answer:
        "Yes. mflow is a cloud-based platform. This ensures your data is always secure, automatically backed up, and accessible from any device.",
    },
    {
      question: "Can I generate reports?",
      answer:
        "Yes. Instantly generate detailed sales, expense, and profit reports. You can view, print, or save them as PDF for your records.",
    },
    {
      question: "What kind of support do you offer?",
      answer:
        "We provide priority support via phone and email. Our team is always ready to help you resolve any issues quickly.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center relative z-10">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            {/* Adjusted logo size from 152px to nice header size */}
            <img
              src={mflowLogo}
              alt="mflow pos"
              className="h-12 w-auto"
            />
          </Link>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-sm text-sm"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="font-medium text-gray-600 hover:text-blue-600 transition text-sm sm:text-base mr-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 sm:px-6 sm:py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base whitespace-nowrap"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 md:pt-24 md:pb-32">
          <div className="text-center w-full max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-100 animate-fadeIn">
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
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
              Grow Your Business with
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                mflow pos
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              The complete{" "}
              <span className="font-bold text-blue-600">
                POS and inventory management system
              </span>{" "}
              built for Kenyan businesses
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
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
                    className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-200 transform hover:-translate-y-1 w-full sm:w-auto"
                  >
                    Start Your 7-Day Free Trial
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
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mb-16"
      >
        <div className="text-center mb-10">
          {/* ... pricing header content ... */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 bg-white/80 inline-block px-6 py-2 rounded-full backdrop-blur-sm border border-gray-100 shadow-sm">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 mt-2">
            Subscription per shop. No commissions. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
          {/* Monthly Plan */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl flex flex-col transform hover:-translate-y-1 transition duration-300 text-center md:text-left h-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Monthly</h3>
            <div className="flex items-baseline mb-4 justify-center md:justify-start">
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
                <li key={feature} className="flex items-center text-gray-600 justify-start"> {/* Forced justify-start for alignment */}
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
                  <span className="text-left">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/register?plan=MONTHLY"
              className="block w-full py-3 px-4 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl text-center hover:bg-blue-50 transition text-lg mt-auto"
            >
              Choose Monthly
            </Link>
          </div>

          {/* Quarterly Plan */}
          <div className="bg-blue-600 rounded-2xl p-6 shadow-2xl transform md:scale-105 relative flex flex-col z-20 text-center md:text-left h-full">
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
              POPULAR
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Quarterly</h3>
            <div className="flex items-baseline mb-1 justify-center md:justify-start">
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
                <li key={feature} className="flex items-center text-blue-50 justify-start">
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
                  <span className="text-left">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/register?plan=QUARTERLY"
              className="block w-full py-3 px-4 bg-white text-blue-600 font-bold rounded-xl text-center hover:bg-gray-50 transition shadow-lg text-lg mt-auto"
            >
              Choose Quarterly
            </Link>
          </div>

          {/* Annual Plan */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl flex flex-col transform hover:-translate-y-1 transition duration-300 text-center md:text-left h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Annually</h3>
            <div className="flex items-baseline mb-1 justify-center md:justify-start">
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
                <li key={feature} className="flex items-center text-gray-600 justify-start">
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
                  <span className="text-left">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/register?plan=ANNUALLY"
              className="block w-full py-2 px-4 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl text-center hover:bg-blue-50 transition mt-auto"
            >
              Choose Annually
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid ... kept as is mostly but checking closing tags */}
      {/* ... (Features section would go here, skipping for brevity in replacement if unmatched) ... */}


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

      {/* Benefits Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 mb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help you manage and grow your business
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Track every sale in real-time</h3>
                  <p className="text-sm text-gray-600">Monitor transactions as they happen with live updates</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Never run out of stock with smart alerts</h3>
                  <p className="text-sm text-gray-600">Get notified before items run low</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Understand your profits with detailed analytics</h3>
                  <p className="text-sm text-gray-600">Make data-driven decisions with comprehensive reports</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Control access with role-based permissions</h3>
                  <p className="text-sm text-gray-600">Secure your business with granular access control</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Backup everything securely to the cloud</h3>
                  <p className="text-sm text-gray-600">Your data is safe, secure, and always accessible</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mb-8"
      >
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => toggleFaq(index)}
            >
              <div className="flex justify-between items-center bg-gray-50/50 p-2 rounded-lg">
                <h3 className="text-base font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <svg
                  className={`w-5 h-5 text-blue-600 flex-shrink-0 transform transition-transform duration-300 ${openFaqIndex === index ? "rotate-180" : ""
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
                <p className="text-sm text-gray-600 mt-2 px-2 animate-fadeIn">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact & Support Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Need Help? We're Here for You
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions or need assistance? Our team is ready to help you get started with mflow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Phone Contact */}
            <a
              href="tel:+254717299106"
              className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1 group text-center"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-600 transition duration-300 mx-auto">
                <svg
                  className="w-6 h-6 text-blue-600 group-hover:text-white transition duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Call Us</h3>
              <p className="text-blue-600 font-semibold mb-1">
                +254 717 299 106
              </p>
              <p className="text-xs text-gray-600">
                Mon - Sat: 8:00 AM - 8:00 PM
              </p>
            </a>

            {/* WhatsApp Contact */}
            <a
              href="https://wa.me/254717299106?text=Hi,%20I'm%20interested%20in%20learning%20more%20about%20mflow"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1 group text-center"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-600 transition duration-300 mx-auto">
                <svg
                  className="w-6 h-6 text-green-600 group-hover:text-white transition duration-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                WhatsApp Us
              </h3>
              <p className="text-green-600 font-semibold mb-1">
                Chat Now
              </p>
              <p className="text-xs text-gray-600">
                Quick responses via WhatsApp
              </p>
            </a>

            {/* Email Contact */}
            <a
              href="mailto:support@mflowpos.com?subject=Inquiry about mflow"
              className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1 group text-center"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-600 transition duration-300 mx-auto">
                <svg
                  className="w-6 h-6 text-purple-600 group-hover:text-white transition duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Email Us
              </h3>
              <p className="text-purple-600 font-semibold text-sm mb-1 break-all px-1">
                support@mflowpos.com
              </p>
              <p className="text-xs text-gray-600">
                We'll respond within 24 hours
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-around gap-12 mb-12">
            <div className="md:max-w-xs text-left"> {/* Added text-left for mobile */}
              <div className="flex">
                <img
                  src={mflowWhiteLogo}
                  alt="mflow pos"
                  className="h-36 w-auto"
                />
              </div>
              <p className="text-gray-600 max-w-sm mt-2">
                Empowering Kenyan SMEs and MSMEs with modern Point of Sale Solution. Cloud-based, mobile-responsive, and built for growth.
              </p>
            </div>

            <div className="md:text-left">
              <h3 className="text-white font-bold text-lg mb-2">Quick Links</h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#pricing"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-gray-400 hover:text-white transition"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:text-left">
              <h3 className="text-white font-bold text-lg mb-2">Contact</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-blue-500">Email:</span>
                  <a
                    href="mailto:support@mflowpos.com"
                    className="hover:text-white transition"
                  >
                    support@mflowpos.com
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
              &copy; {new Date().getFullYear()} mflow pos. All rights reserved.
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
