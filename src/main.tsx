import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "@/hooks/useAuth";
import { CmsProvider } from "@/hooks/CmsProvider";

function captureFirstTouch() {
  try {
    if (!sessionStorage.getItem("slc_landing_url")) {
      sessionStorage.setItem("slc_landing_url", window.location.href);
    }
    if (!sessionStorage.getItem("slc_referrer")) {
      sessionStorage.setItem("slc_referrer", document.referrer || "");
    }
  } catch {
    // Ignore private-mode / blocked storage.
  }
}

captureFirstTouch();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <CmsProvider>
        <App />
      </CmsProvider>
    </AuthProvider>
  </StrictMode>,
);
