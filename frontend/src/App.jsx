import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetail from "./pages/MovieDetail";
import SeatLayout from "./pages/SeatLayout";
import MyBookings from "./pages/MyBookings";
import Favourite from "./pages/Favourite";
import Footer from "./components/Footer";
import Layout from "./pages/admin/Layout";
import Dashboard from "./pages/admin/Dashboard";
import AddShows from "./pages/admin/AddShows";
import ListShows from "./pages/admin/ListShows";
import ListBookings from "./pages/admin/ListBookings";
import { useAppContext } from "./context/AppContext";
import { SignIn } from "@clerk/clerk-react";
import Loading from "./components/Loading";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AboutUs from "./pages/AboutUs";
import ChatBox from "./components/ChatBox";
import ToastLimiter from "./components/ToastLimiter";
import Upcoming from "./pages/Upcoming";
import ListNotifyMovies from "./pages/admin/ListNotifyMovies";
import NotFound from "./components/NotFound";

function App() {
  const isAdminRoute = useLocation().pathname.startsWith("/admin");
  const { user } = useAppContext();

  return (
    <>
      <ToastLimiter limit={4} position="top-center" />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
        <Route path="/movies/:id/:date" element={<SeatLayout />} />
        <Route path="/upcoming" element={<Upcoming />} />
        <Route path="/mybookings" element={<MyBookings />} />
        <Route path="/loading/:nextUrl" element={<Loading />} />
        <Route path="/favourite" element={<Favourite />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route
          path="/admin/*"
          element={
            user ? (
              <Layout />
            ) : (
              <div className="min-h-screen flex justify-center items-center">
                <SignIn fallbackRedirectUrl={"/admin"} />
              </div>
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="addshows" element={<AddShows />} />
          <Route path="listshows" element={<ListShows />} />
          <Route path="listbookings" element={<ListBookings />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="notify-movies" element={<ListNotifyMovies />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      {user && !isAdminRoute && <ChatBox />}
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;
