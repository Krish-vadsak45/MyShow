import {
  Target,
  Heart,
  Zap,
  Shield,
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
} from "lucide-react";
import BlurCircle from "@/components/BlurCircle";
import StateSection from "@/components/StateSection";
import { assets } from "@/assets/assets";

const AboutUs = () => {
  const values = [
    {
      icon: Heart,
      title: "Customer First",
      description:
        "We prioritize your movie experience above everything else, ensuring seamless booking and exceptional service.",
    },
    {
      icon: Zap,
      title: "Innovation",
      description:
        "Cutting-edge technology meets cinema. We're constantly evolving to bring you the best movie booking experience.",
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description:
        "Your data and transactions are protected with industry-leading security measures and encryption.",
    },
    {
      icon: Target,
      title: "Quality Entertainment",
      description:
        "Curated selection of the finest movies, from blockbusters to indie gems, all in premium viewing environments.",
    },
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Passionate about bringing people together through the magic of cinema.",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Tech enthusiast dedicated to creating seamless digital experiences.",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Operations",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Ensuring every customer interaction exceeds expectations.",
    },
  ];

  return (
    <div className="text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 "></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <BlurCircle top="150px" left="0px" />
          <BlurCircle bottom="150px" right="0px" />
          <div className="flex items-center justify-center  mb-6">
            <img
              src="favicone.png"
              alt="logo image"
              className="scale-50"
              loading="lazy"
            />
            <h1 className="text-4xl md:text-6xl font-bold">MyShows</h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Your premier destination for movie tickets and unforgettable cinema
            experiences. We're revolutionizing how you discover, book, and enjoy
            movies.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <BlurCircle top="550px" right="0px" />
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
                <p>
                  Founded in 2016, MyShows began with a simple vision: to make
                  movie booking as exciting as the movies themselves. What
                  started as a small startup has grown into a leading platform
                  serving thousands of movie enthusiasts daily.
                </p>
                <p>
                  We believe that great movies deserve great experiences. That's
                  why we've partnered with premium cinemas, implemented
                  cutting-edge technology, and built a platform that puts you at
                  the center of every interaction.
                </p>
                <p>
                  Today, we're proud to be the bridge between movie lovers and
                  their next favorite film, offering everything from the latest
                  blockbusters to independent cinema gems.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary rounded-lg opacity-50"></div>
              <div className="relative z-10 rounded-lg overflow-hidden shadow-xl">
                <img
                  src={assets.Ourstory2}
                  width={800}
                  height={600}
                  alt="QuickRide founding team"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary-dull rounded-lg opacity-50"></div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary-dull rounded-lg opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StateSection />

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 ">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The principles that guide everything we do and shape every
              decision we make.
            </p>
          </div>
          <BlurCircle top="650px" right="5px" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-800/50 rounded-lg p-6 hover:bg-gray-800/70 transition-all duration-300 ease-in-out hover:scale-105 hover:rotate-2"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-lg mb-4">
                    <IconComponent className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <BlurCircle top="950px" left="0px" />
        {/* <BlurCircle bottom="150px" right="0px" /> */}
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The passionate individuals behind MyShows, dedicated to bringing
              you the best movie experience.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-gray-800/50 rounded-lg overflow-hidden hover:bg-gray-800/70 transition-colors"
              >
                <div className="aspect-square bg-gradient-to-br from-blue-500 to-purple-600"></div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-blue-400 mb-3">{member.role}</p>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 ">
        <BlurCircle bottom="90px" right="0px" />
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
            "To create magical movie experiences that bring people together,
            inspire emotions, and make every visit to the cinema unforgettable."
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center bg-gray-800/50 rounded-full px-6 py-3">
              <Clock className="w-5 h-5 text-blue-400 mr-2" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center bg-gray-800/50 rounded-full px-6 py-3">
              <Shield className="w-5 h-5 text-blue-400 mr-2" />
              <span>Secure Booking</span>
            </div>
            <div className="flex items-center bg-gray-800/50 rounded-full px-6 py-3">
              <Star className="w-5 h-5 text-blue-400 mr-2" />
              <span>Premium Experience</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 ">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Have questions or suggestions? We'd love to hear from you.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
                <Phone className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <p className="text-gray-300">+1 (555) 123-4567</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
                <Mail className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="text-gray-300">hello@myshows.com</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
                <MapPin className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-300">
                123 Cinema Street
                <br />
                Movie City, MC 12345
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
