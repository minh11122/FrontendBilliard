import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "./RootLayout";

import {
  AuthLayout,
  HomeMainLayout,
  DashboardMainLayout
} from "@/components/layouts";

import {
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  HomePage,
  TournamentPage,
  Forbidden,
  AccPendingManagement,
  ShopManagement,
  AdminSettings,
  AccountManagement
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
          { path: "/tournament", element: <TournamentPage /> },
          { path: "", element: <HomePage /> },
          { path: "", element: <HomePage /> },
        ],
      },
      {
        path: "admin",
        element: <DashboardMainLayout />,
        children: [
          { path: "list-user", element: <AccountManagement /> },
          { path: "list-acc-pending", element: <AccPendingManagement /> },
          { path: "list-shop", element: <ShopManagement /> },
          { path: "setting", element: <AdminSettings /> },
        ],
      },
    ],
  },
]);
