import { Link } from "react-router-dom";
import { Film } from "lucide-react";
import BlurCircle from "./BlurCircle";
const NotExist = ({
  title,
  message,
  buttonLabel,
  redirectPath,
  icon: Icon = Film,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 ">
      <div className="text-center max-w-md mx-auto">
        <BlurCircle top="150px" left="0px" />
        <BlurCircle bottom="150px" right="0px" />
        {/* Icon with subtle animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-lg opacity-20 animate-pulse"></div>
            <div className="relative bg-white rounded-full p-6 shadow-lg border border-gray-200">
              <Icon className="w-12 h-12 text-primary mx-auto" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold  mb-4 animate-fade-in">
          {title}
        </h1>

        {/* Message */}
        <p className=" mb-8 leading-relaxed text-sm md:text-base animate-fade-in-delay">
          {message}
        </p>

        {/* CTA Button */}
        <Link to={redirectPath}>
          <button className="group relative inline-flex items-center justify-center px-8 py-3 font-medium text-white transition-all duration-300 ease-out bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 transform active:scale-95 cursor-pointer">
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-purple-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center">
              {buttonLabel}
              <svg
                className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </button>
        </Link>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-delay {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-fade-in-delay {
          animation: fade-in-delay 0.8s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
};

export default NotExist;
