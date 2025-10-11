// frontend/src/pages/AuthCallbackPage.js
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

const AuthCallbackPage = () => {
  const { handleSocialAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken) {
      handleSocialAuth(accessToken, refreshToken).then(() => {
        navigate("/dashboard", { replace: true });
      });
    } else {
      navigate("/login?error=social_auth_failed", { replace: true });
    }
  }, [handleSocialAuth, location.search, navigate]);

  return <LoadingSpinner />;
};

export default AuthCallbackPage;
