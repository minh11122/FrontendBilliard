// src/context/LoadingContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import { loadingEmitter } from "@/utils/loadingEmitter";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = loadingEmitter.subscribe((loading) => {
      console.log('📡 Loading state changed:', loading);

      if (!loading) {
        // Thêm delay 300ms trước khi tắt spinner
        const timer = setTimeout(() => setIsLoading(false), 300);
        return () => clearTimeout(timer);
      } else {
        setIsLoading(true);
      }
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
};
