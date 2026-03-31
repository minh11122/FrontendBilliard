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

import * as Pages from "@/pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [

      // ================= AUTH =================
      {
        path: "auth",
        element: <AuthLayout />,
        children: [
          { path: "login", element: <Pages.LoginForm /> },
          { path: "register", element: <Pages.RegisterForm /> },
          { path: "forgot-password", element: <Pages.ForgotPasswordForm /> },
          { path: "login-system/adminstration", element: <Pages.LoginSystem /> },
          { path: "forbidden", element: <Pages.Forbidden /> },
        ],
      },

      // ================= PUBLIC =================
      {
        path: "",
        element: <HomeMainLayout />,
        children: [
          { index: true, element: <Pages.HomePage /> },
          { path: "tournament", element: <Pages.TournamentPage /> },
          { path: "tournament/:id", element: <Pages.TournamentDetailPage /> },
          { path: "tournament/:id/payment", element: <Pages.TournamentPaymentPage /> },
          { path: "tournament/:id/players", element: <Pages.TournamentPlayersPage /> },
          { path: "booking", element: <Pages.BookingPage /> },
          { path: "booking/:id", element: <Pages.ClubDetailPage /> },
          { path: "payment/:bookingId", element: <Pages.PaymentPage /> },
          { path: "posts", element: <Pages.PostPage /> },

          // 🔒 cần login
          {
            element: <ProtectedRoute/>,
            children: [
              { path: "my-bookings", element: <Pages.BookingHistoryPage /> },
              { path: "profile", element: <Pages.ProfilePage /> },
            ],
          },
        ],
      },

      // ================= OWNER (ngoài dashboard) =================
      {
        element: <ProtectedRoute allowedRoles={["OWNER"]} />,
        children: [
          { path: "owner/select-club", element: <Pages.OwnerSelectClubPage /> },
          { path: "owner/resubmit-club/:id", element: <Pages.OwnerResubmitClubPage /> },
          { path: "owner/onboarding/:clubId", element: <Pages.OwnerOnboardingPage /> },
        ],
      },

      // ================= ADMIN =================
      {
        path: "admin",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <DashboardMainLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "list-user", element: <Pages.AccountManagement /> },
          { path: "list-acc-pending", element: <Pages.AccPendingManagement /> },
          { path: "list-shop", element: <Pages.ShopManagement /> },
          { path: "thongke", element: <Pages.AdminSettings /> },
        ],
      },

      // ================= OWNER DASHBOARD =================
      {
        path: "owner",
        element: (
          <ProtectedRoute allowedRoles={["OWNER"]}>
            <DashboardOwnerLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "tables", element: <Pages.OwnerTableListPage /> },
          { path: "tables/create", element: <Pages.OwnerCreateTablePage /> },
          { path: "tables/edit/:id", element: <Pages.OwnerEditTablePage /> },

          { path: "services", element: <Pages.OwnerServiceListPage /> },
          { path: "services/create", element: <Pages.OwnerCreateServicePage /> },
          { path: "services/edit/:id", element: <Pages.OwnerEditServicePage /> },

          {
            path: "dashboard",
            element: (
              <PlanProtectedRoute allowedPlans={["basic", "pro"]}>
                <Pages.OwnerDashboardPage />
              </PlanProtectedRoute>
            ),
          },

          {
            path: "reports",
            element: (
              <PlanProtectedRoute allowedPlans={["basic", "pro"]}>
                <Pages.OwnerReportsPage />
              </PlanProtectedRoute>
            ),
          },

          { path: "reviews", element: <Pages.OwnerReviewListPage /> },
          { path: "settings", element: <Pages.SettingPage /> },
          { path: "payment-success", element: <Pages.PaymentSuccessPage /> },

          { path: "list-employee", element: <Pages.OwnerListEmployeePage /> },
          { path: "employees/create", element: <Pages.OwnerCreateEmployeePage /> },
          { path: "employees/edit/:id", element: <Pages.OwnerUpdateEmployeePage /> },

          { path: "amenities", element: <Pages.AmenitiesPage /> },

          {
            path: "tournaments",
            element: (
              <PlanProtectedRoute allowedPlans={["pro"]}>
                <Pages.OwnerTournamentListPage />
              </PlanProtectedRoute>
            ),
          },

          {
            path: "tournaments/create",
            element: (
              <PlanProtectedRoute allowedPlans={["pro"]}>
                <Pages.OwnerCreateTournamentPage />
              </PlanProtectedRoute>
            ),
          },

          {
            path: "tournaments/:id/players",
            element: (
              <PlanProtectedRoute allowedPlans={["pro"]}>
                <Pages.OwnerTournamentPlayersPage />
              </PlanProtectedRoute>
            ),
          },

          {
            path: "tournaments/edit/:id",
            element: (
              <PlanProtectedRoute allowedPlans={["pro"]}>
                <Pages.OwnerEditTournamentPage />
              </PlanProtectedRoute>
            ),
          },

          { path: "posts", element: <Pages.OwnerPostPage /> },
        ],
      },

      // ================= STAFF =================
      {
        path: "staff",
        element: (
          <ProtectedRoute allowedRoles={["STAFF"]}>
            <DashboardStaffClubLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "dashboard", element: <Pages.StaffClubPageStatic /> },
          { path: "tables", element: <Pages.StaffClubPageManagerTable /> },
          { path: "tables/checkout/:id", element: <Pages.BookingCheckoutPage /> },
          { path: "bookings", element: <Pages.StaffClubPageBooking /> },
          { path: "tournaments", element: <Pages.StaffClubPageTournament /> },
          { path: "reviews", element: <Pages.StaffClubReviewListPage /> },
        ],
      },

      // ================= SYSTEM STAFF =================
      {
        path: "systemstaff",
        element: (
          <ProtectedRoute allowedRoles={["SYSTEM_STAFF"]}>
            <DashboardStaffSystemLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "systemstaff1", element: <Pages.SystemStaff /> },
          { path: "systemstaff2", element: <Pages.SystemStaff1 /> },
          { path: "systemstaff3", element: <Pages.SystemStaff2 /> },
          { path: "systemstaff4", element: <Pages.SystemStaff3 /> },
          { path: "systemstaff5", element: <Pages.SystemStaff4 /> },
        ],
      },
    ],
  },
]);