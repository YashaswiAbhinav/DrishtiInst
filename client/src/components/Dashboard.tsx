import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import PaymentModal from "./PaymentModal";
import { courseService } from "@/services/courseService";
import { liveStreamService } from "@/services/liveStreamService";
import { 
  BookOpen, 
  Play, 
  Clock, 
  Users, 
  Award,
  Bell,
  LogOut,
  Moon,
  Sun,
  Menu,
  X
} from "lucide-react";

interface DashboardProps {
  user: {
    name: string;
    username: string;
    class: string;
    enrolledCourses: string[];
    email?: string;
  };
  onLogout: () => void;
  onViewCourse: (courseId: string) => void;
  onEnrollCourse: (courseId: string) => void;
  onViewAllCourses?: () => void;
  onViewLMSContent?: () => void;
  onLinkEmail?: () => void;
  onJoinLiveClass?: (courseName: string, streamUrl: string) => void;
}





export default function Dashboard({ 
  user, 
  onLogout, 
  onViewCourse, 
  onEnrollCourse, 
  onViewAllCourses, 
  onViewLMSContent,
  onLinkEmail,
  onJoinLiveClass 
}: DashboardProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pricing, setPricing] = useState<Record<string, number>>({});
  const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; courseName: string; price: number }>({ isOpen: false, courseName: '', price: 0 });
  const [courses, setCourses] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoursePricing();
    fetchCourses();
    fetchLatestAnnouncement();
  }, []);

  const fetchCoursePricing = async () => {
    try {
      const pricing = await courseService.getCoursePricing();
      setPricing(pricing);
    } catch (error) {
      console.error('Error fetching pricing:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const courses = await courseService.getCourses();
      setCourses(courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestAnnouncement = async () => {
    try {
      // No announcements for now
      setAnnouncement(null);
    } catch (error) {
      console.error('Error fetching announcement:', error);
    }
  };

  const allCourses = courses.map(course => ({
    id: course.clas || course.id || course,
    name: course.name || course.clas || course,
    description: course.description || `Complete ${course.name || course.clas || course} course with comprehensive coverage`,
    price: course.price || pricing[course.clas || course] || 2999,
    baseImage: course.baseImage?.[0] || ''
  }));
  
  const enrolledCourseDetails = allCourses.filter(course => 
    user.enrolledCourses.includes(course.id)
  );

  const availableCourses = allCourses.filter(course => 
    !user.enrolledCourses.includes(course.id)
  );

  const displayCourses = enrolledCourseDetails.length > 0 ? enrolledCourseDetails : availableCourses.slice(0, 2);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen bg-background ${darkMode ? 'dark' : ''}`}
    >
      {/* Top Navigation */}
      <nav className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
              data-testid="button-menu-toggle"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">Drishti Institute</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} data-testid="button-theme-toggle">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <div className="text-sm font-medium">{user.name}</div>
                {!user.email && onLinkEmail && (
                  <Button
                    variant="ghost"
                    className="text-xs text-blue-500 p-0 h-auto"
                    onClick={onLinkEmail}
                  >
                    Link email/password
                  </Button>
                )}
               
                <p className="text-xs text-muted-foreground">Class {user.class}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onLogout} data-testid="button-logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          fixed md:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Navigation
                </h3>
                <div className="space-y-2">
                  <Button variant="secondary" className="w-full justify-start" data-testid="nav-dashboard">
                    <BookOpen className="h-4 w-4 mr-3" />
                    Dashboard
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={onViewAllCourses} data-testid="nav-all-courses">
                    <BookOpen className="h-4 w-4 mr-3" />
                    Courses
                  </Button>

                  <Button variant="ghost" className="w-full justify-start" onClick={onViewLMSContent} data-testid="nav-lms-content">
                    <BookOpen className="h-4 w-4 mr-3" />
                    Course Content
                  </Button>

                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{enrolledCourseDetails.length}</div>
                    <div className="text-xs text-muted-foreground">Enrolled Courses</div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 p-6 md:ml-0">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {user.name}!
              </h1>
              <p className="text-muted-foreground">
                Continue your learning journey with Class {user.class} courses
              </p>
            </div>

            {/* Latest Announcement */}
            {announcement && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-8"
              >
                <Card className="border-primary/20 bg-primary/5 hover-elevate">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Bell className="h-5 w-5 text-primary" />
                        </motion.div>
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Badge variant="default">New</Badge>
                      </motion.div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{announcement.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">{announcement.date}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Courses Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center">
                  <BookOpen className="h-6 w-6 mr-2" />
                  {enrolledCourseDetails.length > 0 ? 'Continue Learning' : 'Start Learning'}
                </h2>
                <Button variant="outline" onClick={onViewAllCourses}>
                  View All Courses
                </Button>
              </div>
              
              {enrolledCourseDetails.length === 0 && (
                <div className="text-center mb-6 p-6 bg-gradient-to-r from-primary/10 to-blue-50 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Ready to start your learning journey?</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Explore our comprehensive courses and join thousands of successful students
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {displayCourses.map((course) => (
                  <Card key={course.id} className="hover-elevate">
                    <CardHeader>
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                        {course.baseImage ? (
                          <img 
                            src={course.baseImage} 
                            alt={course.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Play className="h-12 w-12 text-primary" />
                        )}
                      </div>
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <CardDescription>{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">

                        
                        {user.enrolledCourses.includes(course.id) ? (
                          <div className="space-y-2">
                            <Button 
                              onClick={onViewLMSContent} 
                              className="w-full"
                              data-testid={`button-view-course-${course.id}`}
                            >
                              Continue Learning
                            </Button>
                            {liveStreamService.hasLiveStream(course.id) && onJoinLiveClass && (
                              <Button 
                                onClick={async () => {
                                  try {
                                    const streamUrl = await liveStreamService.getLiveStreamUrl(course.id);
                                    if (streamUrl) onJoinLiveClass(course.id, streamUrl);
                                  } catch (error) {
                                    console.error('Failed to get stream URL:', error);
                                    alert('Unable to access live stream. Please ensure you are logged in.');
                                  }
                                }}
                                variant="outline"
                                className="w-full border-red-500 text-red-600 hover:bg-red-50"
                                data-testid={`button-live-class-${course.id}`}
                              >
                                🔴 Join Live Class
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-center">
                              <span className="text-2xl font-bold text-primary">₹{course.price.toLocaleString()}</span>
                            </div>
                            <Button 
                              onClick={() => setPaymentModal({ isOpen: true, courseName: course.id, price: course.price })} 
                              className="w-full"
                              data-testid={`button-enroll-course-${course.id}`}
                            >
                              Enroll Now
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, courseName: '', price: 0 })}
        courseName={paymentModal.courseName}
        price={paymentModal.price}
        userEmail={user.email || ''}
        onPaymentSuccess={(courseName) => {
          console.log('Payment successful for:', courseName, '- Now enrolling user');
          onEnrollCourse(courseName);
          setPaymentModal({ isOpen: false, courseName: '', price: 0 });
        }}
      />
    </motion.div>
  );
}