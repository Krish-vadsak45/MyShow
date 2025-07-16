import { Clock } from "lucide-react";
import React, { useEffect, useState } from "react";

const Countdown = ({ releaseDate }) => {
  const [time, setTime] = useState(getTimeLeft());

  function getTimeLeft() {
    const diff = new Date(releaseDate) - new Date();
    if (diff <= 0) return { status: "released", display: "Released!" };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return {
      status: "countdown",
      days,
      hours,
      minutes,
      seconds,
      display: `${days}d ${hours}h ${minutes}m ${seconds}s`,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [releaseDate]);

  if (time.status === "released") {
    return (
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
        <div className="flex items-center justify-center mb-3">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-green-400 font-medium text-sm">
            Available Now
          </span>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">NOW</div>
          <div className="text-xs text-gray-400">Available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
      <div className="flex items-center justify-center mb-3">
        <div className="w-3 h-3rounded-full mr-2">
          <Clock className="w-4 h-4 text-red-400" />
        </div>
        <span className="text-white font-medium text-sm">Releases In</span>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-gray-900/50 rounded-lg p-2">
          <div className="text-2xl font-bold text-white">{time.days}</div>
          <div className="text-xs text-gray-400">Days</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2">
          <div className="text-2xl font-bold text-white">{time.hours}</div>
          <div className="text-xs text-gray-400">Hours</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2">
          <div className="text-2xl font-bold text-white">{time.minutes}</div>
          <div className="text-xs text-gray-400">Min</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2">
          <div className="text-2xl font-bold text-white">{time.seconds}</div>
          <div className="text-xs text-gray-400">Sec</div>
        </div>
      </div>
    </div>
  );
};

export default Countdown;
