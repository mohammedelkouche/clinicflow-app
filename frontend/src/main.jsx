import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./styles/index.css";
import "./styles/patients.css";
import "./styles/appointments.css";
import "./styles/users.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4500,
            style: {
              border: "1px solid #d8e5e1",
              color: "#17342f",
              background: "#ffffff",
              boxShadow: "0 16px 42px rgb(23 52 47 / 16%)",
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
