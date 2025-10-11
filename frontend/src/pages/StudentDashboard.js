// frontend/src/pages/StudentDashboard.js
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import useApi from "../hooks/useApi";
import { apiClient } from "../api/apiClient";
import { Link } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorDisplay from "../components/common/ErrorDisplay";
import StatCard from "../components/dashboard/StatCard";
import EventCard from "../components/dashboard/EventCard";
import PostCard from "../components/dashboard/PostCard";
import "./StudentDashboard.css";

// A new sub-component for dashboard widgets
const Widget = ({ color, icon, title, children }) => (
  <div className={`widget card ${color || ""}`}>
    {title && (
      <div className="widget-header">
        {icon && <span className="material-icons">{icon}</span>}
        <h4>{title}</h4>
      </div>
    )}
    <div className="widget-content">{children}</div>
  </div>
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const getDashboardData = React.useCallback(
    () => apiClient.getDashboardData(),
    []
  );
  const { data: dashboardData, loading, error } = useApi(getDashboardData);

  if (loading)
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  if (error)
    return (
      <MainLayout>
        <ErrorDisplay message="Failed to load dashboard data." />
      </MainLayout>
    );
  if (!dashboardData) return null;

  const noActivity = 
    dashboardData.upcoming_events.length === 0 && 
    dashboardData.recent_posts.length === 0;

  return (
    <MainLayout>
      <div className="dashboard-grid">
        <div className="dashboard-main">
          <div className="content-header">
            <h2>Dashboard</h2>
            <p className="subtitle">Welcome back, @{user.username}!</p>
          </div>

          <div className="stats-grid">
            <StatCard
              label="My Clubs"
              value={dashboardData.clubs_count}
              icon="group"
              linkTo="/clubs"
            />
            <StatCard label="XP Points" value={user.xp_points} icon="star" />
          </div>

          {noActivity && (
            <div className="empty-state card">
              <span className="material-icons">explore</span>
              <h3>Your dashboard is quiet...</h3>
              <p>Join some clubs to see updates and events here.</p>
              <Link to="/clubs" className="btn btn-primary">
                Discover Clubs
              </Link>
            </div>
          )}

          <div className="widgets-grid-main">
            <Widget color="purple" title="My Tasks">
              <div className="task-list">
                <div className="task-item">
                  <input type="checkbox" id="task1" defaultChecked />
                  <label htmlFor="task1">Review Linear Algebra Notes</label>
                </div>
                <div className="task-item">
                  <input type="checkbox" id="task2" />
                  <label htmlFor="task2">Complete PyTorch tutorial</label>
                </div>
              </div>
            </Widget>
            <Widget color="teal" title="Session Focus">
              <p className="session-promo">
                Stay focused and track your study sessions. Coming soon!
              </p>
            </Widget>
          </div>
        </div>

        <aside className="feed-column">
          <h3>Upcoming Events</h3>
          <div className="events-list">
            {dashboardData.upcoming_events.length > 0 ? (
              dashboardData.upcoming_events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <div className="empty-state card">
                <span className="material-icons">event_busy</span>
                <p>No upcoming events.</p>
                <Link to="/events" className="btn">
                  Browse Events
                </Link>
              </div>
            )}
          </div>

          <h3 style={{ marginTop: "var(--spacing-xl)" }}>Recent Activity</h3>
          <div className="posts-list">
            {dashboardData.recent_posts.length > 0 ? (
              dashboardData.recent_posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="empty-state card">
                <span className="material-icons">chat_bubble_outline</span>
                <p>No recent activity.</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </MainLayout>
  );
};

export default StudentDashboard;
