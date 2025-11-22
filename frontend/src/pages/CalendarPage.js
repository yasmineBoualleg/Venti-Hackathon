// frontend/src/pages/CalendarPage.js
import React, { useCallback, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

import useApi from "../hooks/useApi";
import { apiClient } from "../api/apiClient";
import MainLayout from "../components/layout/MainLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorDisplay from "../components/common/ErrorDisplay";
import "./CalendarPage.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarPage = () => {
  const getEvents = useCallback(() => apiClient.client.get("/events/"), []);
  const { data: events, loading, error } = useApi(getEvents);

  const formattedEvents = useMemo(() => {
    if (!events) return [];
    return events.map((event) => ({
      title: event.title,
      start: new Date(event.date),
      end: new Date(event.date),
      resource: event, // Store original event data
    }));
  }, [events]);

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
        <ErrorDisplay message={"Failed to load events."} />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="main-content">
        <div className="content-header">
          <h2>
            <span className="material-icons">calendar_today</span> Event
            Calendar
          </h2>
          <p className="subtitle">
            A monthly overview of events from all clubs
          </p>
        </div>
        <div className="calendar-container card">
          <Calendar
            localizer={localizer}
            events={formattedEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "calc(100vh - 220px)" }}
            eventPropGetter={(event) => ({
              className: `event-club-${event.resource.club}`,
            })}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default CalendarPage;
