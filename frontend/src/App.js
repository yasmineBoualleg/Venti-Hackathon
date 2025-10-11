// frontend/src/App.js

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import StudentDashboard from "./pages/StudentDashboard";
import LandingPage from "./pages/LandingPage";
import ClubsListing from "./pages/ClubsListing";
import ClubDashboard from "./pages/ClubDashboard";
import LoginPage from "./pages/LoginPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <StudentDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/clubs"
        element={
          <PrivateRoute>
            <ClubsListing />
          </PrivateRoute>
        }
      />
      <Route
        path="/clubs/:clubId"
        element={
          <PrivateRoute>
            <ClubDashboard />
          </PrivateRoute>
        }
      />

      {/* Fallback route can go here */}
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
