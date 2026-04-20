import React, {
  useState,
  memo,
  Suspense,
  lazy,
  useEffect,
  useRef,
} from "react";
import { dummyTrailers } from "../assets/assets";
import BlurCircle from "./BlurCircle";
import { PlayCircleIcon } from "lucide-react";

// Lazy-load ReactPlayer only when it's about to be used, to prevent early YouTube script execution and reflows
const ReactPlayer = lazy(() => import("react-player"));

const TrailerThumbnail = memo(({ trailer, onClick, isSelected }) => (
  <div
    className={`relative group-hover:not-hover:opacity-50 hover:-translate-y-1 duration-300 transition max-md:h-60 md:max-h-60 cursor-pointer ${
      isSelected ? "ring-2 ring-red-500 rounded-lg" : ""
    }`}
    onClick={() => onClick(trailer)}
  >
    <img
      src={trailer.image}
      alt="trailer thumbnail"
      loading="lazy"
      className="rounded-lg w-full h-full object-cover brightness-75"
    />
    <PlayCircleIcon
      strokeWidth={1.6}
      className={`absolute top-1/2 left-1/2 w-5 md:w-8 h-5 md:h-12 transform -translate-x-1/2 -translate-y-1/2 ${
        isSelected ? "text-red-500" : "text-white"
      }`}
    />
  </div>
));

const TrailerSection = () => {
  const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [wasClicked, setWasClicked] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden"
      style={{ contentVisibility: "auto", containIntrinsicSize: "0 400px" }}
    >
      <p className="text-gray-300 font-medium text-lg max-w-[960px] mx-auto">
        Trailer
      </p>
      <div className="relative flex justify-center items-center mt-6 aspect-video max-w-[960px] mx-auto overflow-hidden rounded-xl bg-black/40">
        <BlurCircle top="-100px" right="-100px" />

        {/* Only mount ReactPlayer if intersection is true AND user has clicked (Facilitates "Load on Demand") */}
        {isLoaded && wasClicked ? (
          <Suspense
            fallback={
              <div className="w-full h-full animate-pulse bg-gray-800/20" />
            }
          >
            <ReactPlayer
              url={currentTrailer.videoUrl}
              width="100%"
              height="100%"
              playing={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onReady={() => console.log("video ready")}
              config={{
                youtube: {
                  playerVars: {
                    showinfo: 0,
                    rel: 0,
                    modestbranding: 1,
                    origin: window.location.origin,
                  },
                  embedOptions: {
                    host: "https://www.youtube-nocookie.com",
                  },
                },
              }}
              controls={true}
            />
          </Suspense>
        ) : (
          <div
            onClick={() => setWasClicked(true)}
            className="w-full h-full flex flex-col items-center justify-center bg-gray-900/40 cursor-pointer group relative"
          >
            <img
              src={currentTrailer.image}
              alt="Trailer Preview"
              className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity"
            />
            <PlayCircleIcon className="w-16 h-16 text-white group-hover:text-red-500 transition-all relative z-10" />
            <p className="mt-4 text-gray-400 group-hover:text-white transition-colors relative z-10 font-medium">
              Click to load trailer
            </p>
          </div>
        )}
      </div>
      <div className="group grid md:grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3xl mx-auto">
        {dummyTrailers.map((trailer) => (
          <TrailerThumbnail
            key={trailer.image}
            trailer={trailer}
            isSelected={currentTrailer.image === trailer.image}
            onClick={(t) => {
              setCurrentTrailer(t);
              setIsPlaying(true);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TrailerSection;
