import { useEffect, useRef, useCallback } from "react";
import useAuthStore from "../store/authStore";

/**
 * Custom hook to automatically logout user after a period of inactivity
 * @param {number} timeout - Timeout in milliseconds (default: 5 minutes)
 */
export const useIdleTimeout = (timeout = 5 * 60 * 1000) => {
  const { logout, isAuthenticated } = useAuthStore();
  const timeoutRef = useRef(null);

  const resetTimer = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (isAuthenticated) {
        logout();
      }
    }, timeout);
  }, [isAuthenticated, logout, timeout]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Events that indicate user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];

    // Reset timer on any user activity
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Start the timer initially
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isAuthenticated, resetTimer]);
};
