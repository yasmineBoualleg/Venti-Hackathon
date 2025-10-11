// frontend/src/pages/AuthCallbackPage.js
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { apiClient } from "../api/apiClient";

const AuthCallbackPage = () => {
  const { handleSocialAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    const processAuth = async () => {
      if (accessToken) {
        apiClient.setTokens(accessToken, refreshToken);
        try {
          const decodedToken = apiClient.getDecodedToken(accessToken);

          if (decodedToken.is_new_user) {
            const response = await apiClient.client.get('/auth/social-account/');
            navigate("/complete-signup", {
              replace: true,
              state: { socialAccount: response.data },
            });
          } else {
            await handleSocialAuth(accessToken, refreshToken);
            navigate("/dashboard", { replace: true });
          }
        } catch (error) {
          navigate("/login-failed", { replace: true });
        }
      } else {
        navigate("/login-failed", { replace: true });
      }
    };

    processAuth();
  }, [handleSocialAuth, location.search, navigate]);

  return <LoadingSpinner />;
};

export default AuthCallbackPage;
