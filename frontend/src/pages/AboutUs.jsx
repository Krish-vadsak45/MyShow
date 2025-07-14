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
  ChevronUp,
  ChevronDown,
  MessageCircle,
  Play,
  CheckCircle,
  ArrowRight,
  Users,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import BlurCircle from "@/components/BlurCircle";
import StateSection from "@/components/StateSection";
import { ContactForm } from "@/components/ContactForm";
import { ReportForm } from "@/components/ReportForm";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const AboutUs = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState("contact");

  const faqs = [
    {
      question: "How do I book movie tickets on MyShows?",
      answer:
        "Simply browse our movie listings, select your preferred showtime, choose your seats, and complete the payment. You'll receive your digital tickets instantly via email and can also download them from your account.",
    },
    {
      question: "Can I cancel or modify my booking?",
      answer:
        "Yes, you can cancel or modify your booking up to 2 hours before the showtime. Cancellations made within the allowed timeframe will receive a full refund, which typically processes within 3-5 business days.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, PayPal, Apple Pay, Google Pay, and various digital wallets. All transactions are secured with industry-standard encryption.",
    },
    {
      question: "How do I get my tickets after booking?",
      answer:
        "After successful payment, you'll receive digital tickets via email immediately. You can also access and download your tickets from the 'My Bookings' section in your account. Simply show the digital ticket at the cinema for entry.",
    },
    {
      question: "Do you offer group booking discounts?",
      answer:
        "Yes! We offer special discounts for group bookings of 10 or more tickets. Contact our customer support team for group booking rates and to arrange your cinema experience for large parties.",
    },
    {
      question: "What if I face technical issues during booking?",
      answer:
        "Our 24/7 customer support team is always ready to help. You can reach us via live chat, email, or phone. We also have a comprehensive help center with step-by-step guides for common issues.",
    },
  ];

  const achievements = [
    "Industry's fastest booking system",
    "24/7 customer support",
    "Partnerships with 500+ cinemas",
    "99.9% uptime guarantee",
  ];

  const values = [
    {
      icon: Heart,
      title: "Customer First",
      description:
        "We prioritize your movie experience above everything else, ensuring seamless booking and exceptional service.",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: Zap,
      title: "Innovation",
      description:
        "Cutting-edge technology meets cinema. We're constantly evolving to bring you the best movie booking experience.",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description:
        "Your data and transactions are protected with industry-leading security measures and encryption.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Target,
      title: "Quality Entertainment",
      description:
        "Curated selection of the finest movies, from blockbusters to indie gems, all in premium viewing environments.",
      color: "from-blue-500 to-cyan-500",
    },
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image:
        "https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=400",
      bio: "Passionate about bringing people together through the magic of cinema.",
      expertise: "Leadership & Strategy",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      image:
        "https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=400",
      bio: "Tech enthusiast dedicated to creating seamless digital experiences.",
      expertise: "Technology & Innovation",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Operations",
      image:
        "https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=400",
      bio: "Ensuring every customer interaction exceeds expectations.",
      expertise: "Operations & Customer Success",
    },
  ];

  return (
    <div className="text-white">
      {/* Hero Section */}
      {/* <section className="relative py-20 px-4 sm:px-6 lg:px-8">
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
      </section> */}

      {/* Our Story Section */}
      <section id="ourstory" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <BlurCircle top="20%" right="10%" size="400px" opacity="0.06" />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center bg-red-500/10 rounded-full px-4 py-2 mb-6">
                <Play className="w-4 h-4 text-red-400 mr-2" />
                <span className="text-red-400 font-medium">Our Journey</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Our Story
              </h2>

              <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
                <p className="border-l-4 border-red-500 pl-6">
                  Founded in 2016, MyShow began with a simple vision: to make
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

              <div className="mt-8 grid grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 via-transparent to-red-500/20 rounded-3xl blur-xl"></div>
              <div className="relative">
                <div className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-red-500/30 to-transparent rounded-3xl"></div>
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-red-500/20 to-transparent rounded-3xl"></div>
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-1 rounded-3xl">
                  <img
                    src="https://images.pexels.com/photos/436413/pexels-photo-436413.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Cinema experience"
                    className="w-full h-auto rounded-3xl"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StateSection />

      {/* Values Section */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-red-500/10 rounded-full px-4 py-2 mb-6">
            <Star className="w-4 h-4 text-red-400 mr-2" />
            <span className="text-red-400 font-medium">What Drives Us</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Our Values
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            The principles that guide everything we do and shape every decision
            we make.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 hover:border-red-500/30 transition-all duration-500 hover:scale-105 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div
                  className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${value.color} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold mb-4 text-white group-hover:text-red-400 transition-colors duration-300">
                  {value.title}
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  {value.description}
                </p>

                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="w-5 h-5 text-red-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <BlurCircle top="30%" right="5%" size="400px" opacity="0.06" />

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-red-500/10 rounded-full px-4 py-2 mb-6">
              <Users className="w-4 h-4 text-red-400 mr-2" />
              <span className="text-red-400 font-medium">Leadership Team</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              The passionate individuals behind MyShow, dedicated to bringing
              you the best movie experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-800 hover:border-red-500/30 transition-all duration-500 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                </div>

                <div className="relative p-6">
                  <h3 className="text-xl font-bold mb-1 text-white group-hover:text-red-400 transition-colors duration-300">
                    {member.name}
                  </h3>
                  <p className="text-red-400 font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-gray-500 mb-3">
                    {member.expertise}
                  </p>
                  <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-300">
              Got questions? We've got answers. Find everything you need to know
              about MyShows.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden"
              >
                <button
                  className="w-full px-6 py-6 text-left flex items-center justify-between cursor-pointer hover:bg-gray-800/70 transition-colors duration-200"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="text-lg font-semibold text-white pr-4">
                    {faq.question}
                  </span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-red-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-red-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <div className="border-t border-gray-700 pt-4">
                      <p className="text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <BlurCircle bottom="10%" left="20%" size="600px" opacity="0.05" />

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center bg-red-500/10 rounded-full px-4 py-2 mb-8">
            <Target className="w-4 h-4 text-red-400 mr-2" />
            <span className="text-red-400 font-medium">Our Purpose</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Our Mission
          </h2>

          <blockquote className="text-2xl md:text-3xl text-gray-300 leading-relaxed mb-12 italic border-l-4 border-red-500 pl-8">
            "To create magical movie experiences that bring people together,
            inspire emotions, and make every visit to the cinema unforgettable."
          </blockquote>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                text: "24/7 Support",
                desc: "Round-the-clock assistance",
              },
              {
                icon: Shield,
                text: "Secure Booking",
                desc: "Protected transactions",
              },
              {
                icon: Star,
                text: "Premium Experience",
                desc: "Best-in-class service",
              },
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-red-500/30 transition-all duration-300 hover:scale-105"
                >
                  <IconComponent className="w-8 h-8 text-red-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="font-bold text-white mb-2">{item.text}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center bg-red-500/10 rounded-full px-4 py-2 mb-6">
          <MessageSquare className="w-4 h-4 text-red-400 mr-2" />
          <span className="text-red-400 font-medium">Get In Touch</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Contact & Support
        </h2>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Have questions, suggestions, or need to report an issue? We're here to
          help.
        </p>
      </div>
      <div className="flex justify-center mb-12">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-800">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("contact")}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === "contact"
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Contact Us
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === "report"
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              Report Issue
            </button>
          </div>
        </div>
      </div>
      {/* Form Content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-gray-800">
          {activeTab === "contact" ? (
            <div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Send us a Message
                </h3>
                <p className="text-gray-400">
                  We'd love to hear from you. Send us a message and we'll
                  respond as soon as possible.
                </p>
              </div>
              <ContactForm />
            </div>
          ) : (
            <div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Report an Issue
                </h3>
                <p className="text-gray-400">
                  Help us improve MyShow by reporting bugs, requesting features,
                  or sharing feedback.
                </p>
              </div>
              <ReportForm />
            </div>
          )}
        </div>
      </div>

      {/* Additional Support Info */}
      <div className="mt-16 grid md:grid-cols-3 gap-8 mb-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-xl mb-4">
            <Clock className="w-6 h-6 text-red-400" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">
            Response Time
          </h4>
          <p className="text-gray-400 text-sm">
            We typically respond within 24 hours
          </p>
        </div>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-xl mb-4">
            <Shield className="w-6 h-6 text-red-400" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">
            Privacy Protected
          </h4>
          <p className="text-gray-400 text-sm">
            Your information is secure and confidential
          </p>
        </div>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-xl mb-4">
            <Star className="w-6 h-6 text-red-400" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">
            Quality Support
          </h4>
          <p className="text-gray-400 text-sm">
            Dedicated team committed to helping you
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
