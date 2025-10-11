// frontend/src/pages/ClubsListing.js
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useApi from "../hooks/useApi";
import { apiClient } from "../api/apiClient";

import MainLayout from "../components/layout/MainLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorDisplay from "../components/common/ErrorDisplay";
import "./ClubsListing.css";

const ClubCard = ({ club, onJoinClub, onGoToClub, onManageClub }) => {
  return (
    <div className="club-card card">
      <div className="club-header">
        <div className="club-logo">
          {club.is_member ? (
            <span className="material-icons">check_circle</span>
          ) : (
            <span className="material-icons">group_add</span>
          )}
        </div>
        <div className="club-status">
          {club.is_member ? (
            <span className="status-badge joined">Joined</span>
          ) : (
            <span className="status-badge available">Available</span>
          )}
        </div>
      </div>

      <div className="club-content">
        <h3 className="club-name">{club.name}</h3>
        <p className="club-description">{club.description}</p>

        <div className="club-stats">
          <div className="stat">
            <span className="material-icons">group</span>
            <span>{club.members_count} members</span>
          </div>
          <div className="stat">
            <span className="material-icons">person</span>
            <span>Admin: @{club.admin_username}</span>
          </div>
        </div>
      </div>

      <div className="club-actions">
        {club.is_member ? (
          <button
            className="action-btn btn-primary"
            onClick={() => onGoToClub(club.id)}
          >
            <span className="material-icons">dashboard</span>
            Go to Club
          </button>
        ) : (
          <button
            className="action-btn btn-secondary"
            onClick={() => onJoinClub(club.id)}
          >
            <span className="material-icons">person_add</span>
            {club.requires_request ? 'Request to Join' : 'Join Club'}
          </button>
        )}
        {club.is_admin && (
            <button
                className="action-btn btn-tertiary"
                onClick={() => onManageClub(club.id)}
            >
                <span className="material-icons">settings</span>
                Manage
            </button>
        )}
      </div>
    </div>
  );
};

const CreateClubModal = ({ isOpen, onClose, onCreateSuccess }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiClient.createClub(name, description);
      onCreateSuccess();
      onClose();
      setName("");
      setDescription("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create club.");
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
            <span className="material-icons">add_circle</span> Create New Club
          </h3>
          <button className="close-btn" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="clubName">Club Name</label>
            <input
              type="text"
              id="clubName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter club name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="clubDescription">Description</label>
            <textarea
              id="clubDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Describe your club..."
            ></textarea>
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
              {loading ? "Creating..." : "Create Club"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ClubsListing = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getClubs = useCallback(() => apiClient.getClubs(), []);
  const { data: clubs, loading, error, refetch } = useApi(getClubs);

  const handleJoinClub = async (clubId) => {
    try {
      const response = await apiClient.joinClub(clubId);
      alert(response.data.detail);
      refetch();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to join club");
    }
  };

  const handleGoToClub = (clubId) => {
    navigate(`/clubs/${clubId}`);
  };

  const handleManageClub = (clubId) => {
    navigate(`/clubs/${clubId}`);
  };

  const handleCreateClubSuccess = () => {
    alert(
      "Club created successfully! It will be visible after admin approval."
    );
    refetch();
  };

  if (loading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <ErrorDisplay message={error.message || "Failed to load clubs."} />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="main-content">
        <div className="content-header">
          <div className="header-left">
            <h2>
              <span className="material-icons">group</span> All Clubs
            </h2>
            <p className="subtitle">
              Discover and join clubs that match your interests
            </p>
          </div>
          <div className="header-right">
            <button
              className="create-club-btn btn btn-primary"
              onClick={() => setIsModalOpen(true)}
            >
              <span className="material-icons">add</span>
              Create Club
            </button>
          </div>
        </div>

        <div className="clubs-grid">
          {(clubs || []).length > 0 ? (
            (clubs || []).map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                onJoinClub={handleJoinClub}
                onGoToClub={handleGoToClub}
                onManageClub={handleManageClub}
              />
            ))
          ) : (
            <div className="empty-state card">
              <span className="material-icons">search_off</span>
              <h3>No clubs available</h3>
              <p>Be the first to create one!</p>
            </div>
          )}
        </div>
      </div>

      <CreateClubModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateSuccess={handleCreateClubSuccess}
      />
    </MainLayout>
  );
};

export default ClubsListing;
