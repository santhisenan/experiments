// React
import React, { StrictMode } from "react";
// React's library to talk to web browsers
import { createRoot } from "react-dom/client";
// Styles
import "./styles.css";
// Component
import App from "./App.jsx";

// Injects the final product into index.html in the public folder.
const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
