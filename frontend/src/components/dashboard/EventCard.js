// frontend/src/components/dashboard/EventCard.js
import React from 'react';
import { format } from 'date-fns';
import './EventCard.css';

const EventCard = ({ event }) => {
    const eventDate = new Date(event.date);
    return (
        <div className="event-card card">
            <div className="event-date">
                <div className="date-day">{format(eventDate, 'dd')}</div>
                <div className="date-month">{format(eventDate, 'MMM')}</div>
            </div>
            <div className="event-content">
                <h4 className="event-title">{event.title}</h4>
                <p className="event-club"><span className="material-icons">group</span>{event.club_name}</p>
                <p className="event-time"><span className="material-icons">schedule</span>{format(eventDate, 'Pp')}</p>
            </div>
        </div>
    );
};
export default EventCard;