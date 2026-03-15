import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Search,
  Filter,
  CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import MovieCard from "./MovieCard";
import { MovieCardSkeleton } from "./skeletons";

const allGenres = [
  "Action",
  "Adventure",
  "Horror",
  "Comedy",
  "Mystery",
  "Thriller",
  "Fantasy",
  "Family",
  "Drama",
  "History",
  "Sci-Fi",
  "Crime",
];

const languageMap = {
  English: "en",
  Japanese: "ja",
  Korean: "ko",
  Spanish: "es",
  French: "fr",
  German: "de",
};

const reverseLanguageMap = Object.fromEntries(
  Object.entries(languageMap).map(([k, v]) => [v, k]),
);

const LIMIT = 16;

const MovieFilter = () => {
  const { axios } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [totalMovies, setTotalMovies] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Local state for search input (debounced into URL)
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("search") || "",
  );

  // Derive all filter state from URL params
  const selectedGenres = searchParams.get("genres")
    ? searchParams.get("genres").split(",")
    : [];
  const selectedLanguageCodes = searchParams.get("languages")
    ? searchParams.get("languages").split(",")
    : [];
  const selectedLanguages = selectedLanguageCodes
    .map((code) => reverseLanguageMap[code])
    .filter(Boolean);
  const dateFrom = searchParams.get("dateFrom")
    ? new Date(searchParams.get("dateFrom"))
    : undefined;
  const dateTo = searchParams.get("dateTo")
    ? new Date(searchParams.get("dateTo"))
    : undefined;
  const currentPage = parseInt(searchParams.get("page") || "1");

  // Debounce search input → URL param
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (searchInput) {
          next.set("search", searchInput);
        } else {
          next.delete("search");
        }
        next.set("page", "1");
        return next;
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch movies whenever URL params change
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", currentPage);
        params.set("limit", LIMIT);

        const search = searchParams.get("search");
        if (search) params.set("search", search);

        if (selectedGenres.length)
          params.set("genres", selectedGenres.join(","));
        if (selectedLanguageCodes.length)
          params.set("languages", selectedLanguageCodes.join(","));
        if (dateFrom)
          params.set("dateFrom", dateFrom.toISOString().split("T")[0]);
        if (dateTo) params.set("dateTo", dateTo.toISOString().split("T")[0]);

        const { data } = await axios.get(`/api/show/all?${params.toString()}`);
        if (data.success) {
          setMovies(data.shows);
          setTotalMovies(data.totalMovies);
          setTotalPages(data.totalPages);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [searchParams]);

  const updateFilterParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      next.set("page", "1");
      return next;
    });
  };

  const setPage = (page) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", page.toString());
      return next;
    });
  };

  const handleGenreChange = (genre, checked) => {
    const next = checked
      ? [...selectedGenres, genre]
      : selectedGenres.filter((g) => g !== genre);
    updateFilterParam("genres", next.join(","));
  };

  const handleLanguageChange = (language, checked) => {
    const code = languageMap[language];
    const next = checked
      ? [...selectedLanguageCodes, code]
      : selectedLanguageCodes.filter((c) => c !== code);
    updateFilterParam("languages", next.join(","));
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const activeFiltersCount =
    selectedGenres.length +
    selectedLanguages.length +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  return (
    <div className="flex justify-end">
      <div className="container mx-auto py-8">
        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Now Showing</h1>

            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search movies..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
            />
          </div>

          {/* Filter Controls */}
          <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
            <div className="flex flex-wrap gap-4 items-center">
              {/* Genre Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white cursor-pointer"
                  >
                    Genre{" "}
                    {selectedGenres.length > 0 && `(${selectedGenres.length})`}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 bg-gray-800 border-gray-700">
                  <div className="space-y-2">
                    <h4 className="font-medium text-white mb-3">
                      Select Genres
                    </h4>
                    {allGenres.map((genre) => (
                      <div key={genre} className="flex items-center space-x-2">
                        <Checkbox
                          id={`genre-${genre}`}
                          checked={selectedGenres.includes(genre)}
                          onCheckedChange={(checked) =>
                            handleGenreChange(genre, checked)
                          }
                        />
                        <Label
                          htmlFor={`genre-${genre}`}
                          className="text-gray-300 text-sm"
                        >
                          {genre}
                        </Label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Language Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white cursor-pointer"
                  >
                    Language{" "}
                    {selectedLanguages.length > 0 &&
                      `(${selectedLanguages.length})`}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 bg-gray-800 border-gray-700">
                  <div className="space-y-2">
                    <h4 className="font-medium text-white mb-3">
                      Select Languages
                    </h4>
                    {Object.keys(languageMap).map((language) => (
                      <div
                        key={language}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`language-${language}`}
                          checked={selectedLanguages.includes(language)}
                          onCheckedChange={(checked) =>
                            handleLanguageChange(language, checked)
                          }
                        />
                        <Label
                          htmlFor={`language-${language}`}
                          className="text-gray-300 text-sm"
                        >
                          {language}
                        </Label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Date From Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white cursor-pointer"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {dateFrom ? format(dateFrom, "MMM dd, yyyy") : "From Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={(date) =>
                      updateFilterParam(
                        "dateFrom",
                        date ? date.toISOString().split("T")[0] : "",
                      )
                    }
                    initialFocus
                    className="bg-gray-800 text-white"
                  />
                </PopoverContent>
              </Popover>

              {/* Date To Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white cursor-pointer"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {dateTo ? format(dateTo, "MMM dd, yyyy") : "To Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={(date) =>
                      updateFilterParam(
                        "dateTo",
                        date ? date.toISOString().split("T")[0] : "",
                      )
                    }
                    initialFocus
                    className="bg-gray-800 text-white"
                  />
                </PopoverContent>
              </Popover>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  onClick={clearAllFilters}
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10 cursor-pointer"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
            {(selectedGenres.length > 0 || selectedLanguages.length > 0) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedGenres.map((genre) => (
                  <Badge
                    key={genre}
                    variant="secondary"
                    className="bg-blue-600/20 text-blue-300 border-blue-600/30"
                    style={{ pointerEvents: "auto" }}
                  >
                    {genre}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      style={{ pointerEvents: "auto" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenreChange(genre, false);
                      }}
                    />
                  </Badge>
                ))}
                {selectedLanguages.map((language) => (
                  <Badge
                    key={language}
                    variant="secondary"
                    style={{ pointerEvents: "auto" }}
                    className="bg-green-600/20 text-green-300 border-green-600/30"
                  >
                    {language}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      style={{ pointerEvents: "auto" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLanguageChange(language, false);
                      }}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {movies.length} of {totalMovies} movies
          </p>
        </div>

        {/* Movie Grid */}
        {loading ? (
          <div className="flex flex-col items-center md:flex-row flex-wrap gap-8">
            {[...Array(8)].map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : movies.length > 0 ? (
          <>
            <div className="flex flex-col items-center md:flex-row flex-wrap gap-8">
              {movies.map((movie) => (
                <MovieCard movie={movie} key={movie._id} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <Button
                  variant="outline"
                  className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 disabled:opacity-50 cursor-pointer"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                <span className="text-gray-400 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 disabled:opacity-50 cursor-pointer"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No movies found</div>
            <p className="text-gray-500 mb-6">
              Try adjusting your filters or search terms
            </p>
            <Button
              onClick={clearAllFilters}
              variant="outline"
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white cursor-pointer"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieFilter;
