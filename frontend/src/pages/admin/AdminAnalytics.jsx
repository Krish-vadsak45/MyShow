import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { useAppContext } from "../../context/AppContext";
import Loading from "@/components/Loading";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088FE",
  "#00C49F",
];

const AdminAnalytics = () => {
  const { getToken } = useAppContext();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = await getToken();
        const res = await axios.get("/api/admin/analytics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // console.log(res.data);
        setAnalytics(res.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <Loading />;
  if (!analytics || !analytics.success)
    return <div>Failed to load analytics.</div>;

  const {
    salesPerDay,
    topMovies,
    bookingsPerHour,
    ticketsPerMovie,
    totalUsers,
  } = analytics;

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold mb-4">Admin Analytics Dashboard</h2>

      {/* 1. Total Sales Per Day */}
      <div>
        <h3 className="font-semibold mb-2">Total Sales Per Day</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesPerDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalSales"
              stroke="#8884d8"
              name="Total Sales"
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#82ca9d"
              name="Bookings"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 2. Top 5 Most Booked Movies */}
      <div>
        <h3 className="font-semibold mb-2">Top 5 Most Booked Movies</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topMovies}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="movie.title" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="bookings" fill="#8884d8" name="Bookings" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Bookings Per Hour */}
      <div>
        <h3 className="font-semibold mb-2">Bookings Per Hour</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={bookingsPerHour}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="_id"
              label={{
                value: "Hour",
                position: "insideBottomRight",
                offset: 0,
              }}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#82ca9d" name="Bookings" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Tickets Sold Per Movie */}
      <div>
        <h3 className="font-semibold mb-2">Tickets Sold Per Movie</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={ticketsPerMovie}
              dataKey="ticketsSold"
              nameKey="movie.title"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {ticketsPerMovie.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 5. Total Registered Users */}
      <div>
        <h3 className="font-semibold mb-2">Total Registered Users</h3>
        <div className="text-3xl font-bold">{totalUsers}</div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
