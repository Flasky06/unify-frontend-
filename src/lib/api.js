import { getGlobalAuthState } from "./authState";
import useAuthStore from "../store/authStore";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://unify-pos-api-production.up.railway.app/api";

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Base fetch wrapper with Bearer Token Authentication and error handling
 */
export const apiFetch = async (endpoint, options = {}) => {
  const { user } = getGlobalAuthState();
  const token = user?.token;

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  // List of public endpoints that don't require authentication
  const publicEndpoints = [
    "/auth/register",
    "/auth/login",
    "/auth/verify-email",
    "/auth/resend-verification-code",
    "/auth/forgot-password",
    "/auth/reset-password",
  ];
  const isPublicEndpoint = publicEndpoints.some((path) =>
    endpoint.includes(path)
  );

  // Add Bearer Token header if token exists AND it's not a public endpoint
  if (!isPublicEndpoint && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // If body is provided and not FormData, stringify it
  if (config.body && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  // Remove Content-Type for FormData (browser sets it automatically with boundary)
  if (config.body instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  // Handle query parameters
  let url = `${API_BASE_URL}${endpoint}`;
  if (config.params) {
    const searchParams = new URLSearchParams();
    Object.entries(config.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value);
      }
    });

    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
    delete config.params;
  }

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized - logout user (but not if already logging out)
    if (response.status === 401 && !endpoint.includes("/auth/")) {
      useAuthStore.getState().logout();
      throw new ApiError("Unauthorized - Please login again", 401, null);
    }

    // Parse response
    let data = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json().catch(() => null);
    } else {
      // For non-JSON responses (like verification success messages)
      data = await response.text().catch(() => null);
    }

    if (!response.ok) {
      throw new ApiError(
        data?.message ||
          data ||
          `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || "Network error", 0, null);
  }
};

// Convenience methods
export const api = {
  get: (endpoint, options) => apiFetch(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body, options) =>
    apiFetch(endpoint, { ...options, method: "POST", body }),
  put: (endpoint, body, options) =>
    apiFetch(endpoint, { ...options, method: "PUT", body }),
  patch: (endpoint, body, options) =>
    apiFetch(endpoint, { ...options, method: "PATCH", body }),
  delete: (endpoint, options) =>
    apiFetch(endpoint, { ...options, method: "DELETE" }),
};
