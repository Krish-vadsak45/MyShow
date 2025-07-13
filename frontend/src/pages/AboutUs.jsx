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
} from "lucide-react";
import BlurCircle from "@/components/BlurCircle";
import StateSection from "@/components/StateSection";
import { assets } from "@/assets/assets";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const AboutUs = () => {
  const [openFaq, setOpenFaq] = useState(null);

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
      {/* <section id="ourstory" className="py-20 px-4 sm:px-6 lg:px-8">
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
      </section> */}
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

          <div className="text-center mt-12">
            <p className="text-gray-400 mb-6">Still have questions?</p>
            <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-8 py-3 rounded-full font-semibold transition-all duration-300">
              <MessageCircle className="w-5 h-5 mr-2" />
              Contact Support
            </Button>
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
