import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "./RootLayout";

import {
  AuthLayout,
  HomeMainLayout,
  DashboardMainLayout,
  DashboardStaffSystemLayout,
  DashboardOwnerLayout,
  DashboardStaffClubLayout
} from "@/components/layouts";

import { ProtectedRoute } from "@/components/ProtectedRoute";

import {
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  HomePage,
  TournamentPage,
  BookingPage,
  ClubDetailPage,
  PaymentPage,
  BookingHistoryPage,
  Forbidden,
  AccPendingManagement,
  ShopManagement,
  AccountManagement,
  LoginSystem,
  RegisterOwnerAccount,
  OwnerSelectClubPage,
  OwnerTableListPage,
  OwnerCreateTablePage,
  OwnerEditTablePage,
  OwnerServiceListPage,
  OwnerCreateServicePage,
  OwnerEditServicePage,
  OwnerDashboardPage,
  StaffClubPageManagerTable,
  StaffClubPageBooking,
  StaffClubPageStatic,
  StaffClubPageTournament,
  SystemStaff,
  SystemStaff1,
  SystemStaff2,
  SystemStaff3,
  SystemStaff4,
  ProfilePage,
  AdminSettings,
  SettingPage
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
          { path: "/payment/:bookingId", element: <PaymentPage /> },
          { path: "/my-bookings", element: <BookingHistoryPage /> },
          { path: "/register-owner-account", element: <RegisterOwnerAccount /> },
          { path: "/profile", element: <ProfilePage /> },
        ],
      },
      {
        path: "owner/select-club",
        element: <OwnerSelectClubPage />
      },
      {
        path: "admin",
        element: <DashboardMainLayout />,
        children: [
          { path: "list-user", element: <AccountManagement /> },
          { path: "list-acc-pending", element: <AccPendingManagement /> },
          { path: "list-shop", element: <ShopManagement /> },

          { path: "thongke", element: <AdminSettings /> },
        ],
      },
      {
        path: "owner",
        element: (
          <ProtectedRoute allowedRoles={["OWNER"]}>
            <DashboardOwnerLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "tables", element: <OwnerTableListPage /> },
          { path: "tables/create", element: <OwnerCreateTablePage /> },
          { path: "tables/edit/:id", element: <OwnerEditTablePage /> },
          { path: "services", element: <OwnerServiceListPage /> },
          { path: "services/create", element: <OwnerCreateServicePage /> },
          { path: "services/edit/:id", element: <OwnerEditServicePage /> },
          { path: "dashboard", element: <OwnerDashboardPage /> },
          { path: "settings", element: <SettingPage /> }
        ],
      },
      {
        path: "staff",
        element: <DashboardStaffClubLayout />,
        children: [
          { path: "dashboard", element: <StaffClubPageStatic /> },
          { path: "tables", element: <StaffClubPageManagerTable /> },
          { path: "bookings", element: <StaffClubPageBooking /> },
          { path: "tournaments", element: <StaffClubPageTournament /> },
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
