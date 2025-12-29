import { useFormik } from "formik";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { registerSchema } from "../../schemas/authSchemas";

const Register = () => {
  const { register, isLoading, error } = useAuth();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

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
        const { confirmPassword, ...data } = values;
        const registerData = {
          ...data,
          role: "BUSINESS_OWNER",
        };
        await register(registerData);

        // Email verification disabled - redirect to login
        alert("Registration successful! Please login to continue.");
        window.location.href = "/login";
      } catch (error) {
        console.error("Registration failed:", error);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {registrationSuccess ? (
          // Success Message
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Registration Successful!
            </h1>
            <p className="text-gray-600 mb-6">
              We've sent a 6-digit verification code to{" "}
              <strong>{userEmail}</strong>. Please check your inbox and enter
              the code to activate your account.
            </p>
            <div className="space-y-3">
              <Link
                to="/verify-email"
                className="inline-block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Enter Verification Code
              </Link>
              <p className="text-sm text-gray-500">
                Didn't receive the code? Check your spam folder or try again in
                a few minutes.
              </p>
            </div>
          </div>
        ) : (
          // Registration Form
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-blue-600 mb-2">
                Create Account
              </h1>
              <p className="text-gray-600">Sign up to get started</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  {error?.message || "Registration failed. Please try again."}
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                    formik.touched.email && formik.errors.email
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                    formik.touched.phoneNo && formik.errors.phoneNo
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="+1234567890"
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
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                    formik.touched.password && formik.errors.password
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="••••••••"
                  {...formik.getFieldProps("password")}
                />
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
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="••••••••"
                  {...formik.getFieldProps("confirmPassword")}
                />
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
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating account..." : "Create Account"}
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
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
