import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  BookOpen, 
  Users, 
  Trophy, 
  Smartphone, 
  Star,
  Play,
  CheckCircle,
  Award,
  Brain,
  Video,
  MessageCircle,
  Shield,
  BarChart,
  Download,
  ArrowRight,
  Quote
} from "lucide-react";
import instituteImage from "@assets/generated_images/Institute_building_exterior_0bc714ad.png";
import teacherImage from "@assets/generated_images/Teacher_founder_professional_headshot_415eeeb9.png";
import studentsImage from "@assets/generated_images/Student_success_group_photo_126f6c66.png";
import appMockupImage from "@assets/generated_images/Mobile_app_advertisement_mockup_19aa6e82.png";

import ProfessorSection from "./ProfessorSection";

interface WelcomePageProps {
  onGetStarted: () => void;
}

const subjects = [
  { id: 'physics', name: 'Physics', icon: '⚛️' },
  { id: 'chemistry', name: 'Chemistry', icon: '🧪' },
  { id: 'math', name: 'Mathematics', icon: '📐' },
  { id: 'biology', name: 'Biology', icon: '🧬' }
];

const classes = [
  { id: '9', name: 'Class 9', students: '2,500+' },
  { id: '10', name: 'Class 10', students: '3,200+' },
  { id: '11', name: 'Class 11', students: '2,800+' },
  { id: '12', name: 'Class 12', students: '3,100+' }
];

const metrics = [
  { label: 'Students Taught', value: 50000, suffix: '+' },
  { label: 'Average Score', value: 94.5, suffix: '%' },
  { label: 'IIT/AIIMS Selections', value: 1200, suffix: '+' },
  { label: 'Cities Served', value: 45, suffix: '+' }
];

const features = [
  {
    icon: Users,
    title: 'Expert Faculty',
    description: 'Learn from IIT/AIIMS graduates with 10+ years of experience'
  },
  {
    icon: BookOpen,
    title: 'Structured Curriculum',
    description: 'Comprehensive study material aligned with latest exam patterns'
  },
  {
    icon: MessageCircle,
    title: 'Doubt Support',
    description: '24/7 doubt clearing sessions with personalized attention'
  },
  {
    icon: Shield,
    title: 'Secure Learning',
    description: 'Protected video content with watermarks and download prevention'
  },
  {
    icon: BarChart,
    title: 'Performance Analytics',
    description: 'Track your progress with detailed performance insights'
  },
  {
    icon: Smartphone,
    title: 'Mobile Learning',
    description: 'Learn anywhere with our feature-rich mobile application'
  }
];

const testimonials = [
  {
    name: 'Priya Sharma',
    score: '98.2%',
    achievement: 'AIIMS Delhi',
    quote: 'The personalized attention and expert guidance helped me achieve my dream of becoming a doctor.',
    image: '/api/placeholder/60/60'
  },
  {
    name: 'Arjun Patel',
    score: '96.8%',
    achievement: 'IIT Bombay',
    quote: 'The structured approach and regular practice tests boosted my confidence for JEE.',
    image: '/api/placeholder/60/60'
  },
  {
    name: 'Ananya Singh',
    score: '97.4%',
    achievement: 'NEET AIR 125',
    quote: 'Excellent faculty and comprehensive study material made my NEET preparation smooth.',
    image: '/api/placeholder/60/60'
  },
  {
    name: 'Rohit Kumar',
    score: '95.6%',
    achievement: 'IIT Delhi',
    quote: 'The doubt clearing sessions and mock tests were instrumental in my success.',
    image: '/api/placeholder/60/60'
  }
];

const faqs = [
  {
    question: 'How do I enroll in courses?',
    answer: 'You can enroll by registering on our platform and contacting our admissions team. We offer flexible enrollment options for all classes.'
  },
  {
    question: 'What is the fee structure?',
    answer: 'Our fees are competitive and vary by class and subjects. We offer EMI options and scholarships for deserving students. Contact us for detailed fee information.'
  },
  {
    question: 'Are classes available offline?',
    answer: 'We primarily offer online classes with recorded lectures for flexibility. Some cities have hybrid options with occasional offline sessions.'
  },
  {
    question: 'How secure are the video lectures?',
    answer: 'Our videos are watermarked and protected against downloads. Each student gets personalized access with device restrictions for security.'
  },
  {
    question: 'Is there a mobile app?',
    answer: 'Yes, we have a comprehensive mobile app available for both Android and iOS with all features of the web platform.'
  },
  {
    question: 'What kind of doubt support is provided?',
    answer: 'We offer 24/7 doubt clearing through chat, video calls, and dedicated doubt clearing sessions with subject experts.'
  }
];

function CountUpAnimation({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
}

export default function WelcomePage({ onGetStarted }: WelcomePageProps) {
  const [selectedClass, setSelectedClass] = useState('12');
  const [selectedSubject, setSelectedSubject] = useState('physics');
  const [isNavbarSolid, setIsNavbarSolid] = useState(false);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);

  useEffect(() => {
    const handleScroll = () => {
      setIsNavbarSolid(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isNavbarSolid ? 'bg-background/95 backdrop-blur-sm border-b shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">Drishti Institute</span>
          </div>
          <Button 
            onClick={onGetStarted}
            size="sm"
            className="shadow-lg hover:shadow-xl transition-all"
            data-testid="navbar-cta"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated Background */}
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-blue-50 to-white" />
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 2, 0] 
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-10 right-10 w-96 h-96 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1.1, 1, 1.1],
              rotate: [0, -1, 0] 
            }}
            transition={{ 
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-tr from-blue-200/30 to-transparent rounded-full blur-2xl"
          />
        </motion.div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl lg:text-6xl font-bold text-foreground leading-tight"
              >
                Master Your 
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {" "}Academic Journey
                </span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-muted-foreground max-w-lg"
              >
                Join 50,000+ students achieving excellence with expert faculty, 
                personalized learning, and comprehensive support for Classes 9-12.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                data-testid="hero-cta-primary"
              >
                Start Learning Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 border-2 hover:bg-primary/5"
                data-testid="hero-cta-secondary"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex items-center space-x-6 pt-4"
            >
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">4.9/5 from 10,000+ reviews</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 1, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <img 
                src={instituteImage} 
                alt="Drishti Institute Campus" 
                className="rounded-2xl shadow-2xl w-full max-w-lg mx-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl" />
            </motion.div>
            
            {/* Floating Elements */}
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, -2, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute -top-4 -right-4 bg-white dark:bg-card rounded-xl shadow-lg p-4"
            >
              <div className="flex items-center space-x-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <div>
                  <div className="text-sm font-semibold">98.2% Avg Score</div>
                  <div className="text-xs text-muted-foreground">Class 12 Results</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ 
                y: [0, -12, 0],
                rotate: [0, 2, 0]
              }}
              transition={{ 
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
              className="absolute -bottom-4 -left-4 bg-white dark:bg-card rounded-xl shadow-lg p-4"
            >
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-primary" />
                <div>
                  <div className="text-sm font-semibold">50,000+</div>
                  <div className="text-xs text-muted-foreground">Happy Students</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Program Selector */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Choose Your Learning Path</h2>
            <p className="text-xl text-muted-foreground">
              Select your class and subjects to see what makes us different
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Selector */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Class:</h3>
                <div className="flex flex-wrap gap-3">
                  {classes.map((cls) => (
                    <Button
                      key={cls.id}
                      variant={selectedClass === cls.id ? "default" : "outline"}
                      onClick={() => setSelectedClass(cls.id)}
                      className="transition-all hover:scale-105"
                      data-testid={`class-${cls.id}`}
                    >
                      {cls.name}
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {cls.students}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Select Subject:</h3>
                <div className="flex flex-wrap gap-3">
                  {subjects.map((subject) => (
                    <Button
                      key={subject.id}
                      variant={selectedSubject === subject.id ? "default" : "outline"}
                      onClick={() => setSelectedSubject(subject.id)}
                      className="transition-all hover:scale-105"
                      data-testid={`subject-${subject.id}`}
                    >
                      <span className="mr-2">{subject.icon}</span>
                      {subject.name}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Dynamic Benefits Panel */}
            <motion.div
              key={`${selectedClass}-${selectedSubject}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-background border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {subjects.find(s => s.id === selectedSubject)?.icon}
                    </span>
                    <span>Class {selectedClass} {subjects.find(s => s.id === selectedSubject)?.name}</span>
                  </CardTitle>
                  <CardDescription>
                    Specialized curriculum designed for excellence
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm">150+ Video Lectures</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm">Weekly Mock Tests</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm">24/7 Doubt Support</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm">Performance Analytics</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm">Mobile App Access</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm">Study Material PDF</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4"
                    onClick={onGetStarted}
                    data-testid="program-enroll"
                  >
                    Enroll Now - ₹{selectedClass === '9' || selectedClass === '10' ? '4,999' : selectedClass === '11' ? '7,999' : '8,999'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Metrics Band */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold mb-2">
                  <CountUpAnimation end={metric.value} suffix={metric.suffix} />
                </div>
                <div className="text-primary-foreground/80 text-sm lg:text-base">
                  {metric.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Why Choose Drishti Institute?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the perfect blend of technology, expertise, and personalized attention
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <Card className="h-full p-6 hover-elevate border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-background to-muted/30">
                  <CardContent className="p-0 space-y-4">
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.5
                      }}
                      className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                    >
                      <feature.icon className="h-6 w-6 text-primary" />
                    </motion.div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ProfessorSection />

      {/* Testimonials Carousel */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Success Stories</h2>
            <p className="text-xl text-muted-foreground">
              Hear from our students who achieved their dreams
            </p>
          </motion.div>

          <Carousel className="max-w-4xl mx-auto" opts={{ align: "start", loop: true }}>
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full p-6">
                      <CardContent className="p-0 space-y-4">
                        <Quote className="h-8 w-8 text-primary/40" />
                        <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                        <div className="flex items-center space-x-4 pt-4 border-t">
                          <img 
                            src={testimonial.image} 
                            alt={testimonial.name}
                            className="w-12 h-12 rounded-full bg-muted"
                          />
                          <div>
                            <div className="font-semibold">{testimonial.name}</div>
                            <div className="text-sm text-primary font-medium">
                              {testimonial.score} • {testimonial.achievement}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Mobile App Promo */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl font-bold">
                Learn Anytime, Anywhere
              </h2>
              <p className="text-xl text-muted-foreground">
                Download our mobile app and take your learning experience to the next level
              </p>
              <div className="space-y-4">
                {[
                  'Offline video downloads',
                  'Interactive quizzes and tests',
                  'Progress tracking and analytics',
                  'Live doubt sessions',
                  'Personalized study plans'
                ].map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </motion.div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="bg-black text-white hover:bg-black/90">
                  <Download className="mr-2 h-5 w-5" />
                  Download for Android
                </Button>
                <Button size="lg" variant="outline">
                  <Download className="mr-2 h-5 w-5" />
                  Download for iOS
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <motion.img
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 1, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                src={appMockupImage}
                alt="Drishti Institute Mobile App"
                className="max-w-sm w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about Drishti Institute
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-background rounded-lg px-6 border-0 shadow-sm"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl lg:text-5xl font-bold">
              Ready to Transform Your Future?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join thousands of successful students who chose excellence. 
              Start your journey with India's most trusted learning platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6"
                data-testid="final-cta-primary"
              >
                Enroll Now & Save 20%
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                data-testid="final-cta-secondary"
              >
                Talk to Counselor
              </Button>
            </div>
            <p className="text-sm opacity-75">
              Limited time offer • No hidden fees • 30-day money-back guarantee
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-4 left-4 right-4 lg:hidden z-40">
        <Button 
          onClick={onGetStarted}
          className="w-full bg-gradient-to-r from-primary to-blue-600 text-white shadow-2xl"
          size="lg"
          data-testid="mobile-sticky-cta"
        >
          Start Learning Today
        </Button>
      </div>
    </div>
  );
}