import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

/**
 * PlanProtectedRoute - Bảo vệ các tính năng nâng cao dựa trên gói đăng ký của quán
 * @param {string[]} allowedPlans - Mảng các gói cho phép, VD: ["basic", "pro"]
 * @param {ReactNode} children - Component con
 */
export const PlanProtectedRoute = ({ allowedPlans, children }) => {
  // Lấy gói của club đang được chọn (mặc định 'free')
  const currentPlan = localStorage.getItem("selected_club_plan") || "free";

  if (!allowedPlans.includes(currentPlan)) {
    // Notify the user that they don't have access
    toast("Tính năng này cần nâng cấp gói " + (allowedPlans[0] === 'pro' ? 'Pro' : 'Basic'), { icon: '🔒', id: "plan-restricted-toast" });
    
    // Redirect to a safe default page that is available to free
    return <Navigate to="/owner/tables" replace />;
  }

  return children;
};
