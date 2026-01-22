import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import useAuthStore from "./store/authStore";
import { setGlobalAuthState } from "./lib/authState";
import { setUnauthorizedCallback } from "./lib/api";

// Initialize global auth state from persisted store
const { user, logout } = useAuthStore.getState();
if (user) {
  setGlobalAuthState({ user });
}

// Setup API unauthorized callback
setUnauthorizedCallback(logout);

import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
