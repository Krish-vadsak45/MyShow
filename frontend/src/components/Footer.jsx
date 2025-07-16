import { useState } from "react";
import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Star,
  Heart,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  LinkedinIcon,
  GithubIcon,
} from "lucide-react";
import { assets } from "@/assets/assets";
import { Link, useNavigate } from "react-router-dom";

export default function ResponsiveFooter() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    quickShow: [
      { name: "Home", path: "/" },
      { name: "Movies", path: "/movies" },
      { name: "Theatres", path: "/theatres" },
      { name: "Releases", path: "/releases" },
      { name: "Favourite", path: "/favourite" },
      { name: "About Us", path: "/aboutus" },
    ],
    genres: [
      { name: "Action" },
      { name: "Drama" },
      { name: "Comedy" },
      { name: "Family" },
      { name: "Adventure" },
      { name: "Thriller" },
    ],
    movies: [
      { name: "Our story", href: "#ourstory" },
      { name: "Popular Movies", href: "/popular" },
      { name: "Top Rated", href: "/top-rated" },
      { name: "Coming Soon", href: "/coming-soon" },
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Contact Us", href: "/contact" },
      { name: "FAQ", href: "/faq" },
      { name: "Report Issue", href: "/report" },
    ],
  };

  const socialLinks = [
    {
      name: "Github",
      icon: GithubIcon,
      href: "https://github.com/Krish-vadsak45",
    },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/myshows" },
    {
      name: "Linkedin",
      icon: LinkedinIcon,
      href: "https://www.linkedin.com/in/krish-vadsak-a5bab427b/",
    },
    { name: "YouTube", icon: Youtube, href: "https://youtube.com/myshows" },
  ];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <footer className="text-white border-t border-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 lg:gap-50 mb-8 lg:mb-10">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center space-x-2 mb-4">
              <img
                className="w-36 h-auto"
                src={assets.logo}
                alt="logo"
                loading="lazy"
              />
            </div>

            <p className="text-gray-400 mt-3 mb-6 lg:mb-8 max-w-sm leading-relaxed text-sm lg:text-base">
              Your ultimate destination for movies and entertainment. Stream the
              latest releases, discover hidden gems, and enjoy unlimited
              entertainment.
            </p>

            {/* Newsletter Signup */}
            <div className="mb-6 lg:mb-8">
              <h4 className="text-white font-semibold mb-4">Stay Updated</h4>
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubscribed}
                  className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <span>{isSubscribed ? "Subscribed!" : "Subscribe"}</span>
                  {!isSubscribed && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            </div>
          </div>

          {/* Links Sections - Mobile: 2 columns, Desktop: 4 columns */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 lg:col-span-4">
            {/* MyShows Links */}
            <div>
              <h3 className="text-white font-semibold mb-4 lg:mb-6 text-base lg:text-lg">
                MyShows
              </h3>
              <ul className="space-y-3 lg:space-y-4">
                {footerLinks.quickShow.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      onClick={() => scrollTo(0, 0)}
                      // className="text-gray-400 hover:text-pink-500 transition-colors duration-200 text-sm block"
                      className={`text-sm font-medium transition-colors duration-200 ${
                        isActive(link.path)
                          ? "text-red-300"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Genres Links */}
            <div>
              <h3 className="text-white font-semibold mb-4 lg:mb-6 text-base lg:text-lg">
                Genres
              </h3>
              <ul className="space-y-3 lg:space-y-4">
                {footerLinks.genres.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={{
                        pathname: "/movies",
                        search: `?genre=${encodeURIComponent(link.name)}`,
                      }}
                      onClick={() => {
                        setTimeout(() => {
                          window.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          });
                        }, 100);
                      }}
                      className="text-gray-400 hover:text-pink-500 transition-colors duration-200 text-sm block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Movies Links */}
            <div>
              <h3 className="text-white font-semibold mb-4 lg:mb-6 text-base lg:text-lg">
                Movies
              </h3>
              <ul className="space-y-3 lg:space-y-4">
                {footerLinks.movies.map((link) => (
                  <li key={link.name}>
                    <a
                      onClick={() => {
                        navigate("/aboutus");
                      }}
                      href={link.href}
                      className="text-gray-400 hover:text-pink-500 transition-colors duration-200 text-sm block"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-white font-semibold mb-4 lg:mb-6 text-base lg:text-lg">
                Support
              </h3>
              <ul className="space-y-3 lg:space-y-4">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-pink-500 transition-colors duration-200 text-sm block"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="border-t border-gray-800 pt-6 lg:pt-8 mb-6 lg:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <div className="flex items-center space-x-3 text-gray-400">
              <div className="bg-gray-800 p-2 rounded-lg flex-shrink-0">
                <Mail className="h-5 w-5 text-pink-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-white text-sm lg:text-base truncate">
                  support@MyShows.com
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-gray-400">
              <div className="bg-gray-800 p-2 rounded-lg flex-shrink-0">
                <Phone className="h-5 w-5 text-pink-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-white text-sm lg:text-base">
                  +1 (555) 123-4567
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-gray-400">
              <div className="bg-gray-800 p-2 rounded-lg flex-shrink-0">
                <MapPin className="h-5 w-5 text-pink-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-white text-sm lg:text-base">
                  Los Angeles, CA
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-6 lg:pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            {/* Copyright and Links */}
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8 text-center sm:text-left">
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <span>© {currentYear} MyShows. All rights reserved.</span>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 lg:gap-6 text-sm">
                <a
                  href="/privacy"
                  className="text-gray-400 hover:text-pink-500 transition-colors duration-200"
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms"
                  className="text-gray-400 hover:text-pink-500 transition-colors duration-200"
                >
                  Terms of Service
                </a>
                <a
                  href="/cookies"
                  className="text-gray-400 hover:text-pink-500 transition-colors duration-200"
                >
                  Cookie Policy
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <span className="text-gray-400 text-sm">Follow us:</span>
              <div className="flex space-x-3">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-800 hover:bg-gradient-to-r hover:from-pink-500 hover:to-red-500 p-3 rounded-lg transition-all duration-200 transform hover:scale-110"
                      aria-label={social.name}
                    >
                      <IconComponent className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="border-t border-gray-800 pt-4 lg:pt-6 mt-4 lg:mt-6">
          <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-8 text-gray-500 text-xs">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <span>4.8/5 Rating</span>
            </div>
            <span className="hidden sm:block">•</span>
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-pink-500" />
              <span>10M+ Happy Users</span>
            </div>
            <span className="hidden sm:block">•</span>
            <span>SSL Secured</span>
            <span className="hidden lg:block">•</span>
            <span className="hidden sm:block">24/7 Support</span>
            <span className="hidden lg:block">•</span>
            <span className="hidden lg:block">GDPR Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
