import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../lib/api";
import { authService } from "../../services/authService";
import useAuthStore from "../../store/authStore";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("input"); // input, verifying, success, error
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      setStatus("error");
      setMessage("Please enter a valid 6-digit verification code.");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    setStatus("verifying");

    try {
      // Verify email with code
      await api.post(`/auth/verify-email?code=${code}`);
      setStatus("success");
      setMessage("Your email has been verified successfully!");

      // Auto-redirect after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setStatus("error");
      setMessage(
        error.data?.message ||
          error.message ||
          "Email verification failed. The code may be invalid or expired."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const [email, setEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleResendCode = async () => {
    if (!email) {
      setMessage("Please enter your email address to resend the code.");
      setStatus("error");
      return;
    }

    if (resendLoading) return;

    setResendLoading(true);
    setResendMessage("");

    try {
      await api.post("/auth/resend-verification-code", { email });
      setResendMessage("Verification code resent! Please check your email.");
      setMessage("");
    } catch (error) {
      setResendMessage(
        error.data?.message || "Failed to resend code. Please try again later."
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4">
            {status === "verifying" && (
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            )}
            {status === "success" && (
              <div className="bg-green-100 rounded-full p-3">
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
            )}
            {(status === "input" || status === "error") && (
              <div className="bg-blue-100 rounded-full p-3">
                <svg
                  className="h-10 w-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-blue-600 mb-2">
            {status === "verifying" && "Verifying Your Email"}
            {status === "success" && "Email Verified!"}
            {(status === "input" || status === "error") && "Verify Your Email"}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            {status === "input" &&
              "Please enter the 6-digit verification code sent to your email."}
            {status === "verifying" &&
              "Please wait while we verify your email address..."}
            {status === "success" && message}
            {status === "error" && message}
          </p>

          {/* Form */}
          {(status === "input" || status === "error") && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength="6"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="000000"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </button>

              {/* Resend Section */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  Didn't receive the code?
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendLoading}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    {resendLoading ? "Sending..." : "Resend"}
                  </button>
                </div>
                {resendMessage && (
                  <p className="mt-2 text-sm text-green-600">{resendMessage}</p>
                )}
              </div>
            </form>
          )}

          {/* Success Actions */}
          {status === "success" && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Redirecting to login in 2 seconds...
              </p>
              <Link
                to="/login"
                className="inline-block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Go to Login
              </Link>
            </div>
          )}

          {/* Back to Login */}
          {status === "input" && (
            <div className="mt-4">
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
