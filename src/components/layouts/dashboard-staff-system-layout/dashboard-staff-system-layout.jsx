// src/layouts/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import { SidebarAdmin } from "./sidebar-layout";

export const DashboardStaffSystemLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f8fa]">
      <SidebarAdmin />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
