import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PaymentModal from "./PaymentModal";
import { 
  BookOpen, 
  Play, 
  Users, 
  Clock,
  ArrowLeft,
  Bell,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  FlaskConical,
  Calculator,
  Atom,
  Dna
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseService } from "@/services/courseService";

interface Course {
    id: string;
    name: string;
    description: string;
    subjects: string[];
    students: number;
    videos: number;
    duration: string;
    price: string;
}

interface CoursesPageProps {
  user: {
    name: string;
    username: string;
    class: string;
    enrolledCourses: string[];
    email?: string;
  };
  onBack: () => void;
  onLogout: () => void;
  onViewCourseDetail: (courseId: string) => void;
  onEnrollCourse: (courseId: string) => void;
}

const getSubjectIcon = (subject: string) => {
  if (subject.toLowerCase().includes('physics') || subject.toLowerCase().includes('mechanics') || subject.toLowerCase().includes('electricity')) {
    return <Atom className="h-5 w-5" />;
  }
  if (subject.toLowerCase().includes('chemistry') || subject.toLowerCase().includes('organic') || subject.toLowerCase().includes('compound')) {
    return <FlaskConical className="h-5 w-5" />;
  }
  if (subject.toLowerCase().includes('maths') || subject.toLowerCase().includes('algebra') || subject.toLowerCase().includes('calculus')) {
    return <Calculator className="h-5 w-5" />;
  }
  if (subject.toLowerCase().includes('biology') || subject.toLowerCase().includes('life') || subject.toLowerCase().includes('genetics')) {
    return <Dna className="h-5 w-5" />;
  }
  return <BookOpen className="h-5 w-5" />;
};

export default function CoursesPage({ user, onBack, onLogout, onViewCourseDetail, onEnrollCourse }: CoursesPageProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeClass, setActiveClass] = useState("12"); // Default to show Class 12 (most popular)
  const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; courseName: string; price: number }>({ isOpen: false, courseName: '', price: 0 });
  const queryClient = useQueryClient();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['all-courses'],
    queryFn: async () => {
      const [coursesData, pricingData] = await Promise.all([
        courseService.getCourses(),
        courseService.getCoursePricing()
      ]);
      
      const courseStats = {
        'Class 9th': { students: 2156, videos: 98, duration: '120 hours' },
        'Class 10th': { students: 3156, videos: 134, duration: '150 hours' },
        'Class 11th': { students: 1924, videos: 156, duration: '180 hours' },
        'Class 12th': { students: 2847, videos: 178, duration: '200 hours' }
      };
      
      return coursesData.map((courseName: string) => ({
        id: courseName,
        name: courseName,
        description: `Complete ${courseName} curriculum with all subjects`,
        subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
        students: courseStats[courseName as keyof typeof courseStats]?.students || 1000,
        videos: courseStats[courseName as keyof typeof courseStats]?.videos || 100,
        duration: courseStats[courseName as keyof typeof courseStats]?.duration || '100 hours',
  price: `₹${pricingData[courseName as keyof typeof pricingData]?.toLocaleString() || '2999'}`
      })) as Course[];
    }
  });

  const { mutate: enrollInCourse } = useMutation({
    mutationFn: async (courseName: string) => {
      // This will be handled by the parent component's onEnrollCourse
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });


  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleEnrollCourse = async (courseName: string, price: number) => {
    // IMPORTANT: Only open payment modal - NO direct enrollment
    console.log('Opening payment modal for:', courseName, 'Price:', price);
    
    // Ensure we never directly enroll - always go through payment
    if (user.enrolledCourses.includes(courseName)) {
      console.log('User already enrolled in:', courseName);
      return;
    }
    
    setPaymentModal({ isOpen: true, courseName, price });
  };

  const handleContinueLearning = (courseId: string) => {
    console.log('Continue learning clicked for course:', courseId);
    console.log('User enrolled courses:', user.enrolledCourses);
    
    // Ensure user is actually enrolled before navigating
    if (!user.enrolledCourses.includes(courseId)) {
      console.error('User not enrolled in course:', courseId);
      return;
    }
    
    // Navigate to course detail / content
    onViewCourseDetail(courseId);
  };

  const coursesByClass = courses?.reduce((acc, course) => {
    const className = course.name.match(/Class (\d+)/)?.[1];
    if (className) {
      if (!acc[className]) {
        acc[className] = [];
      }
      acc[className].push(course);
    }
    return acc;
  }, {} as Record<string, Course[]>);


  return (
    <div className={`min-h-screen bg-background ${darkMode ? 'dark' : ''}`}>
      {/* Top Navigation */}
      <nav className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
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
                <p className="text-sm font-medium">{user.name}</p>
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
                  Browse by Class
                </h3>
                <div className="space-y-2">
                  {coursesByClass && Object.keys(coursesByClass).map((classNum) => (
                    <Button
                      key={classNum}
                      variant={activeClass === classNum ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveClass(classNum)}
                      data-testid={`nav-class-${classNum}`}
                    >
                      <BookOpen className="h-4 w-4 mr-3" />
                      Class {classNum}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Your Learning
                </h3>
                <div className="space-y-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{user.enrolledCourses.length}</div>
                    <div className="text-xs text-muted-foreground">Enrolled Courses</div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Any Class Level</div>
                    <div className="text-xs text-muted-foreground">Available to You</div>
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
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                All Courses Available
              </h1>
              <p className="text-muted-foreground">
                Enroll in any course regardless of your current class level - perfect for advanced learning or foundational review
              </p>
            </div>

            {/* Class Tabs */}
            <Tabs value={activeClass} onValueChange={setActiveClass} className="mb-8">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="9" data-testid="tab-class-9">Class 9</TabsTrigger>
                <TabsTrigger value="10" data-testid="tab-class-10">Class 10</TabsTrigger>
                <TabsTrigger value="11" data-testid="tab-class-11">Class 11</TabsTrigger>
                <TabsTrigger value="12" data-testid="tab-class-12">Class 12</TabsTrigger>
              </TabsList>

              {isLoading && <div>Loading...</div>}
              {coursesByClass && Object.entries(coursesByClass).map(([classNum, courses]) => (
                <TabsContent key={classNum} value={classNum} className="mt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {courses.map((course) => {
                      const isEnrolled = user.enrolledCourses.includes(course.id);

                      return (
                        <Card key={course.id} className="hover-elevate">
                          <CardHeader>
                            <div className="flex items-start justify-between mb-4">
                              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center w-24 h-16">
                                {getSubjectIcon(course.name)}
                              </div>
                              {isEnrolled ? (
                                <Badge variant="default">Enrolled</Badge>
                              ) : (
                                <Badge variant="outline">{course.price}</Badge>
                              )}
                            </div>
                            <CardTitle className="text-xl">{course.name}</CardTitle>
                            <CardDescription>{course.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {/* Subjects */}
                              <div>
                                <h4 className="text-sm font-medium mb-2">Subjects Covered:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {course.subjects.map((subject, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {subject}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Stats */}
                              <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {course.students.toLocaleString()}
                                </div>
                                <div className="flex items-center">
                                  <Play className="h-4 w-4 mr-1" />
                                  {course.videos} videos
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {course.duration}
                                </div>
                              </div>

                              {/* Action Button */}
                              {isEnrolled ? (
                                <Button
                                  onClick={() => handleContinueLearning(course.id)}
                                  className="w-full"
                                  data-testid={`button-view-course-${course.id}`}
                                >
                                  Continue Learning
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => {
                                    const priceNum = parseInt(course.price.replace(/[^0-9]/g, ''));
                                    handleEnrollCourse(course.id, priceNum);
                                  }}
                                  variant="outline"
                                  className="w-full"
                                  data-testid={`button-enroll-course-${course.id}`}
                                >
                                  Enroll Now - {course.price}
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Enrollment Info */}
            <Card className="bg-gradient-to-r from-primary/10 to-blue-50 dark:from-primary/20 dark:to-blue-900/20 border-primary/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-2">
                  Flexible Learning for Every Student
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Students can enroll in any course regardless of their current class level.
                  Perfect for advanced learners or those who need foundational review.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="sm" data-testid="button-contact-admissions">
                    Contact Admissions
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-payment-plans">
                    View Payment Plans
                  </Button>
                </div>
              </CardContent>
            </Card>
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
    </div>
  );
}