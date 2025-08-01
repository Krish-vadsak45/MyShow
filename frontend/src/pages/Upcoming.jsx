import { useEffect, useState } from "react";
import {
  Clock,
  Star,
  Film,
  Sparkles,
  TrendingUp,
  Eye,
  ArrowRight,
  Crown,
  Target,
} from "lucide-react";
import axios from "axios";
import UpcomingMovieCard from "@/components/UpcomingMovieCard";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import BlurCircle from "@/components/BlurCircle";

const Upcoming = () => {
  const [movies, setMovies] = useState([]);
  const [notify, setNotify] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { getToken, user } = useAppContext();

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    const getnotify = async () => {
      await axios.get("/api/upcoming").then((res) => {
        setMovies(res.data);
        // console.log(res.data);
      });
      if (user) {
        const res = await axios.get("/api/upcoming/user/notified", {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        });
        // console.log(res);
        const notifiedMap = {};
        res.data.notified.forEach((id) => {
          notifiedMap[id] = true;
        });
        setNotify(notifiedMap);
      }
      setLoading(false);
    };
    getnotify();
  }, [user]);

  const handleNotify = async (tmdbId) => {
    console.log("Notify clicked for TMDB ID:", tmdbId);
    if (!user) {
      toast.error("please login first");
      return false;
    }
    // Simulate API call
    // console.log("clicked");
    const res = await axios.post(
      "/api/upcoming/notify",
      { tmdbId },
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      }
    );
    // console.log(res);
    setNotify((n) => ({ ...n, [tmdbId]: res.data.notify }));
    return true;
  };

  const filteredMovies = movies.filter((movie) => {
    if (filter === "all") return true;
    // if (filter === "popular") return movie.popularity > 100;
    // if (filter === "highly-rated") return movie.voteAverage > 8;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen  text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading upcoming movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <BlurCircle top="10%" left="-10%" />
        <BlurCircle bottom="10%" right="-10%" />

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-8 group">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl scale-150 group-hover:scale-175 transition-transform duration-500"></div>
              <div className="relative bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-2xl">
                <Clock className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold ml-6 bg-gradient-to-r from-white via-gray-200 to-red-400 bg-clip-text text-transparent">
              Coming Soon
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
            Get ready for the most anticipated movies of the year. Set
            notifications and be the first to book your tickets when they become
            available.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {["Early Access", "Exclusive Previews", "Best Seats"].map(
              (feature, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-900/50 backdrop-blur-sm rounded-full px-6 py-3 border border-gray-800 hover:border-red-500/50 transition-colors duration-300"
                >
                  <Sparkles className="w-4 h-4 text-red-400 mr-2" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-800">
              <div className="flex space-x-2">
                {[
                  { key: "all", label: "All Movies", icon: Film },
                  { key: "popular", label: "Popular", icon: TrendingUp },
                  { key: "highly-rated", label: "Highly Rated", icon: Star },
                ].map((filterOption) => {
                  const IconComponent = filterOption.icon;
                  return (
                    <button
                      key={filterOption.key}
                      onClick={() => setFilter(filterOption.key)}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center ${
                        filter === filterOption.key
                          ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                          : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                      }`}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {filterOption.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Movies Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 relative">
        <BlurCircle top="50%" left="10%" />
        <BlurCircle bottom="20%" right="5%" />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredMovies.map((movie) => (
              <UpcomingMovieCard
                key={movie.tmdbId}
                movie={movie}
                notify={notify}
                onNotify={handleNotify}
              />
            ))}
          </div>

          {filteredMovies.length === 0 && (
            <div className="text-center py-20">
              <Eye className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-400 mb-2">
                No movies found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filter or check back later for new releases.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <BlurCircle bottom="10%" left="20%" />

        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-3xl p-12 border border-gray-800">
            <Crown className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Never Miss a Release
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Join thousands of movie enthusiasts who get early access to
              tickets and exclusive previews.
            </p>
            <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center mx-auto">
              <Target className="w-5 h-5 mr-2" />
              Set All Notifications
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Upcoming;
