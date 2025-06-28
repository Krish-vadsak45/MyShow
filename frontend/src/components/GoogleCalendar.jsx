import React from "react";
import { Calendar } from "lucide-react";
import { dateFormat } from "../lib/dateFormat";

const GoogleCalendar = ({ booking }) => {
  if (!booking) return null;

  // Helper to pad numbers
  const pad = (n) => n.toString().padStart(2, "0");

  // Parse start and end time in UTC format for Google Calendar
  const startDate = new Date(booking.show.showDateTime);
  const endDate = new Date(
    startDate.getTime() + (booking.show.movie.runtime || 120) * 60000
  ); // fallback 120min

  const format = (d) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(
      d.getUTCDate()
    )}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

  const start = format(startDate);
  const end = format(endDate);

  const title = encodeURIComponent(
    `Movie: ${booking.show.movie.title} - Show Booking`
  );
  const details = encodeURIComponent(
    `Your movie booking for ${booking.show.movie.title} at ${dateFormat(
      booking.show.showDateTime
    )}
    .`
  );
  const location = encodeURIComponent("INOX Cinema"); // Change if you have actual cinema name

  const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;

  return (
    <button
      onClick={() => window.open(calendarUrl, "_blank")}
      className="bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white px-4 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 text-sm cursor-pointer"
      type="button"
    >
      {/* <span role="img" aria-label="calendar">
        📆
      </span>
      <span>Add to Google Calendar</span> */}
      <Calendar />
    </button>
  );
};

export default GoogleCalendar;
