import { createContext, useContext, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Global axios config — cookies sent on every request, no manual headers needed
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.DEV
  ? ""
  : import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [shows, setShows] = useState([]);
  const [recommendationShows, setRecommendationShows] = useState([]);
  const [favouriteMovies, setFavouriteMovies] = useState([]);
  // user is only set AFTER the session cookie is established
  const [user, setUser] = useState(null);

  const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

  const { user: clerkUser, isLoaded } = useUser();
  const { getToken, isSignedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Establish / refresh the __session HTTP-only cookie
  const syncSessionCookie = async () => {
    const token = await getToken();
    if (!token) return false;
    await axios.post("/api/auth/session", { token });
    return true;
  };

  // On sign-in: set cookie first, then expose user to the rest of the app
  // On sign-out: clear cookie and reset state
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !clerkUser) {
      if (user) {
        setUser(null);
        setIsAdmin(null);
        axios.post("/api/auth/logout").catch(() => {});
      }
      return;
    }

    const establishSession = async () => {
      try {
        const ok = await syncSessionCookie();
        if (ok) {
          // Set user only AFTER cookie is confirmed set
          setUser(clerkUser);
        }
      } catch (err) {
        console.error("Session sync failed", err);
      }
    };

    establishSession();
  }, [isLoaded, isSignedIn, clerkUser]);

  // Keep the cookie fresh — Clerk JWTs expire in 60 s
  useEffect(() => {
    if (!isSignedIn) return;
    const interval = setInterval(() => {
      syncSessionCookie().catch(() => {});
    }, 50 * 1000);
    return () => clearInterval(interval);
  }, [isSignedIn]);

  const fetchIsAdmin = async () => {
    try {
      const { data } = await axios.get("/api/admin/is-admin");
      setIsAdmin(data.isAdmin);
      if (!data.isAdmin && location.pathname.startsWith("/admin")) {
        toast.error("You're not authorized to access admin dashboard");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchShows = async () => {
    try {
      const { data } = await axios.get("/api/show/all?limit=4&page=1");
      if (data.success) {
        setShows(data.shows);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const { data } = await axios.get("/api/recommendation/personalized");
      if (data.success) setRecommendationShows(data.recommended);
    } catch (error) {
      setRecommendationShows([]);
      console.error(error);
    }
  };

  const fetchFavouriteMovies = async () => {
    try {
      const { data } = await axios.get("/api/user/favourites");
      if (data.success) {
        setFavouriteMovies(data.movie); // Use the corrected setter name
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Always fetch public shows on mount
  useEffect(() => {
    fetchShows();
  }, []);

  // Auth-gated calls — only after cookie is established (user is set)
  useEffect(() => {
    if (user) {
      fetchIsAdmin();
      fetchRecommendations();
      fetchFavouriteMovies();
    } else {
      setRecommendationShows([]); // Clear when logged out
    }
  }, [user]);

  const value = useMemo(
    () => ({
      axios,
      fetchIsAdmin,
      user,
      navigate,
      isAdmin,
      shows,
      favouriteMovies,
      fetchFavouriteMovies,
      image_base_url,
      fetchRecommendations,
      recommendationShows,
    }),
    [user, isAdmin, shows, favouriteMovies, recommendationShows],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
