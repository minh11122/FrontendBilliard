// src/layouts/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import { SidebarClub } from "./sidebar-layout";

export const DashboardStaffClubLayout = () => {
  return (
    <div className="min-h-screen flex">
      <SidebarClub />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
