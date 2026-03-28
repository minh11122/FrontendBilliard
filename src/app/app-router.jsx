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
import { PlanProtectedRoute } from "@/components/PlanProtectedRoute";

import {
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  HomePage,
  TournamentPage,
  TournamentDetailPage,
  BookingPage,
  ClubDetailPage,
  PaymentPage,
  TournamentPaymentPage,
  TournamentPlayersPage,
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
  BookingCheckoutPage,
  SystemStaff,
  SystemStaff1,
  SystemStaff2,
  SystemStaff3,
  SystemStaff4,
  ProfilePage,
  AdminSettings,
  SettingPage,
  PaymentSuccessPage,
  OwnerListEmployeePage,
  OwnerCreateEmployeePage,
  OwnerUpdateEmployeePage,
  AmenitiesPage,
  OwnerResubmitClubPage,
  OwnerOnboardingPage,
  OwnerTournamentListPage,
  OwnerCreateTournamentPage,
  OwnerEditTournamentPage,
  OwnerTournamentPlayersPage,
  OwnerReportsPage,
  OwnerReviewListPage,
  StaffClubReviewListPage
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
          { path: "/tournament/:id", element: <TournamentDetailPage /> },
          { path: "/tournament/:id/payment", element: <TournamentPaymentPage /> },
          { path: "/tournament/:id/players", element: <TournamentPlayersPage /> },
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
        path: "owner/resubmit-club/:id",
        element: <OwnerResubmitClubPage />
      },
      {
        path: "owner/onboarding/:clubId",
        element: (
          <ProtectedRoute allowedRoles={["OWNER"]}>
            <OwnerOnboardingPage />
          </ProtectedRoute>
        )
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
          { path: "dashboard", element: <PlanProtectedRoute allowedPlans={["basic", "pro"]}><OwnerDashboardPage /></PlanProtectedRoute> },
          { path: "reports", element: <PlanProtectedRoute allowedPlans={["basic", "pro"]}><OwnerReportsPage /></PlanProtectedRoute> },
          { path: "reviews", element: <OwnerReviewListPage /> },
          { path: "settings", element: <SettingPage /> },
          { path: "payment-success", element: <PaymentSuccessPage  /> },
          { path: "list-employee", element: <OwnerListEmployeePage /> },
          { path: "employees/create", element: <OwnerCreateEmployeePage /> },
          { path: "employees/edit/:id", element: <OwnerUpdateEmployeePage /> },
          { path: "amenities", element: <AmenitiesPage /> },
          { path: "tournaments", element: <PlanProtectedRoute allowedPlans={["pro"]}><OwnerTournamentListPage /></PlanProtectedRoute> },
          { path: "tournaments/create", element: <PlanProtectedRoute allowedPlans={["pro"]}><OwnerCreateTournamentPage /></PlanProtectedRoute> },
          { path: "tournaments/:id/players", element: <PlanProtectedRoute allowedPlans={["pro"]}><OwnerTournamentPlayersPage /></PlanProtectedRoute> },
          { path: "tournaments/edit/:id", element: <PlanProtectedRoute allowedPlans={["pro"]}><OwnerEditTournamentPage /></PlanProtectedRoute> },
        ],
      },
      {
        path: "staff",
        element: <DashboardStaffClubLayout />,
        children: [
          { path: "dashboard", element: <StaffClubPageStatic /> },
          { path: "tables", element: <StaffClubPageManagerTable /> },
          { path: "tables/checkout/:id", element: <BookingCheckoutPage /> },
          { path: "bookings", element: <StaffClubPageBooking /> },
          { path: "tournaments", element: <StaffClubPageTournament /> },
          { path: "reviews", element: <StaffClubReviewListPage /> }
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
