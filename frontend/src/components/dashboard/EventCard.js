// frontend/src/components/dashboard/EventCard.js
import React from "react";
import { format } from "date-fns";
import "./EventCard.css";

const EventCard = ({ event, showDetails, onViewDetails, onJoinEvent }) => {
  const eventDate = new Date(event.date);

  return (
    <div className="event-card-wrapper card">
      <div className="event-card-header">
        <div className="event-date">
          <div className="date-month">{format(eventDate, "MMM")}</div>
          <div className="date-day">{format(eventDate, "dd")}</div>
        </div>
        <div className="event-info">
          <h4 className="event-title">{event.title}</h4>
          <p className="event-club">
            <span className="material-icons">group</span>
            {event.club_name}
          </p>
        </div>
      </div>

      <div className="event-card-body">
        {showDetails && (
          <p className="event-description">{event.description}</p>
        )}
      </div>

      <div className="event-card-footer">
        <p className="event-time">
          <span className="material-icons">schedule</span>
          {format(eventDate, "p")}
        </p>
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
    </div>
  );
};

export default EventCard;
