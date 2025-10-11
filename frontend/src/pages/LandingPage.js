// frontend/src/pages/LandingPage.js
import React from "react";
import { Link } from "react-router-dom";
import Background from "../components/layout/Background";
import "./LandingPage.css";

const LandingPage = () => {
  // Construct the base URL from the API URL environment variable
  const baseUrl = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace("/api", "")
    : "http://127.0.0.1:8000";
  const googleLoginUrl = `${baseUrl}/accounts/google/login/`;

  return (
    <>
      <Background />
      <div className="landing-page-container">
        <nav className="landing-nav">
          <div className="venti-logo">
            <span className="ven-solid">VEN</span>
            <span className="ti-stroke">TI</span>
          </div>
          <div className="nav-actions">
            <a href={googleLoginUrl} className="btn btn-primary">
              <span className="material-icons">login</span>
              Join Now
            </a>
          </div>
        </nav>

        <main className="hero-section">
          <h1>
            <span className="ven-solid">ven</span>
            <span className="ti-stroke">ti</span>
          </h1>
          <p>
            ONE PLACE <span className="highlight">for</span> clubs, study, and
            collaboration.
          </p>
          <a href={googleLoginUrl} className="btn btn-primary cta-btn">
            Join the Movement
          </a>
        </main>

        <section className="features-grid">
          <div className="card feature-card">
            <span className="material-icons">groups</span>
            <h3>Boost Collaboration</h3>
            <p>
              Our smart system connects you with peers who share your goals.
            </p>
          </div>
          <div className="card feature-card">
            <span className="material-icons">event</span>
            <h3>Discover Connections</h3>
            <p>Join clubs and events tailored to your passions.</p>
          </div>
          <div className="card feature-card">
            <span className="material-icons">school</span>
            <h3>Academic Focus</h3>
            <p>
              Designed specifically for students and academic collaboration.
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default LandingPage;
