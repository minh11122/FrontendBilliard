import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "./RootLayout";

import {
  AuthLayout,
  HomeMainLayout,
  DashboardMainLayout,
  DashboardStaffSystemLayout,
  DashboardOwnerLayout
} from "@/components/layouts";

import {
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  HomePage,
  TournamentPage,
  BookingPage,
  ClubDetailPage,
  Forbidden,
  AccPendingManagement,
  ShopManagement,
  AccountManagement,
  LoginClub,
  LoginSystem,
  RegisterOwnerAccount,
  OwnerTableListPage,   
  OwnerCreateTablePage,
  OwnerDashboardPage,
  Staff1,
  Staff2,
  Staff3,
  Staff4,
  SystemStaff,
  SystemStaff1,
  SystemStaff2,
  SystemStaff3,
  SystemStaff4
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
          { path: "/booking", element: <BookingPage /> },
          { path: "/booking/:id", element: <ClubDetailPage /> },
          { path: "/register-owner-account", element: <RegisterOwnerAccount /> },
        ],
      },
      {
        path: "admin",
        element: <DashboardMainLayout />,
        children: [
          { path: "list-user", element: <AccountManagement /> },
          { path: "list-acc-pending", element: <AccPendingManagement /> },
          { path: "list-shop", element: <ShopManagement /> },
          
        ],
      },
      {
        path: "owner",
        element: <DashboardOwnerLayout />,
        children: [
          { path: "tables", element: <OwnerTableListPage /> },
          { path: "tables/create", element: <OwnerCreateTablePage /> },
          { path: "dashboard", element: <OwnerDashboardPage /> },
        ],
      },
      {
        path: "staff",
        element: <DashboardMainLayout />,
        children: [
          { path: "staff1", element: <Staff1 /> },
          { path: "staff2", element: <Staff2 /> },
          { path: "staff3", element: <Staff3 /> },
          { path: "staff4", element: <Staff4 /> },
        ],
      },
      {
        path: "systemstaff",
        element: <DashboardStaffSystemLayout />,
        children: [
          { path: "systemstaff1", element: <SystemStaff /> },
          { path: "systemstaff2", element: <SystemStaff1 /> },
          { path: "systemstaff3", element: <SystemStaff2 /> },
          { path: "systemstaff4", element: <SystemStaff3 /> },
          { path: "systemstaff5", element: <SystemStaff4 /> },
        ],
      },
    ],
  },
]);
