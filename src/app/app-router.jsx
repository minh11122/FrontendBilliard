import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "./RootLayout";

import {
  AuthLayout,
  HomeMainLayout,
} from "@/components/layouts";

import {
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  HomePage,
  Forbidden
} from "@/pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "auth",
        element: <AuthLayout />,
        children: [
          { path: "login", element: <LoginForm /> },
          { path: "register", element: <RegisterForm /> },
          { path: "forgot-password", element: <ForgotPasswordForm /> },
          { path: "forbidden", element: <Forbidden /> },
        ],
      },
      {
        path: "",
        element: <HomeMainLayout />,
        children: [
          { path: "", element: <HomePage /> },
        ],
      },

    ],
  },
]);
