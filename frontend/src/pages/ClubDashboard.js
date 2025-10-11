// frontend/src/pages/ClubDashboard.js
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import useApi from "../hooks/useApi";
import { apiClient } from "../api/apiClient";
import { format } from "date-fns";

import MainLayout from "../components/layout/MainLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorDisplay from "../components/common/ErrorDisplay";
import "./ClubDashboard.css";

// Members Tab Component
const MembersTab = ({ members }) => (
  <div className="members-list">
    {members.map((member) => (
      <div key={member.username} className="member-item card">
        <div className="member-avatar">
          {member.username.charAt(0).toUpperCase()}
        </div>
        <div className="member-details">
          <span className="member-name">@{member.username}</span>
          <span className="member-joined">
            Joined:{" "}
            {format(new Date(member.date_joined || new Date()), "MMM yyyy")}
          </span>
        </div>
        {member.is_admin && <span className="admin-badge">Admin</span>}
      </div>
    ))}
  </div>
);

// Join Requests Tab Component
const RequestsTab = ({ clubId, refetchClub }) => {
  const getRequests = useCallback(
    () => apiClient.getClubJoinRequests(clubId),
    [clubId]
  );
  const { data: requests, loading, error, refetch } = useApi(getRequests);

  const handleRequest = async (requestId, action) => {
    try {
      await apiClient.handleJoinRequest(clubId, requestId, action);
      refetch(); // Refetch requests
      refetchClub(); // Refetch club details to update member count
    } catch (err) {
      alert(`Failed to ${action} request.`);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message="Could not load requests." />;

  return (
    <div className="requests-list">
      {requests && requests.length > 0 ? (
        requests.map((req) => (
          <div key={req.id} className="request-item card">
            <span>@{req.user.username}</span>
            <div className="request-actions">
              <button
                className="btn btn-primary"
                onClick={() => handleRequest(req.id, "approve")}
              >
                Approve
              </button>
              <button
                className="btn"
                onClick={() => handleRequest(req.id, "reject")}
              >
                Reject
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No pending join requests.</p>
      )}
    </div>
  );
};

const ClubDashboard = () => {
  const { clubId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatSocketRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const [activeTab, setActiveTab] = useState("overview");

  const getClubDetails = useCallback(
    () => apiClient.getClubDetails(clubId),
    [clubId]
  );
  const {
    data: club,
    loading,
    error,
    refetch: refetchClub,
  } = useApi(getClubDetails);

  const getClubMessages = useCallback(
    () => apiClient.getClubMessages(clubId),
    [clubId]
  );
  const {
    data: initialMessages,
    loading: messagesLoading,
    error: messagesError,
  } = useApi(getClubMessages);

  useEffect(() => {
    if (initialMessages) setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (!club || !user || !club.chat_websocket_url) return;

    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const backendHost = new URL(apiClient.client.defaults.baseURL).host;
    const accessToken = localStorage.getItem("accessToken");
    const socketUrl = `${wsScheme}://${backendHost}${club.chat_websocket_url}?token=${accessToken}`;

    chatSocketRef.current = new WebSocket(socketUrl);
    chatSocketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages((prevMessages) => [...prevMessages, data]);
    };
    chatSocketRef.current.onclose = () => console.error("Chat socket closed");
    chatSocketRef.current.onerror = (err) =>
      console.error("Chat socket error:", err);

    return () => chatSocketRef.current?.close();
  }, [club, user]);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (
      newMessage.trim() &&
      chatSocketRef.current?.readyState === WebSocket.OPEN
    ) {
      chatSocketRef.current.send(JSON.stringify({ message: newMessage }));
      setNewMessage("");
    }
  };

  if (loading || messagesLoading)
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  if (error || messagesError)
    return (
      <MainLayout>
        <ErrorDisplay message={error?.message || messagesError?.message} />
      </MainLayout>
    );
  if (!club) return null;

  const isMember =
    user.is_superuser ||
    club.members.some((member) => member.username === user.username);
  const isAdmin = user.is_superuser || club.admin_username === user.username;

  return (
    <MainLayout>
      <div className="content-header">
        <h2>{club.name}</h2>
        <p className="subtitle">{club.description}</p>
      </div>

      <div className="club-dashboard-grid">
        <div className="club-main-content card">
          <div className="tabs">
            <button
              className={`tab ${activeTab === "info" ? "active" : ""}`}
              onClick={() => setActiveTab("info")}
            >
              Info
            </button>
            <button
              className={`tab ${activeTab === "members" ? "active" : ""}`}
              onClick={() => setActiveTab("members")}
            >
              Members ({club.members_count})
            </button>
            {isAdmin && (
              <button
                className={`tab ${activeTab === "requests" ? "active" : ""}`}
                onClick={() => setActiveTab("requests")}
              >
                Requests
              </button>
            )}
          </div>
          <div className="tab-content">
            {activeTab === "info" && (
              <div className="info-tab">
                <p>
                  <strong>Admin:</strong> @{club.admin_username}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {format(new Date(club.created_at), "PPP")}
                </p>
              </div>
            )}
            {activeTab === "members" && <MembersTab members={club.members} />}
            {activeTab === "requests" && isAdmin && (
              <RequestsTab clubId={clubId} refetchClub={refetchClub} />
            )}
          </div>
        </div>

        <div className="club-chat-panel card">
          <h3>
            <span className="material-icons">chat</span> Club Chat
          </h3>
          {isMember ? (
            <>
              <div className="chat-messages" ref={chatMessagesRef}>
                {messages.map((msg, index) => (
                  <div
                    className={`message-item ${
                      msg.author_username === user.username ? "own-message" : ""
                    }`}
                    key={msg.id || index}
                  >
                    <div className="message-author">@{msg.author_username}</div>
                    <div className="message-text">{msg.content}</div>
                    <div className="message-time">
                      {format(new Date(msg.created_at), "p")}
                    </div>
                  </div>
                ))}
              </div>
              <div className="chat-input-area">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <button className="btn btn-primary" onClick={sendMessage}>
                  <span className="material-icons">send</span>
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <span className="material-icons">lock</span>
              <p>You must be a member to view and participate in the chat.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ClubDashboard;
