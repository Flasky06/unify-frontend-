import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { registerSchema } from "../../schemas/authSchemas";
import SEO from "../../components/common/SEO";

const Register = () => {
  const { register, isLoading, error } = useAuth();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* Capture Plan Preference */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const plan = params.get("plan");
    if (plan) {
      sessionStorage.setItem("preferredPlan", plan);
    }
  }, [location]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      phoneNo: "",
    },
    validate: (values) => {
      try {
        registerSchema.parse(values);
        return {};
      } catch (error) {
        const errors = {};
        error.issues?.forEach((err) => {
          errors[err.path[0]] = err.message;
        });
        return errors;
      }
    },
    onSubmit: async (values) => {
      if (isLoading) return;
      try {
        const { confirmPassword: _confirmPassword, ...data } = values;
        const registerData = {
          ...data,
          role: "BUSINESS_OWNER",
        };
        await register(registerData);

        // Store email for verification page
        sessionStorage.setItem("verificationEmail", values.email);

        // Redirect to email verification
        window.location.href = "/verify-email";
      } catch (error) {
        console.error("Registration failed:", error);
      }
    },
  });

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50 px-4 py-8">
      <SEO
        title="Register"
        description="Create your mflow pos account today. Start managing your retail business efficiently."
        url="/register"
      />
      <div className="max-w-5xl w-full">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Left Side - Features (Hidden on mobile) */}
          <div className="hidden lg:flex flex-col bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-10 text-white">
            <h2 className="text-3xl font-bold mb-3">
              Start Managing Your Business Today
            </h2>
            <p className="text-blue-100 mb-8">
              Join businesses using mflow pos to streamline operations and boost productivity
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="font-semibold">Real-time Sales Tracking</h3>
                  <p className="text-sm text-blue-100">Monitor every transaction as it happens</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="font-semibold">Smart Inventory Management</h3>
                  <p className="text-sm text-blue-100">Never run out of stock with automated alerts</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="font-semibold">Comprehensive Reports</h3>
                  <p className="text-sm text-blue-100">Detailed analytics to understand your business</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="font-semibold">Multi-user Access Control</h3>
                  <p className="text-sm text-blue-100">Manage permissions for your team members</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="font-semibold">Expense Tracking</h3>
                  <p className="text-sm text-blue-100">Keep tabs on all business expenses</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="font-semibold">7-Day Free Trial</h3>
                  <p className="text-sm text-blue-100">Try all features with no commitment</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-blue-600 mb-2">
                Create Your Account
              </h1>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  {error?.message || "Registration failed. Please try again."}
                </p>
              </div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${formik.touched.email && formik.errors.email
                    ? "border-red-500"
                    : "border-gray-300"
                    }`}
                  placeholder="you@example.com"
                  {...formik.getFieldProps("email")}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phoneNo"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <input
                  id="phoneNo"
                  name="phoneNo"
                  type="tel"
                  autoComplete="tel"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${formik.touched.phoneNo && formik.errors.phoneNo
                    ? "border-red-500"
                    : "border-gray-300"
                    }`}
                  placeholder="+254712345678"
                  {...formik.getFieldProps("phoneNo")}
                />
                {formik.touched.phoneNo && formik.errors.phoneNo && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.phoneNo}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${formik.touched.password && formik.errors.password
                      ? "border-red-500"
                      : "border-gray-300"
                      }`}
                    placeholder="••••••••"
                    {...formik.getFieldProps("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? (
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
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.password}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${formik.touched.confirmPassword &&
                      formik.errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                      }`}
                    placeholder="••••••••"
                    {...formik.getFieldProps("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmPassword ? (
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
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.confirmPassword}
                    </p>
                  )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  "Start Free Trial"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </Link>
            </p>

            <div className="mt-4 text-center">
              <Link
                to="/"
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
