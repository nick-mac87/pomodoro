import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./themes/base.css";
import "./themes/retro.css";
import "./themes/clean.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
