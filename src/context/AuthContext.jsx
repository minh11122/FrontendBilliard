import React, { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getRoleNameById } from "@/services/auth.service";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp && decoded.exp < currentTime) {
            logout();
          } else {
            const response = await getRoleNameById({ id: decoded.roleId });
            const roleName = response.data.name;
            
            setUser({
              id: decoded.accountId,
              roleId: decoded.roleId,
              roleName,
            });
          }
        } catch (error) {
          console.error("Token decode failed:", error);
          logout();
        }
      }
      setMounted(true);
    };

    initUser();
  }, []);

  const login = async (token) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    const response = await getRoleNameById({ id: decoded.roleId });
    const roleName = response.data.name;

    setUser({
      id: decoded.accountId,
      roleId: decoded.roleId,
      roleName,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        isAuthenticated,
      }}
    >
      {mounted ? children : null}
    </AuthContext.Provider>
  );
};
