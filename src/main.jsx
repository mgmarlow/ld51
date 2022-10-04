import React from "react";
import { MemoryRouter, BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const Router =
  import.meta.env.VITE_ROUTER === "in_memory" ? MemoryRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
