import React, { useEffect, useState } from "react";
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";
import timeFormat from "../lib/timeFormat";
import { dateFormat } from "../lib/dateFormat";
import { useAppContext } from "../context/AppContext";
import { Link, useNavigate } from "react-router-dom";
import MovieTicket from "../components/MovieTicket";
import NotExist from "../components/NotExist";
import { Calendar } from "lucide-react";
import MovieTicketUi from "../components/MovieTicketUi";

const MyBookings = () => {
  const { axios, user, image_base_url, getToken } = useAppContext();
  const [selectedBooking, setSelectedBooking] = useState(null);

  const currency = import.meta.env.VITE_CURRENCY;
  const [bookings, setBookings] = useState([]);
  const [isloading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const getMyBookings = async () => {
    try {
      const { data } = await axios.get("/api/user/bookings", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      if (data.success) {
        console.log(data.bookings);
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };
  useEffect(() => {
    if (user) {
      getMyBookings();
    }
  }, [user]);
  const handleViewTicket = (booking) => {
    setSelectedBooking(booking);
  };
  if (selectedBooking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-800">
        <button
          onClick={() => setSelectedBooking(null)}
          className="fixed top-20 left-70 z-50 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-white/30 transition-all cursor-pointer"
        >
          ← Back to Bookings
        </button>
        <MovieTicketUi booking={selectedBooking} />
      </div>
    );
  }

  if (!isloading && bookings.length === 0) {
    return (
      <NotExist
        title="No Bookings Yet"
        message="You haven't made any movie bookings yet. Discover amazing movies and book your seats for an unforgettable cinema experience!"
        buttonLabel="Book Movies"
        redirectPath="/movies"
        icon={Calendar}
      />
    );
  }

  return !isloading && bookings.length !== 0 ? (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <BlurCircle top="100px" left="100px" />
      <div>
        <BlurCircle bottom="0px" left="600px" />
      </div>
      <h1 className="text-lg font-semibold mb-4">My Bookings</h1>

      {bookings.map((item, index) => (
        <div
          key={index}
          className="flex flex-col md:flex-row justify-between
        bg-primary/8 border border-primary/20 mt-4 p-2 rounded-lg max-w-3x1"
        >
          <div className="flex flex-col md:flex-row">
            <img
              src={image_base_url + item.show.movie.poster_path}
              alt=""
              className="md: max-w-45
        aspect-video h-auto object-cover object-bottom rounded"
            />
            <div className="flex flex-col p-4">
              <p className="text-lg font-semibold">{item.show.movie.title}</p>
              <p className="text-gray-400 text-sm">
                {timeFormat(item.show.movie.runtime)}
              </p>
              <p className="text-gray-400 text-sm mt-auto">
                {dateFormat(item.show.showDateTime)}
              </p>
            </div>
          </div>

          <div
            className="flex flex-col md:items-end md:text-right justify-between
p-4"
          >
            <div className="flex items-center gap-4">
              <p className="text-2x1 font-semibold mb-3">
                {currency}
                {item.amount}
              </p>
              {!item.isPaid && (
                <Link
                  to={item.paymentLink}
                  className="bg-primary px-4 py-1.5 mb-3
                              text-sm rounded-full font-medium cursor-pointer"
                >
                  Pay Now
                </Link>
              )}
            </div>
            <div className="text-sm">
              <p>
                <span className="text-gray-400">Total Tickets :</span>{" "}
                {item.bookedSeats.length}
              </p>
              <p>
                <span className="text-gray-400">Seat Number :</span>{" "}
                {item.bookedSeats.join(", ")}
              </p>{" "}
              <div className="flex space-x-2">
                {item.isPaid && (
                  <button
                    onClick={() => handleViewTicket(item)}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 mt-3 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 text-sm cursor-pointer"
                  >
                    View Ticket
                  </button>
                )}
                {item.isPaid && <MovieTicket booking={item} />}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <Loading />
  );
};

export default MyBookings;
