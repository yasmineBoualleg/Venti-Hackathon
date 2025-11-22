// frontend/src/pages/LandingPage.js
import React from "react";
import "./LandingPage.css";

const LandingPage = () => {
  const baseUrl = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
  const googleLoginUrl = `${baseUrl}/accounts/google/login/`;

  return (
    <div className="landing-page-container">
      <nav className="landing-nav">
        <div className="venti-logo">
          <span className="ven-solid">VEN</span>
          <span className="ti-stroke">TI</span>
        </div>
        <div className="nav-items">
          <a href="#features">Features</a>
          <a href="#why-venti">Why Venti?</a>
        </div>
        <a href={googleLoginUrl} className="btn btn-primary join-now-btn">
          Join Now
        </a>
      </nav>

      <main className="hero-section">
        <h1>
          <span className="ven-solid">VEN</span>
          <span className="ti-stroke">TI</span>
        </h1>
        <p>
          ONE PLACE <span className="highlight">for</span> clubs, study, and
          collaboration.
        </p>
        <a href={googleLoginUrl} className="btn btn-primary cta-btn">
          Join the Movement
        </a>
      </main>

      <section id="features" className="features-grid">
        <div className="card feature-card">
          <span className="material-icons">groups</span>
          <h3>Boost Collaboration</h3>
          <p>Our smart system connects you with peers who share your goals.</p>
        </div>
        <div className="card feature-card">
          <span className="material-icons">event</span>
          <h3>Discover Connections</h3>
          <p>Join clubs and events tailored to your passions.</p>
        </div>
        <div className="card feature-card">
          <span className="material-icons">school</span>
          <h3>Academic Focus</h3>
          <p>Designed specifically for students and academic collaboration.</p>
        </div>
      </section>

      <section id="why-venti" className="why-venti-section">
        <h2>Why Choose Venti?</h2>
        <div className="additional-cards-grid">
          <div className="card additional-card">
            <span className="material-icons">supervisor_account</span>
            <h3>Study Groups</h3>
            <p>Connect with peers for collaborative learning sessions.</p>
          </div>
          <div className="card additional-card">
            <span className="material-icons">event_note</span>
            <h3>Event Calendar</h3>
            <p>Stay updated with club events and academic deadlines.</p>
          </div>
          <div className="card additional-card">
            <span className="material-icons">folder_shared</span>
            <h3>File Sharing</h3>
            <p>Share resources and collaborate on projects seamlessly.</p>
          </div>
          <div className="card additional-card">
            <span className="material-icons">chat</span>
            <h3>Real-time Chat</h3>
            <p>Communicate with club members and study partners instantly.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
