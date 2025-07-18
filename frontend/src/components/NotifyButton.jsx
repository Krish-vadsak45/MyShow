import { Bell, BellRing } from "lucide-react";
import { useState } from "react";

const NotifyButton = ({ tmdbId, isNotified, onNotify, notifyCount }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    const result = await onNotify(tmdbId);
    setIsLoading(false);
    if (!isNotified && result) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  if (showSuccess) {
    return (
      <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center">
        <BellRing className="w-5 h-5 mr-2 animate-pulse" />
        Notification Set!
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`w-full font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center justify-center cursor-pointer ${
          isNotified
            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
            : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
        }`}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </>
        ) : isNotified ? (
          <>
            <BellRing className="w-5 h-5 mr-2" />
            Notified / Cancel Now
          </>
        ) : (
          <>
            <Bell className="w-5 h-5 mr-2" />
            Notify Me
          </>
        )}
      </button>
    </>
  );
};

export default NotifyButton;
