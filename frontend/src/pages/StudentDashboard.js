// frontend/src/pages/StudentDashboard.js
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import useApi from "../hooks/useApi";
import { apiClient } from "../api/apiClient";

import MainLayout from "../components/layout/MainLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorDisplay from "../components/common/ErrorDisplay";
import StatCard from "../components/dashboard/StatCard";
import EventCard from "../components/dashboard/EventCard";
import PostCard from "../components/dashboard/PostCard";
import "./StudentDashboard.css";

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
            />
            <StatCard label="XP Points" value={user.xp_points} icon="star" />
          </div>
          <section className="dashboard-section">
            <h3>Upcoming Events</h3>
            <div className="events-list">
              {dashboardData.upcoming_events.length > 0 ? (
                dashboardData.upcoming_events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <div className="empty-state card">
                  <span className="material-icons">event_busy</span>
                  <p>No upcoming events from your clubs.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="feed-column">
          <h3>Recent Activity</h3>
          <div className="posts-list">
            {dashboardData.recent_posts.length > 0 ? (
              dashboardData.recent_posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="empty-state card">
                <span className="material-icons">chat_bubble_outline</span>
                <p>No recent activity in your clubs.</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </MainLayout>
  );
};

export default StudentDashboard;
