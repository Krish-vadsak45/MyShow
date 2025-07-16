import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu, X, TicketPlus } from "lucide-react";
import { assets } from "../assets/assets";
import { useUser, useClerk, UserButton } from "@clerk/clerk-react";
import { useAppContext } from "../context/AppContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useUser();
  const { openSignIn } = useClerk();

  const navigate = useNavigate();

  const { favouriteMovies } = useAppContext();

  const navigationItems = [
    { name: "Home", path: "/" },
    { name: "Movies", path: "/movies" },
    { name: "Theatres", path: "/theatres" },
    { name: "Releases", path: "/upcoming" },
    { name: "Favourite", path: "/favourite" },
    { name: "About Us", path: "/aboutus" },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-transparent fixed top-0 left-0 w-[100vw] z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 w-[30%] md:w-[13%]"
          >
            <img
              src={assets.logo}
              alt="logo image"
              className="scale-100"
              loading="lazy"
            />
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div
              className="max-md: absolute max-md:  max-md:  max-md: font-medium
                  max-md: text-1g z-50 flex flex-col md:flex-row items-center
                  max-md: justify-center gap-8 min-md: px-8 py-3 max-md:h-screen
                  min-md: rounded-full backdrop-blur bg-black/70 md:bg-white/10 md:border
                  border-gray-300/20 overflow-hidden transition-[width] duration-300"
            >
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => scrollTo(0, 0)}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? "text-red-300"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side - Search and Login */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <a className="text-gray-300 hover:text-white p-2 transition-colors duration-200">
              <Search
                onClick={() => {
                  navigate("/movies");
                  setTimeout(() => {
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }, 100);
                }}
                className="w-5 h-5 cursor-pointer"
              />
            </a>

            {/* Login Button */}
            {!user ? (
              <button
                onClick={openSignIn}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer"
              >
                Log In
              </button>
            ) : (
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="My Bookings"
                    labelIcon={<TicketPlus width={15} />}
                    onClick={() => navigate("/mybookings")}
                  />
                </UserButton.MenuItems>
              </UserButton>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-white p-2 transition-colors duration-200"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden fixed top-15 left-0 w-1/4 max-w-xs z-10 bg-slate-800/90 rounded-r-lg shadow-lg transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="px-4 pt-2 pb-3 space-y-2 bg-slate-800/60 rounded-lg mt-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive(item.path)
                    ? "text-white"
                    : "text-gray-300 hover:text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
