// frontend/src/components/dashboard/EventCard.js
import React from "react";
import { format } from "date-fns";
import "./EventCard.css";

const EventCard = ({ event, showDetails, onViewDetails, onJoinEvent }) => {
  const eventDate = new Date(event.date);

  return (
    <div className={`event-card card ${showDetails ? "detailed" : ""}`}>
      <div className="event-date">
        <div className="date-day">{format(eventDate, "dd")}</div>
        <div className="date-month">{format(eventDate, "MMM")}</div>
      </div>

      <div className="event-content">
        <h4 className="event-title">{event.title}</h4>
        <p className="event-club">
          <span className="material-icons">group</span>
          {event.club_name}
        </p>
        <p className="event-time">
          <span className="material-icons">schedule</span>
          {format(eventDate, "Pp")}
        </p>

        {showDetails && (
          <>
            <p className="event-description">{event.description}</p>
          </>
        )}
      </div>

      {showDetails && (
        <div className="event-actions">
          <button
            className="action-btn btn"
            onClick={() => onViewDetails(event.id)}
          >
            <span className="material-icons">visibility</span>
            View
          </button>
          <button
            className="action-btn btn-primary"
            onClick={() => onJoinEvent(event.id)}
          >
            <span className="material-icons">person_add</span>
            Join
          </button>
        </div>
      )}
    </div>
  );
};

export default EventCard;
