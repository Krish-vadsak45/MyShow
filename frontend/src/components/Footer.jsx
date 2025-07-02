import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const Footer = () => {
  const navigate = useNavigate();

  const { favouriteMovies } = useAppContext();
  const navigationItems = [
    { name: "Home", path: "/" },
    { name: "Movies", path: "/movies" },
    { name: "Theatres", path: "/theatres" },
    { name: "Releases", path: "/releases" },
    { name: "Favourite", path: "/favourite" },
    { name: "About Us", path: "/aboutus" },
  ];
  const isActive = (path) => {
    return location.pathname === path;
  };
  return (
    <footer className="px-6 md:px-16 lg:px-36 mt-40 w-full text-gray-300">
      <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500 pb-14">
        <div className="md:max-w-96">
          <img
            className="w-36 h-auto"
            src={assets.logo}
            alt="logo"
            loading="lazy"
          />
          <p className="mt-6 text-sm">
            Lorem Ipsum has been the industry's standard dummy text ever since
            the 1500s, when an unknown printer took a galley of type and
            scrambled it to make a type specimen book.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <img
              src={assets.googlePlay}
              alt="google play"
              className="h-9 w-auto "
              loading="lazy"
            />
            <img
              src={assets.appStore}
              alt="app store"
              className="h-9 w-auto "
              loading="lazy"
            />
          </div>
        </div>
        <div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
          <div>
            <h2 className="font-semibold mb-5">Company</h2>
            <div className="flex flex-col">
              {navigationItems
                .filter(
                  (item) =>
                    item.name !== "favourite" || favouriteMovies.length > 0
                )
                .map((item) => (
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
          <div>
            <h2 className="font-semibold mb-5">Get in touch</h2>
            <div className="text-sm space-y-2">
              <p>+1-234-567-890</p>
              <p>contact@example.com</p>
            </div>
          </div>
        </div>
      </div>
      <p className="pt-4 text-center text-sm pb-5">
        Copyright {new Date().getFullYear()} © MyShow. All Right Reserved.
      </p>
    </footer>
  );
};

export default Footer;
