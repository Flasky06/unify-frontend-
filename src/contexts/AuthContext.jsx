import React, { createContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";
import { setGlobalAuthState } from "../lib/authState";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // State
  const [user, setUser] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync credentials with global state for API client
  useEffect(() => {
    setGlobalAuthState({ credentials });
  }, [credentials]);

  // Actions
  const setAuth = useCallback((userData, userCredentials) => {
    setUser(userData);
    setCredentials(userCredentials);
    setIsAuthenticated(true);
    setError(null);
  }, []);

  const login = useCallback(async (loginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await authService.login(loginCredentials);
      setUser(userData);
      setCredentials(loginCredentials);
      setIsAuthenticated(true);
      setIsLoading(false);
      setError(null);
      return userData;
    } catch (err) {
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);

  const register = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const registeredUser = await authService.register(userData);
      setIsLoading(false);
      setError(null);
      return registeredUser;
    } catch (err) {
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
    setCredentials(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    setError(null);
  }, []);

  const updateUser = useCallback((userData) => {
    setUser((prevUser) => ({ ...prevUser, ...userData }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Role-based access helpers
  const hasRole = useCallback(
    (role) => {
      return user?.role === role;
    },
    [user]
  );

  const hasAnyRole = useCallback(
    (roles) => {
      return roles.includes(user?.role);
    },
    [user]
  );

  const isBusinessOwner = useCallback(() => {
    return user?.role === "BUSINESS_OWNER";
  }, [user]);

  const isSuperAdmin = useCallback(() => {
    return user?.role === "SUPER_ADMIN";
  }, [user]);

  const canManage = useCallback(() => {
    return ["BUSINESS_OWNER", "BUSINESS_MANAGER"].includes(user?.role);
  }, [user]);

  const value = {
    // State
    user,
    credentials,
    isAuthenticated,
    isLoading,
    error,
    // Actions
    setAuth,
    login,
    register,
    logout,
    updateUser,
    clearError,
    // Role helpers
    hasRole,
    hasAnyRole,
    isBusinessOwner,
    isSuperAdmin,
    canManage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
