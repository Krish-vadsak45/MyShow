import React, { useState, useRef } from "react";
import { Download } from "lucide-react";
import MovieTicketUi from "./MovieTicketUi";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

const MovieTicket = ({ booking }) => {
  const [showTicket, setShowTicket] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const ticketRef = useRef();

  const downloadPdf = async () => {
    const node = ticketRef.current;
    if (!node) return;
    try {
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
      const img = new window.Image();
      img.src = dataUrl;
      img.onload = () => {
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [img.width, img.height],
        });
        pdf.addImage(dataUrl, "PNG", 0, 0, img.width, img.height);
        pdf.save(
          `MyShows-Ticket-${booking.show.movie.title.replace(/\s+/g, "-")}.pdf`
        );
      };
    } catch (err) {
      console.error("Failed to generate PDF", err);
    }
  };

  const viewTicket = (booking) => {
    setSelectedBooking(booking);
    setShowTicket(true);
  };

  if (showTicket && selectedBooking) {
    return (
      <div>
        <button
          onClick={() => setShowTicket(false)}
          className="fixed top-4 left-4 z-50 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-white/30 transition-all"
        >
          ← Back to Bookings
        </button>
        <MovieTicketUi booking={selectedBooking} />
      </div>
    );
  }

  return (
    <main className="mt-3">
      <div key={booking._id} className=" transition-all duration-300">
        <div className="flex items-center justify-between">
          {/* Booking Info & Actions */}
          <div className="text-right">
            {/* Hidden ticket for PDF */}
            <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
              <div ref={ticketRef}>
                <MovieTicketUi booking={booking} />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => viewTicket(booking)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 text-sm cursor-pointer"
              >
                View Ticket
              </button>
              <button
                onClick={downloadPdf}
                className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-4 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 text-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Print Ticket</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MovieTicket;
