import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { examResultsService } from "@/services/examResultsService";
import DeveloperCredits from "./DeveloperCredits";
import { 
  BookOpen, 
  Menu,
  X,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Monitor,
  Trophy,
  Star
} from "lucide-react";

interface WelcomePageProps {
  onGetStarted: () => void;
  onContactUs: () => void;
  onTerms: () => void;
  onRefund: () => void;
}

export default function WelcomePage({ onGetStarted, onContactUs, onTerms, onRefund }: WelcomePageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [toppers, setToppers] = useState<any[]>([]);
  const [currentTopperSlide, setCurrentTopperSlide] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchToppers();
  }, []);

  const fetchToppers = async () => {
    try {
      const results = await examResultsService.getToppers();
      setToppers(results);
    } catch (error) {
      console.error('Error fetching toppers:', error);
    }
  };

  const slides = [
    {
      title: "Excellence in Education",
      subtitle: "Join India's Leading Online Institute",
      image: "/api/placeholder/800/400",
      bgColor: "from-blue-600 to-indigo-700"
    },
    {
      title: "Expert Faculty",
      subtitle: "Learn from IIT/NIT Graduates",
      image: "/api/placeholder/800/400",
      bgColor: "from-purple-600 to-pink-600"
    },
    {
      title: "Live Interactive Classes",
      subtitle: "Real-time Doubt Solving",
      image: "/api/placeholder/800/400",
      bgColor: "from-green-600 to-teal-600"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src="/images/DI_logo.jpg" 
                alt="Drishti Institute Logo"
                className="h-12 w-12 rounded-full object-cover border-2 border-blue-600"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <BookOpen className="h-8 w-8 text-blue-600 hidden" />
              <span className="text-xl font-bold text-gray-900">Drishti Institute</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium">Home</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium">About</a>
              <button onClick={onContactUs} className="text-gray-700 hover:text-blue-600 font-medium">Contact</button>
              <button onClick={onGetStarted} className="text-gray-700 hover:text-blue-600 font-medium">Courses</button>
              
              {/* Social Media Icons */}
              <div className="flex items-center space-x-3 ml-4">
                <Facebook className="h-5 w-5 text-gray-600 hover:text-blue-600 cursor-pointer" />
                <Twitter className="h-5 w-5 text-gray-600 hover:text-blue-400 cursor-pointer" />
                <Instagram className="h-5 w-5 text-gray-600 hover:text-pink-600 cursor-pointer" />
                <Youtube className="h-5 w-5 text-gray-600 hover:text-red-600 cursor-pointer" />
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t shadow-lg"
          >
            <div className="px-4 py-4 space-y-4">
              <a href="#home" className="block text-gray-700 hover:text-blue-600 font-medium">Home</a>
              <a href="#about" className="block text-gray-700 hover:text-blue-600 font-medium">About</a>
              <button onClick={onContactUs} className="block text-gray-700 hover:text-blue-600 font-medium w-full text-left">Contact</button>
              <button onClick={onGetStarted} className="block text-gray-700 hover:text-blue-600 font-medium w-full text-left">Courses</button>
              
              <div className="flex items-center space-x-4 pt-4 border-t">
                <Facebook className="h-6 w-6 text-gray-600 hover:text-blue-600 cursor-pointer" />
                <Twitter className="h-6 w-6 text-gray-600 hover:text-blue-400 cursor-pointer" />
                <Instagram className="h-6 w-6 text-gray-600 hover:text-pink-600 cursor-pointer" />
                <Youtube className="h-6 w-6 text-gray-600 hover:text-red-600 cursor-pointer" />
              </div>
            </div>
          </motion.div>
        )}
      </header>

      {/* Poster Section */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Slideshow */}
            <div className="lg:col-span-2">
              <div className="relative h-96 rounded-xl overflow-hidden shadow-lg">
                <div className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].bgColor}`}>
                  <div className="flex items-center justify-center h-full text-white text-center p-8">
                    <div>
                      <h2 className="text-4xl font-bold mb-4">{slides[currentSlide].title}</h2>
                      <p className="text-xl">{slides[currentSlide].subtitle}</p>
                    </div>
                  </div>
                </div>
                
                {/* Navigation Arrows */}
                <button 
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button 
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
                
                {/* Slide Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full ${
                        index === currentSlide ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Side Advertisements */}
            <div className="space-y-6">
              {/* Online Classes Ad */}
              <Card className="h-44 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center">
                  <Monitor className="h-12 w-12 mb-3" />
                  <h3 className="text-lg font-bold mb-2">Live Online Classes</h3>
                  <p className="text-sm text-blue-100">Interactive sessions with expert faculty</p>
                </CardContent>
              </Card>

              {/* Mobile App Ad */}
              <Card className="h-44 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center">
                  <Smartphone className="h-12 w-12 mb-3" />
                  <h3 className="text-lg font-bold mb-2">Mobile App</h3>
                  <p className="text-sm text-purple-100">Learn anywhere, anytime on your phone</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Toppers Section */}
      <section className="py-16 bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-yellow-600 mr-2" />
              <h2 className="text-4xl font-bold text-gray-900">Our Toppers</h2>
            </div>
            <p className="text-xl text-gray-600">Celebrating the success of our brilliant students</p>
          </motion.div>

          {toppers.length > 0 && (
            <div className="relative">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentTopperSlide * 100}%)` }}
                >
                  {toppers.map((topper, index) => {
                    const totalMarks = topper.subjects?.reduce((sum: number, subject: any) => sum + (subject.marks_secured || 0), 0) || 0;
                    const avgMarks = topper.subjects?.length ? Math.round(totalMarks / topper.subjects.length) : 0;
                    
                    // Convert Google Drive URL to direct image URL
                    const getImageUrl = (url: string) => {
                      if (url?.includes('drive.google.com/file/d/')) {
                        const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
                        return fileId ? `https://drive.google.com/thumbnail?id=${fileId[1]}&sz=w200` : null;
                      }
                      return url;
                    };
                    
                    const imageUrl = getImageUrl(topper.image_url);
                    
                    return (
                      <div key={index} className="w-full flex-shrink-0">
                        <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-shadow max-w-md mx-auto">
                          <CardContent className="p-6 text-center">
                            <div className="relative mb-4 mx-auto w-fit">
                              {imageUrl && !failedImages.has(imageUrl) ? (
                                <img 
                                  src={imageUrl} 
                                  alt={topper.name}
                                  className="w-24 h-24 rounded-full object-cover border-4 border-yellow-400"
                                  onError={() => {
                                    setFailedImages(prev => new Set(prev).add(imageUrl));
                                  }}
                                />
                              ) : (
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-4 border-yellow-400">
                                  <span className="text-white font-bold text-2xl">{topper.name?.charAt(0) || 'T'}</span>
                                </div>
                              )}
                              <div className="absolute -top-2 -right-2">
                                <Star className="h-6 w-6 text-yellow-500 fill-current" />
                              </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{topper.name}</h3>
                            <Badge variant="secondary" className="mb-3">{topper.exam_name}</Badge>
                            <p className="text-gray-600 text-sm mb-3">Year: {topper.year}</p>
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full text-sm font-semibold inline-block">
                              Average: {avgMarks}%
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {toppers.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentTopperSlide((prev) => (prev - 1 + toppers.length) % toppers.length)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-700" />
                  </button>
                  <button 
                    onClick={() => setCurrentTopperSlide((prev) => (prev + 1) % toppers.length)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-700" />
                  </button>
                  
                  <div className="flex justify-center mt-6 space-x-2">
                    {toppers.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTopperSlide(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentTopperSlide ? 'bg-yellow-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Founder Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Founder Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative">
                <img 
                  src="/images/mukeshSirPhoto.jpg" 
                  alt="Founder - Mukesh Sir" 
                  className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-4 rounded-xl shadow-lg">
                  <div className="text-2xl font-bold">15+</div>
                  <div className="text-sm">Years Experience</div>
                </div>
              </div>
            </motion.div>

            {/* Founder Details */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="mb-6">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Founder</h2>
                <h3 className="text-2xl font-semibold text-blue-600 mb-6">Mukesh Sir</h3>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <p className="text-lg leading-relaxed">
                  With over 15 years of experience in education, Mukesh Sir founded Drishti Institute 
                  with a vision to make quality education accessible to every student across India.
                </p>
                
                <p className="text-lg leading-relaxed">
                  An IIT graduate and passionate educator, he has mentored thousands of students 
                  to achieve their academic goals and secure admissions in top engineering and medical colleges.
                </p>
                
                <div className="grid grid-cols-2 gap-6 mt-8">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">10,000+</div>
                    <div className="text-sm text-gray-600">Students Mentored</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">95%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Button onClick={onGetStarted} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Start Your Journey
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={onGetStarted}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 group"
          size="lg"
        >
          <span className="mr-2 font-semibold">Start Your Journey</span>
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            →
          </motion.div>
        </Button>
      </motion.div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BookOpen className="h-6 w-6" />
              <span className="text-lg font-bold">Drishti Institute</span>
            </div>
            
            <div className="flex space-x-6 text-sm">
              <button onClick={onTerms} className="hover:text-blue-400 transition-colors">Terms & Conditions</button>
              <button onClick={onRefund} className="hover:text-blue-400 transition-colors">Refund Policy</button>
              <button onClick={onContactUs} className="hover:text-blue-400 transition-colors">Contact Us</button>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-6 pt-6 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Drishti Institute. All rights reserved.</p>
          </div>
          
          <DeveloperCredits />
        </div>
      </footer>
    </div>
  );
}