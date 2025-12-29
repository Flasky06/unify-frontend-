import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../lib/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState("input"); // input, loading, success, error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.code || formData.code.length !== 6) {
      setStatus("error");
      setMessage("Please enter a valid 6-digit reset code.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    if (status === "loading") return;

    setStatus("loading");

    try {
      await api.post("/auth/reset-password", {
        code: formData.code,
        newPassword: formData.newPassword,
      });
      setStatus("success");
      setMessage("Password reset successfully!");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setStatus("error");
      setMessage(
        error.data?.message ||
          "Failed to reset password. The code may be invalid or expired."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600">
            Enter the code from your email and your new password
          </p>
        </div>

        {status === "success" ? (
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
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">
              Redirecting to login in 2 seconds...
            </p>
          </div>
        ) : (
          <>
            {status === "error" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Reset Code
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  maxLength="6"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="000000"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
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
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Remember your password?{" "}
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

export default ResetPassword;
