import React, { useState, useRef, useMemo, useEffect } from "react";
import { Users, Award, Star, MapPin } from "lucide-react";
const StateSection = () => {
  const statsData = [
    {
      id: 1,
      icon: Users,
      label: "Happy Customers",
      value: 0,
      maxValue: "50000",
    },
    {
      id: 2,
      icon: MapPin,
      label: "Cinema Locations",
      value: 0,
      maxValue: "250",
    },
    {
      id: 3,
      icon: Star,
      label: "Movies Available",
      value: 0,
      maxValue: "1000",
    },
    { id: 4, icon: Award, label: "Years of Service", value: 0, maxValue: "8" },
  ];

  const memoizedStats = useMemo(() => statsData, []);

  const [stats, setStats] = useState(memoizedStats);

  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // console.log("entry created", entry);
        } else {
          setIsVisible(false);
          // resetStats(); // Reset stats when out of viewport
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the section is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      startAnimation();
    }
  }, [isVisible]);

  const startAnimation = () => {
    const interval = setInterval(() => {
      setStats((prevStats) => {
        let allReached = true;
        const newStats = prevStats.map((stat) => {
          if (stat.value < stat.maxValue) {
            allReached = false;
            return {
              ...stat,
              value: Math.min(
                stat.value + Math.ceil(stat.maxValue / 100),
                stat.maxValue
              ),
            };
          }
          return stat;
        });

        if (allReached) clearInterval(interval);
        return newStats;
      });
    }, 50);
  };

  return (
    <div>
      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 ">
        <div className="max-w-7xl mx-auto">
          <div
            ref={sectionRef}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
                    <IconComponent className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {stat.value}+
                  </div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default StateSection;
