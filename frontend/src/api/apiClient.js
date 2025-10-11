// frontend/src/api/apiClient.js

import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { "Content-Type": "application/json" },
    });

    // Request interceptor to add the token to every request
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            try {
              const res = await axios.post(`${API_BASE_URL}/token/refresh/`, {
                refresh: refreshToken,
              });
              const { access } = res.data;
              this.setTokens(access, refreshToken);
              originalRequest.headers["Authorization"] = `Bearer ${access}`;
              return this.client(originalRequest);
            } catch (refreshError) {
              this.logout();
              window.location.href = "/login";
              return Promise.reject(refreshError);
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // --- Auth ---
  async login(username, password) {
    const response = await this.client.post("/token/", { username, password });
    this.setTokens(response.data.access, response.data.refresh);
    return response;
  }

  async loginWithGoogle(googleToken) {
    const response = await this.client.post("/auth/google/", {
      token: googleToken,
    });
    this.setTokens(response.data.access, response.data.refresh);
    return response.data;
  }

  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    // Ensure axios header is cleared on logout
    delete this.client.defaults.headers.common["Authorization"];
  }

  setTokens(access, refresh) {
    localStorage.setItem("accessToken", access);
    if (refresh) {
      localStorage.setItem("refreshToken", refresh);
    }
    // Set the auth header for subsequent requests in this session
    this.client.defaults.headers.common["Authorization"] = `Bearer ${access}`;
  }

  getDecodedToken() {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error("Error decoding token:", error);
      this.logout(); // The token is invalid, so log out
      return null;
    }
  }

  // --- User ---
  getUser(userId) {
    return this.client.get(`/users/${userId}/`);
  }

  // --- Dashboard ---
  getDashboardData() {
    return this.client.get("/dashboard/");
  }

  // --- Clubs ---
  getClubs() {
    return this.client.get("/clubs/");
  }

  getClubDetails(clubId) {
    return this.client.get(`/clubs/${clubId}/`);
  }

  getClubMembers(clubId) {
    return this.client.get(`/clubs/${clubId}/members/`);
  }

  getClubJoinRequests(clubId) {
    return this.client.get(`/clubs/${clubId}/requests/`);
  }

  handleJoinRequest(clubId, requestId, action) {
    // action should be 'approve' or 'reject'
    return this.client.post(
      `/clubs/${clubId}/requests/${requestId}/${action}/`
    );
  }

  joinClub(clubId) {
    return this.client.post(`/clubs/${clubId}/join/`);
  }

  createClub(name, description) {
    return this.client.post("/clubs/", { name, description });
  }

  getClubEvents(clubId) {
    return this.client.get(`/clubs/${clubId}/events/`);
  }

  // --- Messages ---
  getClubMessages(clubId) {
    return this.client.get(`/messages/?club=${clubId}`);
  }
}

export const apiClient = new ApiClient();
