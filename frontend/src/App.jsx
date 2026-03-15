import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { SignIn } from "@clerk/clerk-react";
import { useAppContext } from "./context/AppContext";

// Always-loaded (used on every render — keep in main bundle)
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ToastLimiter from "./components/ToastLimiter";
import Loading from "./components/Loading";

// Per-route skeletons (tiny, always in main bundle)
import {
  HomeSkeleton,
  MoviesSkeleton,
  MovieDetailSkeleton,
  SeatLayoutSkeleton,
  MyBookingsSkeleton,
  FavouriteSkeleton,
  UpcomingSkeleton,
  AboutUsSkeleton,
} from "./components/skeletons";

// Lazy-loaded pages
const Home        = lazy(() => import("./pages/Home"));
const Movies      = lazy(() => import("./pages/Movies"));
const MovieDetail = lazy(() => import("./pages/MovieDetail"));
const SeatLayout  = lazy(() => import("./pages/SeatLayout"));
const MyBookings  = lazy(() => import("./pages/MyBookings"));
const Favourite   = lazy(() => import("./pages/Favourite"));
const AboutUs     = lazy(() => import("./pages/AboutUs"));
const Upcoming    = lazy(() => import("./pages/Upcoming"));
const NotFound    = lazy(() => import("./components/NotFound"));

// Lazy-loaded admin pages (skeleton lives inside Layout's Outlet)
const Layout           = lazy(() => import("./pages/admin/Layout"));
const Dashboard        = lazy(() => import("./pages/admin/Dashboard"));
const AddShows         = lazy(() => import("./pages/admin/AddShows"));
const ListShows        = lazy(() => import("./pages/admin/ListShows"));
const ListBookings     = lazy(() => import("./pages/admin/ListBookings"));
const AdminAnalytics   = lazy(() => import("./pages/admin/AdminAnalytics"));
const ListNotifyMovies = lazy(() => import("./pages/admin/ListNotifyMovies"));

// Lazy-loaded heavy components
const ChatBox = lazy(() => import("./components/ChatBox"));

// Helper: wraps a page element in its own Suspense boundary
const withSkeleton = (element, skeleton) => (
  <Suspense fallback={skeleton}>{element}</Suspense>
);

function App() {
  const isAdminRoute = useLocation().pathname.startsWith("/admin");
  const { user } = useAppContext();

  return (
    <>
      <ToastLimiter limit={4} position="top-center" />
      {!isAdminRoute && <Navbar />}

      <Routes>
        <Route path="/"                element={withSkeleton(<Home />,        <HomeSkeleton />)} />
        <Route path="/movies"          element={withSkeleton(<Movies />,      <MoviesSkeleton />)} />
        <Route path="/movies/:id"      element={withSkeleton(<MovieDetail />, <MovieDetailSkeleton />)} />
        <Route path="/movies/:id/:date" element={withSkeleton(<SeatLayout />, <SeatLayoutSkeleton />)} />
        <Route path="/upcoming"        element={withSkeleton(<Upcoming />,    <UpcomingSkeleton />)} />
        <Route path="/mybookings"      element={withSkeleton(<MyBookings />,  <MyBookingsSkeleton />)} />
        <Route path="/favourite"       element={withSkeleton(<Favourite />,   <FavouriteSkeleton />)} />
        <Route path="/aboutus"         element={withSkeleton(<AboutUs />,     <AboutUsSkeleton />)} />
        <Route path="/loading/:nextUrl" element={<Loading />} />

        {/* Admin — Layout wraps its Outlet in its own Suspense (AdminContentSkeleton) */}
        <Route
          path="/admin/*"
          element={
            user
              ? withSkeleton(<Layout />, <Loading />)
              : (
                <div className="min-h-screen flex justify-center items-center">
                  <SignIn fallbackRedirectUrl={"/admin"} />
                </div>
              )
          }
        >
          <Route index                   element={<Dashboard />} />
          <Route path="addshows"         element={<AddShows />} />
          <Route path="listshows"        element={<ListShows />} />
          <Route path="listbookings"     element={<ListBookings />} />
          <Route path="analytics"        element={<AdminAnalytics />} />
          <Route path="notify-movies"    element={<ListNotifyMovies />} />
        </Route>

        <Route path="*" element={withSkeleton(<NotFound />, null)} />
      </Routes>

      {user && !isAdminRoute && (
        <Suspense fallback={null}>
          <ChatBox />
        </Suspense>
      )}
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;
