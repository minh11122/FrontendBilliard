// src/app/RootLayout.jsx
import { Outlet } from "react-router-dom";
import { LoadingSpinner } from "@/components/common/spinder";

export function RootLayout() {
  return (
    <>
      <Outlet />
      <LoadingSpinner />
    </>
  );
}