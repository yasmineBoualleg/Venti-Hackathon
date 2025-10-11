// frontend/src/components/layout/Sidebar.js
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Sidebar.css";

// Helper function to generate a consistent, colorful gradient based on username
const generateGradient = (username) => {
  const gradients = [
    "linear-gradient(135deg, #00d4aa, #764ba2)",
    "linear-gradient(135deg, #ff6b6b, #f06595)",
    "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    "linear-gradient(135deg, #f59e0b, #ef4444)",
    "linear-gradient(135deg, #10b981, #22c55e)",
    "linear-gradient(135deg, #6366f1, #a78bfa)",
  ];
  const charCodeSum = username
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return gradients[charCodeSum % gradients.length];
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const avatarStyle = user
    ? { background: generateGradient(user.username) }
    : {};

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <NavLink to="/dashboard" className="venti-logo-link">
          <div className="venti-logo">
            <span className="ven-solid">VEN</span>
            <span className="ti-stroke">TI</span>
          </div>
        </NavLink>
      </div>

      {user && (
        <div className="profile-section">
          <div className="profile-avatar" style={avatarStyle}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <h3>@{user.username}</h3>
          <p>{user.xp_points} XP</p>
        </div>
      )}

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="nav-item">
          <span className="material-icons">dashboard</span>
          <span className="nav-text">Dashboard</span>
        </NavLink>
        <NavLink to="/clubs" className="nav-item">
          <span className="material-icons">group</span>
          <span className="nav-text">Clubs</span>
        </NavLink>
        <NavLink to="/events" className="nav-item">
          <span className="material-icons">event</span>
          <span className="nav-text">Events</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="btn btn-logout">
          <span className="material-icons">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
