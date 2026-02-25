// src/layouts/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import { SidebarAdmin } from "./sidebar-layout";

export const DashboardMainLayout = () => {
  return (
    <div className="min-h-screen flex">
      <SidebarAdmin />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
