// frontend/src/pages/ClubEvents.js
import React, { useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import useApi from "../hooks/useApi";
import { apiClient } from "../api/apiClient";

import MainLayout from "../components/layout/MainLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorDisplay from "../components/common/ErrorDisplay";
import EventCard from "../components/dashboard/EventCard";

import "../styles/global.css";
import "../styles/dashboard.css";
import "./ClubEvents.css";

const CreateEventModal = ({ isOpen, onClose, onCreateSuccess, userClubs }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [club, setClub] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiClient.client.post("/events/", {
        title,
        description,
        date,
        club,
      });
      onCreateSuccess();
      onClose();
      setTitle("");
      setDescription("");
      setDate("");
      setClub("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" style={{ display: "flex" }}>
      <div className="modal-content card">
        <div className="modal-header">
          <h3>
            <span className="material-icons">event</span> Create New Event
          </h3>
          <button className="close-btn" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="eventTitle">Event Title</label>
            <input
              type="text"
              id="eventTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter event title"
            />
          </div>
          <div className="form-group">
            <label htmlFor="eventDescription">Description</label>
            <textarea
              id="eventDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Describe your event..."
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="eventDate">Date & Time</label>
            <input
              type="datetime-local"
              id="eventDate"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="eventClub">Club</label>
            <select
              id="eventClub"
              value={club}
              onChange={(e) => setClub(e.target.value)}
              required
            >
              <option value="">Select a club</option>
              {(userClubs || []).map((uc) => (
                <option key={uc.id} value={uc.id}>
                  {uc.name}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit btn btn-primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ClubEvents = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getEvents = useCallback(() => apiClient.client.get("/events/"), []);
  const { data: events, loading, error, refetch } = useApi(getEvents);

  const getUserMemberships = useCallback(
    () => apiClient.client.get(`/users/${user.id}/memberships/`),
    [user.id]
  );
  const {
    data: userClubs,
    loading: userClubsLoading,
    error: userClubsError,
  } = useApi(getUserMemberships);

  const handleViewEvent = (eventId) => alert(`Viewing event ${eventId}`);
  const handleJoinEvent = (eventId) => alert(`Joining event ${eventId}`);

  const handleCreateEventSuccess = () => {
    alert("Event created successfully!");
    refetch();
  };

  if (loading || userClubsLoading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  }
  if (error || userClubsError) {
    return (
      <MainLayout>
        <ErrorDisplay
          message={
            error?.message || userClubsError?.message || "Failed to load data."
          }
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="main-content">
        <div className="content-header">
          <div className="header-left">
            <h2>
              <span className="material-icons">event</span> Upcoming Events
            </h2>
            <p className="subtitle">Events from all clubs</p>
          </div>
          <div className="header-right">
            <button
              className="create-event-btn btn btn-primary"
              onClick={() => setIsModalOpen(true)}
            >
              <span className="material-icons">add</span>
              Create Event
            </button>
          </div>
        </div>
        <div className="events-container">
          {(events || []).length > 0 ? (
            (events || []).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                showDetails={true}
                onViewDetails={handleViewEvent}
                onJoinEvent={handleJoinEvent}
              />
            ))
          ) : (
            <div className="empty-state card">
              <span className="material-icons">event_busy</span>
              <h3>No upcoming events</h3>
              <p>Check back later for new events from your clubs!</p>
            </div>
          )}
        </div>
      </div>
      <CreateEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateSuccess={handleCreateEventSuccess}
        userClubs={userClubs}
      />
    </MainLayout>
  );
};

export default ClubEvents;
