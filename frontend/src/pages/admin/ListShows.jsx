import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext.jsx";
import { Calendar, Users, DollarSign } from "lucide-react";

const ListShows = () => {
  const { axios, getToken, user } = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY;

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllShows = async () => {
    try {
      const { data } = await axios.get("/api/admin/all-shows", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      setShows(data.shows);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      getAllShows();
    }
  }, [user]);

  return !loading ? (
    <>
      <Title text1="List" text2="Shows" />
      {/* Deckstop view */}
      <div className="hidden md:block max-w-4x1 mt-6 overflow-x-auto">
        <table
          className="w-full border-collapse rounded-md overflow-hidden
text-nowrap"
        >
          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-2 font-medium pl-5">Movie Name</th>
              <th className="p-2 font-medium">Show Time</th>
              <th className="p-2 font-medium">Total Bookings</th>
              <th className="p-2 font-medium">Earnings</th>
            </tr>
          </thead>
          <tbody className="text-sm font-light">
            {shows.map((show, index) => (
              <tr
                key={index}
                className="border-b border-primary/10
          bg-primary/5 even:bg-primary/10"
              >
                <td className="p-2 min-w-45 pl-5">{show.movie.title}</td>
                <td className="p-2">{dateFormat(show.showDateTime)}</td>
                <td className="p-2">
                  {Object.keys(show.occupiedSeats).length}
                </td>
                <td className="p-2">
                  {currency}{" "}
                  {Object.keys(show.occupiedSeats).length * show.showPrice}
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
          {/* Shows List - Mobile Cards */}
          <div className="space-y-4">
            {shows.map((show) => (
              <div
                key={show._id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
              >
                {/* Movie Name */}
                <div className="mb-3">
                  <h3 className="font-semibold text-lg text-white leading-tight">
                    {show.movie.title}
                  </h3>
                </div>

                {/* Show Details Grid */}
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
                        {dateFormat(show.showDateTime)}
                      </p>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Total Bookings */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-600/20 rounded-lg">
                        <Users className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                          Total Bookings
                        </p>
                        <p className="text-lg font-bold text-white">
                          {Object.keys(show.occupiedSeats).length}
                        </p>
                      </div>
                    </div>

                    {/* Earnings */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-yellow-600/20 rounded-lg">
                        <DollarSign className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                          Earnings
                        </p>
                        <p className="text-lg font-bold text-green-400">
                          {currency}{" "}
                          {Object.keys(show.occupiedSeats).length *
                            show.showPrice}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  ) : (
    <Loading />
  );
};

export default ListShows;
