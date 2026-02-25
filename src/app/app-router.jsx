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
  AccountManagement,
  LoginClub,
  LoginSystem,
  Owner1,
  Owner2,
  Owner3,
  Owner4
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
          { path: "login-system/adminstration", element: <LoginSystem /> },
          { path: "login-club/club", element: <LoginClub /> },
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
      {
        path: "owner",
        element: <DashboardMainLayout />,
        children: [
          { path: "owner1", element: <Owner1 /> },
          { path: "owner2", element: <Owner2 /> },
          { path: "owner3", element: <Owner3 /> },
          { path: "owner4", element: <Owner4 /> },
        ],
      },
    ],
  },
]);
