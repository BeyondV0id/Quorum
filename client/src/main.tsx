import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { StoreProvider } from "./context/StoreContext.tsx";

import { API_URL } from "./config";

// Global fetch interceptor to attach Bearer Token for API calls (cross-origin cookie alternative)
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  
  if (url.startsWith(API_URL)) {
    const token = localStorage.getItem("bearer_token");
    if (token) {
      const headers = new Headers(init?.headers || {});
      if (!headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      init = {
        ...init,
        headers,
      };
    }
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
