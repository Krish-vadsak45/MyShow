import { useState, useMemo } from "react";
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
  Star,
  CalendarIcon,
  ChevronDown,
  X,
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import MovieCard from "./MovieCard";

// Sample movie data
const allGenres = [
  "Action",
  "Adventure",
  "Horror",
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
  // add more as needed
};

const MovieFilter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [dateFrom, setDateFrom] = useState();
  const [dateTo, setDateTo] = useState();
  const [showFilters, setShowFilters] = useState(false);

  const { shows } = useAppContext();

  // Fuzzy search function
  const fuzzySearch = (text, searchTerm) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const textLower = text.toLowerCase();

    // Simple fuzzy matching - checks if all characters in search term exist in order
    let searchIndex = 0;
    for (
      let i = 0;
      i < textLower.length && searchIndex < searchLower.length;
      i++
    ) {
      if (textLower[i] === searchLower[searchIndex]) {
        searchIndex++;
      }
    }
    return searchIndex === searchLower.length;
  };

  // Filter movies based on all criteria
  const filteredMovies = useMemo(() => {
    return shows.filter((movie) => {
      console.log(movie);
      // Fuzzy search on title
      if (!fuzzySearch(movie.title, searchTerm)) return false;

      // Genre filter
      if (
        selectedGenres.length > 0 &&
        !selectedGenres.some((genre) =>
          movie.genres.map((g) => g.name).includes(genre)
        )
      ) {
        return false;
      }

      // Language filter
      if (
        selectedLanguages.length > 0 &&
        !selectedLanguages.some(
          (lang) =>
            languageMap[lang] &&
            languageMap[lang].toLowerCase() ===
              (movie.original_language || "").toLowerCase()
        )
      ) {
        return false;
      }

      // Date range filter
      const movieDate = new Date(movie.release_date);
      if (dateFrom && movieDate < dateFrom) return false;
      if (dateTo && movieDate > dateTo) return false;

      return true;
    });
  }, [searchTerm, selectedGenres, selectedLanguages, dateFrom, dateTo]);

  const handleGenreChange = (genre, checked) => {
    if (checked) {
      setSelectedGenres([...selectedGenres, genre]);
    } else {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    }
  };

  const handleLanguageChange = (language, checked) => {
    // console.log("Removing:", language, checked);
    if (checked) {
      setSelectedLanguages([...selectedLanguages, language]);
    } else {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== language));
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedGenres([]);
    setSelectedLanguages([]);
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const activeFiltersCount =
    selectedGenres.length +
    selectedLanguages.length +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  return (
    <div id="search" className="flex justify-end">
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                    className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  >
                    Genre{" "}
                    {selectedGenres.length > 0 && `(${selectedGenres.length})`}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 bg-gray-800 border-gray-700">
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
                    className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  >
                    Language{" "}
                    {selectedLanguages.length > 0 &&
                      `(${selectedLanguages.length})`}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 bg-gray-800 border-gray-700">
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
                    className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {dateFrom ? format(dateFrom, "MMM dd, yyyy") : "From Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
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
                    className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {dateTo ? format(dateTo, "MMM dd, yyyy") : "To Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
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
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
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
                        console.log("cliked");
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
            Showing {filteredMovies.length} of {shows.length} movies
          </p>
        </div>

        {/* Movie Grid */}
        <div className="flex flex-wrap  gap-8">
          {filteredMovies.map((movie) => (
            <MovieCard movie={movie} key={movie._id} />
          ))}
        </div>

        {/* No Results */}
        {filteredMovies.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No movies found</div>
            <p className="text-gray-500 mb-6">
              Try adjusting your filters or search terms
            </p>
            <Button
              onClick={clearAllFilters}
              variant="outline"
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
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
