import { StrictMode, useContext } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import { router } from "@/app/app-router";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, AuthContext } from "@/context/AuthContext";
import { LoadingProvider } from "@/context/LoadingContext";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <RouterProvider router={router} />
      {/* {user?.roleName === "CUSTOMER" && <ChatAI />} */}
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <LoadingProvider>
    <AuthProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </AuthProvider>
  </LoadingProvider>
);
