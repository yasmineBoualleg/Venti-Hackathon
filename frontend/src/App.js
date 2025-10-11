// frontend/src/App.js

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import VantaBackground from "./components/layout/VantaBackground"; // Import background
import StudentDashboard from "./pages/StudentDashboard";
import LandingPage from "./pages/LandingPage";
import ClubsListing from "./pages/ClubsListing";
import ClubDashboard from "./pages/ClubDashboard";
import ClubEvents from "./pages/ClubEvents";
import LoginPage from "./pages/LoginPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import CompleteSignupPage from "./pages/CompleteSignupPage"; // Import new page
import CreateClubPage from './pages/CreateClubPage';
import ChatPage from './pages/ChatPage';

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
      <Route path="/complete-signup" element={<CompleteSignupPage />} />

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
        path="/clubs/create"
        element={
          <PrivateRoute>
            <CreateClubPage />
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
      <Route
        path="/events"
        element={
          <PrivateRoute>
            <ClubEvents />
          </PrivateRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <PrivateRoute>
            <ChatPage />
          </PrivateRoute>
        }
      />

      {/* Fallback route can go here */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <VantaBackground />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
