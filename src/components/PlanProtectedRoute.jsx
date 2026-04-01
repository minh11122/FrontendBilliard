import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

export const PlanProtectedRoute = ({ allowedPlans, children }) => {
  const currentPlan = localStorage.getItem("selected_club_plan") || "free";
  const selectedClubId = localStorage.getItem("selected_club_id");
  const isAllowed = allowedPlans.includes(currentPlan);

  useEffect(() => {
    if (isAllowed) return;

    toast(
      `Tinh nang nay can nang cap goi ${allowedPlans[0] === "pro" ? "Pro" : "Basic"}`,
      { icon: "🔒", id: "plan-restricted-toast" },
    );
  }, [allowedPlans, isAllowed]);

  if (!isAllowed) {
    return (
      <Navigate
        to={selectedClubId ? "/owner/tables" : "/owner/select-club"}
        replace
      />
    );
  }

  return children;
};
