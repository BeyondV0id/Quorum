import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { StoreProvider } from "./context/StoreContext.tsx";

import { API_URL } from "./config";

// Global fetch interceptor to enforce sending cookies (credentials) for cross-origin API calls
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  
  if (url.startsWith(API_URL)) {
    init = {
      ...init,
      credentials: "include",
    };
  }
  return originalFetch(input, init);
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider>
      <ThemeProvider defaultTheme="system" storageKey="echo-theme">
        <App />
      </ThemeProvider>
    </StoreProvider>
  </StrictMode>,
);
