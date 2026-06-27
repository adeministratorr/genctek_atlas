import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/style.css";
// Leaflet core CSS — must be imported before LeafletMap renders
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import App from "./App.jsx";
import { AppProvider } from "./context/AppContext";

import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
);

// Register Service Worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("[PWA] Service Worker registered successfully:", reg.scope))
      .catch((err) => console.error("[PWA] Service Worker registration failed:", err));
  });
}
