import { Link } from "react-router-dom";
import SEO from "../components/common/SEO";
import useAuthStore from "../store/authStore";
import { useState } from "react";
import mflowLogo from "../assets/mflowpos.png";

const Home = () => {
  const { isAuthenticated } = useAuthStore();
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [billingCycle, setBillingCycle] = useState("MONTHLY");

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "Can I manage multiple shops?",
      answer:
        "Yes! Manage unlimited shop locations from one account. Each branch maintains separate inventory, and you can easily transfer stock between locations.",
    },
    {
      question: "Can I print receipts and invoices?",
      answer:
        "Yes. Generate and print professional receipts for completed sales and invoices for pending orders. Perfect for record-keeping and customer documentation.",
    },
    {
      question: "Can I add my staff with different permissions?",
      answer:
        "Absolutely. Add multiple users with role-based permissions. Control exactly what each team member can access to keep your business data secure.",
    },
    {
      question: "Do I need special hardware?",
      answer:
        "No. Mflow POS runs on any device with a web browser. Use your existing smartphone, tablet, laptop, or desktop computer.",
    },
    {
      question: "What reports can I generate?",
      answer:
        "Generate sales reports, stock movement reports, and comprehensive accounts summaries. All reports can be exported as PDF for your records.",
    },
    {
      question: "Can I track suppliers and purchase orders?",
      answer:
        "Yes. Track all your suppliers, create purchase orders, monitor payments, and keep complete records of supplier transactions and outstanding balances.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes. Your data is stored securely in the cloud with automatic backups. Access is protected with email verification and role-based permissions.",
    },
    {
      question: "Can I sell both products and services?",
      answer:
        "Yes. The system supports both physical products with inventory tracking and services without stock management, all from one platform.",
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <SEO
        title="POS System for Boutiques, Spare Parts, Electronics & Retail Shops in Kenya | Works on Phone"
        description="Simple POS system for your boutique, electronics shop, spare parts, cosmetics, baby shop, laundry mart or accessories store. Track stock and sales from your phone or tablet. No installation. From KES 1,500/month. Used across Nairobi, Mombasa, Kisumu, Nakuru."
        url="/"
        keywords="POS for boutique Kenya, POS for electronics shop, spare parts POS Kenya, cosmetics shop POS, baby shop POS, laundry mart POS, shoe shop POS Kenya, accessories shop POS, POS that works on phone Kenya, mobile POS Kenya, tablet POS system, cheap POS Kenya, affordable shop software, retail POS Nairobi, business management system Kenya, cloud POS Kenya, multi branch POS, POS for small shop Kenya"
        image="/m-logo.jpg"
      />

      {/* Software Application Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Mflow POS",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web, Android, iOS",
            "offers": {
              "@type": "AggregateOffer",
              "lowPrice": "1500",
              "highPrice": "20000",
              "priceCurrency": "KES",
              "offerCount": "5"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "127"
            },
            "description": "Cloud-based POS and inventory management system for retail businesses in Kenya. Multi-shop support, user permissions, and comprehensive reporting.",
            "featureList": [
              "Multi-shop Management",
              "Stock Tracking",
              "Expense Tracking",
              "Sales Reports",
              "User Permissions",
              "Supplier Management"
            ]
          })
        }}
      />

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })
        }}
      />

      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Mflow POS",
            "url": "https://mflowpos.com",
            "logo": "https://mflowpos.com/m-logo.jpg",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+254-717-299-106",
              "contactType": "Customer Service",
              "areaServed": "KE",
              "availableLanguage": ["en", "sw"]
            },
            "sameAs": [
              "https://wa.me/254717299106"
            ]
          })
        }}
      />
      {/* Fixed Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <img src={mflowLogo} alt="Mflow POS Logo" width="40" height="40" className="h-10 w-auto" />
            <span className="text-2xl font-bold text-gray-900 tracking-wide">
              <span className="text-blue-600">M</span>flow POS
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2 text-gray-700 font-bold hover:text-blue-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-block px-6 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 transition rounded-lg shadow-sm"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </nav>
      </header >

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white pt-24" style={{ maxHeight: '50vh', minHeight: '500px' }} aria-labelledby="hero-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 h-full flex flex-col justify-center">
            <div className="text-center max-w-7xl mx-auto">
              <h1 id="hero-heading" className="text-2xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
                <span className="text-slate-800">Manage Your Growing Business with Confidence</span> — <span className="text-blue-600">From Anywhere</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-4xl mx-auto text-center">
                Complete{" "}
                <span className="text-blue-600 font-semibold">
                  cloud-based POS & inventory system
                </span>{" "}
                with multi-branch support, user permissions, and comprehensive reporting
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 p-1 rounded-xl inline-flex shadow-inner">
              <button
                onClick={() => setBillingCycle("MONTHLY")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${billingCycle === "MONTHLY"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-700 hover:text-gray-900"
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("QUARTERLY")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${billingCycle === "QUARTERLY"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-700 hover:text-gray-900"
                  }`}
              >
                Quarterly
              </button>
              <button
                onClick={() => setBillingCycle("ANNUALLY")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${billingCycle === "ANNUALLY"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-700 hover:text-gray-900"
                  }`}
              >
                Annually
              </button>
            </div>
          </div>

          {/* First Row - 3 Plans */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-6">
            {/* Starter Plan */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition relative flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Starter Plan</h3>
              <p className="text-gray-500 mb-6">Perfect for single shop businesses</p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-gray-900">
                  KES {(1500 * (billingCycle === "MONTHLY" ? 1 : billingCycle === "QUARTERLY" ? 3 : 12)).toLocaleString()}
                </span>
                <span className="text-gray-500 ml-2 font-medium">
                  /{billingCycle === "MONTHLY" ? "month" : billingCycle === "QUARTERLY" ? "quarter" : "year"}
                </span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold">1 Shop</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold">Up to 3 Users</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Basic Reporting
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Email Support
                </li>
              </ul>
              <Link
                to={`/register?plan=STARTER&period=${billingCycle}`}
                className="w-full block text-center py-3 px-6 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Growth Plan - Highlighted */}
            <div className="bg-blue-600 rounded-2xl p-8 shadow-xl relative flex flex-col text-white">
              <div className="absolute top-0 right-0 left-0 -mt-4 text-center">
                <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-center">Growth Plan</h3>
              <p className="text-white mb-6">Scale up to 3 locations</p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-white">
                  KES {(4000 * (billingCycle === "MONTHLY" ? 1 : billingCycle === "QUARTERLY" ? 3 : 12)).toLocaleString()}
                </span>
                <span className="text-blue-200 ml-2 font-medium">
                  /{billingCycle === "MONTHLY" ? "month" : billingCycle === "QUARTERLY" ? "quarter" : "year"}
                </span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center text-blue-50">
                  <svg className="w-5 h-5 text-blue-200 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold">Up to 3 Shops</span>
                </li>
                <li className="flex items-center text-blue-50">
                  <svg className="w-5 h-5 text-blue-200 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold">Up to 12 Users</span>
                </li>
                <li className="flex items-center text-blue-50">
                  <svg className="w-5 h-5 text-blue-200 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Stock Transfers
                </li>
                <li className="flex items-center text-blue-50">
                  <svg className="w-5 h-5 text-blue-200 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Advanced Analytics
                </li>
              </ul>
              <Link
                to={`/register?plan=GROWTH&period=${billingCycle}`}
                className="w-full block text-center py-3 px-6 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-50 transition shadow-lg"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Business Plan */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition relative flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Business Plan</h3>
              <p className="text-gray-500 mb-6">Ideal for growing businesses</p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-gray-900">
                  KES {(7500 * (billingCycle === "MONTHLY" ? 1 : billingCycle === "QUARTERLY" ? 3 : 12)).toLocaleString()}
                </span>
                <span className="text-gray-500 ml-2 font-medium">
                  /{billingCycle === "MONTHLY" ? "month" : billingCycle === "QUARTERLY" ? "quarter" : "year"}
                </span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold">Up to 7 Shops</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold">Up to 20 Users</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Advanced Analytics
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority Support
                </li>
              </ul>
              <Link
                to={`/register?plan=BUSINESS&period=${billingCycle}`}
                className="w-full block text-center py-3 px-6 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition"
              >
                Start Free Trial
              </Link>
            </div>
          </div>

          {/* Second Row - 2 Plans */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Pro Plan */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition relative flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Pro Plan</h3>
              <p className="text-gray-500 mb-6">For established enterprises</p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-gray-900">
                  KES {(12000 * (billingCycle === "MONTHLY" ? 1 : billingCycle === "QUARTERLY" ? 3 : 12)).toLocaleString()}
                </span>
                <span className="text-gray-500 ml-2 font-medium">
                  /{billingCycle === "MONTHLY" ? "month" : billingCycle === "QUARTERLY" ? "quarter" : "year"}
                </span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold">Up to 10 Shops</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold">Unlimited Users</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  All Features
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority Support
                </li>
              </ul>
              <Link
                to={`/register?plan=PRO&period=${billingCycle}`}
                className="w-full block text-center py-3 px-6 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition relative flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Enterprise Plan</h3>
              <p className="text-gray-500 mb-6">Maximum scale & capacity</p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-gray-900">
                  KES {(20000 * (billingCycle === "MONTHLY" ? 1 : billingCycle === "QUARTERLY" ? 3 : 12)).toLocaleString()}
                </span>
                <span className="text-gray-500 ml-2 font-medium">
                  /{billingCycle === "MONTHLY" ? "month" : billingCycle === "QUARTERLY" ? "quarter" : "year"}
                </span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold">Up to 20 Shops</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold">Unlimited Users</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  All Features
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Dedicated Support
                </li>
              </ul>
              <Link
                to={`/register?plan=ENTERPRISE&period=${billingCycle}`}
                className="w-full block text-center py-3 px-6 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        < section id="features" className="bg-white py-16" >
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
              {[
                {
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  ),
                  title: "Multi-Branch Management",
                  description:
                    "Manage unlimited shop locations from one account. Each branch maintains separate inventory with easy stock transfers between locations.",
                },
                {
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  ),
                  title: "User Permissions & Roles",
                  description:
                    "Add multiple staff members with role-based access control. Assign specific permissions to protect sensitive data and empower your team.",
                },
                {
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  ),
                  title: "Real-Time Inventory Tracking",
                  description:
                    "Monitor stock levels in real-time across all locations. Get low stock alerts, process returns, and adjust inventory with full history tracking.",
                },
                {
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  ),
                  title: "Supplier & Purchase Orders",
                  description:
                    "Track suppliers, create purchase orders, and monitor payments. Keep complete records of all supplier transactions and balances.",
                },
                {
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  ),
                  title: "Receipts & Invoices",
                  description:
                    "Generate and print professional receipts and invoices. Save pending invoices and convert them to sales when customers pay.",
                },
                {
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  ),
                  title: "Comprehensive Reports",
                  description:
                    "Sales reports, stock movement analysis, profit tracking, and accounts summary. Export to PDF for record-keeping and analysis.",
                },
                {
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  ),
                  title: "Expense Management",
                  description:
                    "Track all business expenses with payee information. Categorize spending and see your true profit after deducting all costs.",
                },
                {
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                    />
                  ),
                  title: "100% Cloud-Based",
                  description:
                    "Access from anywhere on any device. Your data is automatically backed up and secure. No installation or special hardware needed.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition duration-300 group"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition duration-300 mx-auto">
                    <svg
                      className="w-6 h-6 text-blue-600 group-hover:text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {feature.icon}
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-center">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section >

        {/* Benefits Section */}
        < section className="bg-gradient-to-b from-gray-50 to-white py-16" >
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
                {[
                  {
                    title: "Track every sale in real-time",
                    description: "Monitor transactions as they happen with live updates",
                  },
                  {
                    title: "Never run out of stock with smart alerts",
                    description: "Get notified before items run low",
                  },
                  {
                    title: "Understand your profits with detailed analytics",
                    description: "Make data-driven decisions with comprehensive reports",
                  },
                  {
                    title: "Control access with role-based permissions",
                    description: "Secure your business with granular access control",
                  },
                  {
                    title: "Backup everything securely to the cloud",
                    description: "Your data is safe, secure, and always accessible",
                  },
                  {
                    title: "Works on your phone and tablet",
                    description: "Access from any device - smartphone, tablet, laptop, or desktop",
                  },
                  {
                    title: "No installation or additional hardware needed",
                    description: "Start immediately with just a web browser. No special equipment required",
                  },
                ].map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section >

        {/* FAQ Section */}
        < section id="faq" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mb-8" >
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
                  <p className="text-sm text-gray-600 mt-2 px-2">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </section >

        {/* Contact & Support Section */}
        < section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-12" >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Need Help? We're Here for You
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Have questions or need assistance? Our team is ready to help you get
                started with mflow.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
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
                <p className="text-blue-600 font-semibold mb-1">+254 717 299 106</p>
                <p className="text-xs text-gray-600">Mon - Sat: 8:00 AM - 8:00 PM</p>
              </a>

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
                <h3 className="text-lg font-bold text-gray-900 mb-1">WhatsApp Us</h3>
                <p className="text-green-600 font-semibold mb-1">Chat Now</p>
                <p className="text-xs text-gray-600">Quick responses via WhatsApp</p>
              </a>

              <a
                href="mailto:info@mflowpos.com?subject=Inquiry about mflow"
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
                <h3 className="text-lg font-bold text-gray-900 mb-1">Email Us</h3>
                <p className="text-purple-600 font-semibold text-sm mb-1">
                  info@mflowpos.com
                </p>
                <p className="text-xs text-gray-600">We'll respond within 24 hours</p>
              </a>
            </div>
          </div>
        </section >
      </main>

      {/* Footer */}
      < footer className="bg-gray-900 text-gray-300 py-8" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-around gap-12 mb-12">
            <div className="md:max-w-xs">
              <img src={mflowLogo} alt="Mflow POS - Cloud Point of Sale System Logo" width="96" height="96" className="h-24 w-auto mb-4" />
              <p className="text-gray-400 max-w-sm">
                Empowering Kenyan SMEs and MSMEs with modern Point of Sale Solution.
                Cloud-based, mobile-responsive, and built for growth.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#pricing" className="text-gray-400 hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-gray-400 hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-gray-400 hover:text-white transition">
                    FAQ
                  </a>
                </li>
                <li>
                  <Link to="/register" className="text-gray-400 hover:text-white transition">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-4">Contact</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">Email:</span>
                  <a
                    href="mailto:info@mflowpos.com"
                    className="hover:text-white transition"
                  >
                    info@mflowpos.com
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">Cell:</span>
                  <span className="hover:text-white transition">0717299106</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500">
              &copy; {new Date().getFullYear()} mflow pos. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link to="#" className="text-gray-500 hover:text-white transition">
                Privacy Policy
              </Link>
              <Link to="#" className="text-gray-500 hover:text-white transition">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer >
    </div >
  );
};

export default Home;