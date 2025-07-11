import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [shows, setShows] = useState([]);
  const [recommendationShows, setRecommendationShows] = useState([]);
  const [favouriteMovies, setFavouriteMovie] = useState([]);

  const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

  const { user } = useUser();
  const { getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const fetchIsAdmin = async () => {
    try {
      const { data } = await axios.get("/api/admin/is-admin", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      // console.log(data, isAdmin);
      setIsAdmin(data.isAdmin);
      // console.log(data, isAdmin);
      if (!data.isAdmin && location.pathname.startsWith("/admin")) {
        toast.error("You're not authorized to access admin dashboard yahh");
      }
    } catch (error) {
      console.error(error);
    }
  };
  const fetchShows = async () => {
    try {
      const { data } = await axios.get("/api/show/all");
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
      if (!user) return;
      const token = await getToken();
      const { data } = await axios.get("/api/recommendation/personalized", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log(data);
      if (data.success) setRecommendationShows(data.recommended);
    } catch (error) {
      setRecommendationShows([]);
      console.error(error);
    }
  };
  const fetchFavouriteMovies = async () => {
    try {
      const { data } = await axios.get("/api/user/favourites", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      // console.log("in app", data.movie);
      if (data.movies > 0) {
        setFavouriteMovie([]);
      } else if (data.success) {
        setFavouriteMovie(data.movie);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchShows();
    fetchRecommendations();
  }, []);

  useEffect(() => {
    if (user) {
      fetchIsAdmin();
      fetchFavouriteMovies();
    }
  }, [user]);

  const value = {
    axios,
    fetchIsAdmin,
    user,
    getToken,
    navigate,
    isAdmin,
    shows,
    favouriteMovies,
    fetchFavouriteMovies,
    image_base_url,
    fetchRecommendations,
    recommendationShows,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
