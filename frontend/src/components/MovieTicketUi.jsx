import { dateFormat2 } from "@/lib/dateFormat";
import IsoTimeFormat from "@/lib/IsoTimeFormat";
import timeFormat from "@/lib/timeFormat";
import React from "react";

const MovieTicketUI = ({ booking }) => {
  return (
    <div className="min-h-screen scale-80 bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-800 p-8 flex items-center justify-center">
      <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden max-w-2xl w-full">
        {/* Decorative circles on sides */}
        <div className="absolute top-1/2 -left-4 w-8 h-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-800 rounded-full transform -translate-y-1/2"></div>
        <div className="absolute top-1/2 -right-4 w-8 h-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-800 rounded-full transform -translate-y-1/2"></div>

        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white p-8 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-32 h-32 border border-white/20 rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-24 h-24 border border-white/20 rounded-full"></div>
          </div>

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                  <img src="/favicone.png" alt="favicon" />
                </div>
                <span className="text-2xl font-bold tracking-wide">
                  MyShows
                </span>
              </div>
            </div>

            {/* Movie Title */}
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {booking.show.movie.title}
              </h1>
              <p className="text-gray-300 text-lg">
                {timeFormat(booking.show.movie.runtime)}
              </p>
            </div>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-8 bg-white">
          {/* Booking Details Grid */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">
                Date
              </div>
              <div className="text-xl font-bold text-gray-800">
                {dateFormat2(booking.show.showDateTime)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">
                Show Time
              </div>
              <div className="text-xl font-bold text-gray-800">
                {IsoTimeFormat(booking.show.showDateTime)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">
                Total Tickets
              </div>
              <div className="text-xl font-bold text-gray-800">
                {booking.bookedSeats.length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">
                Booking ID
              </div>
              <div className="text-xl font-bold text-gray-800">
                #{booking._id}
              </div>
            </div>
          </div>

          {/* Seats Section */}
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white text-center mb-8 shadow-lg">
            <div className="text-sm opacity-90 mb-2 font-medium">
              Seat Numbers
            </div>
            <div className="text-2xl font-bold tracking-wider">
              {booking.bookedSeats.join(", ")}
            </div>
          </div>

          {/* Dashed Separator */}
          <div className="border-t-2 border-dashed border-gray-300 my-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white px-4">
              <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-full"></div>
            </div>
          </div>

          {/* Price Section */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white text-center shadow-lg">
            <div className="text-sm opacity-90 mb-2 font-medium">
              Total Amount
            </div>
            <div className="text-4xl font-bold">₹{booking.amount}</div>
          </div>
        </div>

        {/* Ticket Footer */}
        <div className="bg-gray-50 px-8 py-6 text-center border-t">
          <p className="text-gray-600 text-sm mb-2 font-medium">
            Thank you for choosing MyShows! Present this ticket at the venue.
          </p>
          <p className="text-gray-500 text-xs">
            Generated on {new Date().toLocaleString()}
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-8 right-8 w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
        <div className="absolute top-12 right-12 w-1 h-1 bg-cyan-400 rounded-full opacity-40"></div>
        <div className="absolute bottom-8 left-8 w-2 h-2 bg-pink-400 rounded-full opacity-60"></div>
        <div className="absolute bottom-12 left-12 w-1 h-1 bg-rose-400 rounded-full opacity-40"></div>
      </div>
    </div>
  );
};

export default MovieTicketUI;
