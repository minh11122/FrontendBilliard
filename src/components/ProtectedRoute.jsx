import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";

/**
 * ProtectedRoute - Bao ve route theo role
 * @param {string[]} allowedRoles - Danh sach role duoc phep truy cap
 * @param {ReactNode} children - Component con can bao ve
 */
export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, authLoading, initialized } = useContext(AuthContext);
  const location = useLocation();

  if (!initialized || authLoading) {
    return null;
  }

  if (!isAuthenticated) {
    const redirectPath = `${location.pathname}${location.search}${location.hash}`;

    if (redirectPath && redirectPath !== "/auth/login") {
      sessionStorage.setItem("postLoginRedirect", redirectPath);
    }

    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!user?.roleName || !allowedRoles.includes(user.roleName)) {
      return <Navigate to="/auth/forbidden" replace />;
    }
  }

  return children;
};
