// frontend/src/contexts/AuthContext.js

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { apiClient } from "../api/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const initializeAuth = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // Set the token in our api client header for the initial load
      apiClient.setTokens(token, localStorage.getItem("refreshToken"));
      const decodedToken = apiClient.getDecodedToken();
      if (decodedToken) {
        try {
          const { data } = await apiClient.getUser(decodedToken.user_id);
          setUser(data);
        } catch (error) {
          console.error("Failed to fetch user data on initial load:", error);
          apiClient.logout();
          setUser(null);
        }
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (username, password) => {
    await apiClient.login(username, password);
    await initializeAuth();
  };

  const handleSocialAuth = useCallback(
    async (access, refresh) => {
      apiClient.setTokens(access, refresh);
      await initializeAuth();
    },
    [initializeAuth]
  );

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  const value = {
    user,
    setUser, // Expose setUser for updates
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
    handleSocialAuth,
    initializeAuth, // Expose for signup page
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
