import React, { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getRoleNameById } from "@/services/auth.service";

export const AuthContext = createContext();

const buildUserFromToken = (token, roleName = null) => {
  const decoded = jwtDecode(token);

  return {
    id: decoded.accountId,
    roleId: decoded.roleId,
    roleName,
  };
};

const isTokenExpired = (token) => {
  const decoded = jwtDecode(token);
  const currentTime = Date.now() / 1000;

  return Boolean(decoded.exp && decoded.exp < currentTime);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("selected_club_id");
    localStorage.removeItem("selected_club_name");
    localStorage.removeItem("selected_club_plan");
    sessionStorage.removeItem("postLoginRedirect");
    localStorage.removeItem("user_fullname");
    setUser(null);
    setAuthLoading(false);
  };

  useEffect(() => {
    const initUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setInitialized(true);
        return;
      }

      try {
        if (isTokenExpired(token)) {
          logout();
          setInitialized(true);
          return;
        }

        setAuthLoading(true);

        const baseUser = buildUserFromToken(token);
        const response = await getRoleNameById({ id: baseUser.roleId });
        const roleName = response.data.name;

        setUser({
          ...baseUser,
          roleName,
        });
      } catch (error) {
        console.error("Token decode failed:", error);
        logout();
      } finally {
        setAuthLoading(false);
        setInitialized(true);
      }
    };

    initUser();
  }, []);

  const login = async (token, roleNameFromServer = null) => {
    localStorage.setItem("token", token);

    try {
      if (isTokenExpired(token)) {
        logout();
        return null;
      }

      setAuthLoading(true);

      const baseUser = buildUserFromToken(token, roleNameFromServer);

      if (roleNameFromServer) {
        setUser(baseUser);
        return baseUser;
      }

      const response = await getRoleNameById({ id: baseUser.roleId });
      const roleName = response.data.name;
      const resolvedUser = {
        ...baseUser,
        roleName,
      };

      setUser(resolvedUser);
      return resolvedUser;
    } catch (error) {
      console.error("Login context failed:", error);
      logout();
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        authLoading,
        initialized,
      }}
    >
      {initialized ? children : null}
    </AuthContext.Provider>
  );
};
