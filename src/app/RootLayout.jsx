// src/app/RootLayout.jsx
import { Outlet } from "react-router-dom";
import { LoadingSpinner } from "@/components/common/spinder";
import ScrollToTop from "@/components/common/ScrollToTop";

export function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
      <LoadingSpinner />
    </>
  );
}