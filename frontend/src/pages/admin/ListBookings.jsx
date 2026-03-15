import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext.jsx";
import { Calendar, User, MapPin, DollarSign, Ticket } from "lucide-react";

const ListBookings = () => {
  const { axios, user } = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllBookings = async () => {
    try {
      const { data } = await axios.get("/api/admin/all-bookings");
      setBookings(data.bookings);
      // console.log(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
    // setBookings(dummyBookingData);
  };

  useEffect(() => {
    if (user) {
      getAllBookings();
    }
  }, [user]);

  return !loading ? (
    <>
      <Title text1="List" text2="Bookings" />
      {/* Deckstop view */}
      <div className="max-w-4x1 hidden md:block mt-6 overflow-x-auto">
        <table
          className="w-full border-collapse rounded-md overflow-hidden
text-nowrap"
        >
          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-2 font-medium pl-5">User Name</th>
              <th className="p-2 font-medium">Movie Name</th>
              <th className="p-2 font-medium">Show Time</th>
              <th className="p-2 font-medium">Seats</th>
              <th className="p-2 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm font-light">
            {bookings.map((item, index) => (
              <tr
                key={index}
                className="border-b border-primary/20
            bg-primary/5 even:bg-primary/10"
              >
                <td className="p-2 min-w-45 pl-5">{item.user.name}</td>
                <td className="p-2">{item.show.movie.title}</td>
                <td className="p-2">{dateFormat(item.show.showDateTime)}</td>
                <td className="p-2">
                  {Object.keys(item.bookedSeats)
                    .map((seat) => item.bookedSeats[seat])
                    .join(", ")}
                </td>
                <td className="p-2">
                  {currency} {item.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile view */}
      <div className="min-h-screen md:hidden text-white">
        {/* Main Content */}
        <div className="p-4 lg:p-6">
          {/* Bookings List - Mobile Cards */}
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
              >
                {/* Header with User and Amount */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-200">
                      {booking.user.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">
                      {currency} {booking.amount}
                    </p>
                  </div>
                </div>

                {/* Movie Name */}
                <div className="mb-3">
                  <h3 className="font-semibold text-lg text-white leading-tight">
                    {booking.show.movie.title}
                  </h3>
                </div>

                {/* Booking Details Grid */}
                <div className="grid grid-cols-1 gap-3">
                  {/* Show Time */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600/20 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">
                        Show Time
                      </p>
                      <p className="text-sm font-medium text-gray-200">
                        {dateFormat(booking.show.showDateTime)}
                      </p>
                    </div>
                  </div>

                  {/* Seats */}
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-orange-600/20 rounded-lg">
                      <MapPin className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">
                        Seats
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.keys(booking.bookedSeats).map((seat, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-700 text-gray-200 text-xs rounded-md font-mono"
                          >
                            {booking.bookedSeats[seat]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {bookings.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-500">Try adjusting your search terms</p>
            </div>
          )}

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Total Bookings
                  </p>
                  <p className="text-xl font-bold text-white">
                    {bookings.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Total Revenue
                  </p>
                  <p className="text-xl font-bold text-green-400">
                    {currency +
                      bookings.reduce(
                        (sum, booking) => sum + booking.amount,
                        0
                      )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  ) : (
    <Loading />
  );
};

export default ListBookings;
