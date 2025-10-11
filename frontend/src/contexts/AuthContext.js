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
    const decodedToken = apiClient.getDecodedToken();
    if (decodedToken) {
      try {
        // Fetch full user details using the user_id from the token
        const { data } = await apiClient.getUser(decodedToken.user_id);
        setUser(data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        apiClient.logout();
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (username, password) => {
    await apiClient.login(username, password);
    await initializeAuth(); // Re-initialize to fetch user data with the new token
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
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
    handleSocialAuth,
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
