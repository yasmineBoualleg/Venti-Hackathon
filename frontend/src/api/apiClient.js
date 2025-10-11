// frontend/src/api/apiClient.js

import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8080/api";

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { "Content-Type": "application/json" },
    });

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
  }

  // --- Auth ---
  async login(username, password) {
    const response = await this.client.post("/token/", { username, password });
    this.setTokens(response.data.access, response.data.refresh);
    return response;
  }

  async loginWithGoogle(googleToken) {
    const response = await this.client.post("/auth/google/", { token: googleToken });
    this.setTokens(response.data.access, response.data.refresh);
    return response.data;
  }

  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  setTokens(access, refresh) {
    localStorage.setItem("accessToken", access);
    if (refresh) {
      localStorage.setItem("refreshToken", refresh);
    }
  }

  getDecodedToken() {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch (error) {
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

  joinClub(clubId) {
    return this.client.post(`/clubs/${clubId}/join/`);
  }

  createClub(name, description) {
    return this.client.post("/clubs/", { name, description });
  }

  // --- Messages ---
  getClubMessages(clubId) {
    return this.client.get(`/messages/?club=${clubId}`);
  }
}

export const apiClient = new ApiClient();
