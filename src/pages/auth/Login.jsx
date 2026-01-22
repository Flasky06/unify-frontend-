import { useFormik } from "formik";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { api } from "../../lib/api";
import SEO from "../../components/common/SEO";
import { useAuth } from "../../hooks/useAuth";
import { loginSchema } from "../../schemas/authSchemas";

const Login = () => {
  const navigate = useNavigate();
  // const location = useLocation(); // Unused
  const { login, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // const from = location.state?.from?.pathname || "/dashboard"; // Unused

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validate: (values) => {
      try {
        loginSchema.parse(values);
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
        const user = await login(values);

        // Role-based redirect
        if (user?.role === "SUPER_ADMIN") {
          navigate("/super-admin/super-admin", { replace: true });
        } else if (user?.role === "BUSINESS_OWNER" && !user?.businessId) {
          // Redirect to business setup if not yet done
          navigate("/onboarding", { replace: true });
        } else {
          // All other users go to regular dashboard
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        console.error("Login failed:", error);
      }
    },
  });

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50 px-4 py-8">
      <SEO
        title="Login"
        description="Sign in to your mflow pos account to manage your business."
        url="/login"
      />
      <div className="max-w-5xl w-full">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Welcome Panel (Hidden on mobile) */}
          <div className="hidden lg:block bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-10 text-white">
            <h2 className="text-3xl font-bold mb-3">
              Welcome Back to mflow pos
            </h2>
            <p className="text-blue-100 mb-8">
              Continue managing your business with confidence
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Secure Access</h3>
                  <p className="text-sm text-blue-100">Your data is protected with enterprise-grade security</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Always Up-to-Date</h3>
                  <p className="text-sm text-blue-100">Access real-time data from anywhere, anytime</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Team Collaboration</h3>
                  <p className="text-sm text-blue-100">Work seamlessly with your team members</p>
                </div>
              </div>
            </div>

            <div className="border-t border-blue-400/30 pt-6">
              <p className="text-sm text-blue-100 italic">
                "mflow pos has transformed how we manage our inventory and sales. It's simple, fast, and reliable."
              </p>
              <p className="text-sm text-blue-200 mt-2 font-medium">— Business Owner, Nairobi</p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-blue-600 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600">Sign in to continue to your dashboard</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  {error?.message || "Login failed. Please try again."}
                </p>
              </div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-5">
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
                  <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
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
                    autoComplete="current-password"
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

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700 cursor-pointer select-none"
                  >
                    Remember me
                  </label>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 transition"
                >
                  Forgot password?
                </Link>
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
                    Signing in...
                  </span>
                ) : (
                  "Sign In to Dashboard"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-500 transition"
                >
                  Create an account
                </Link>
              </p>
            </div>

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

export default Login;
