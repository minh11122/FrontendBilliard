// src/layouts/AdminLayout.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { SidebarOwner } from "./sidebar-layout";

export const DashboardOwnerLayout = () => {
  const location = useLocation();
  const selectedClubId = localStorage.getItem("selected_club_id");

  if (!selectedClubId) {
    return (
      <Navigate
        to="/owner/select-club"
        replace
        state={{ from: location }}
      />
    );
  }

  return (
    <div className="min-h-screen flex">
      <SidebarOwner />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
