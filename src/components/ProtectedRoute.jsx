import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";

/**
 * ProtectedRoute - Bảo vệ route theo role
 * @param {string[]} allowedRoles - Danh sách role được phép truy cập (VD: ["OWNER", "ADMIN"])
 * @param {ReactNode} children - Component con cần bảo vệ
 */
export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useContext(AuthContext);

  // Chưa đăng nhập → redirect về trang login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login-club/club" replace />;
  }

  // Đã đăng nhập nhưng sai role → redirect về trang Forbidden
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user?.roleName || !allowedRoles.includes(user.roleName)) {
      return <Navigate to="/auth/forbidden" replace />;
    }
  }

  return children;
};
