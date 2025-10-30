import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PaymentModal from "./PaymentModal";
import PaymentPlanModal from "./PaymentPlanModal";
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
import { liveStreamService } from "@/services/liveStreamService";

interface Course {
    id: string;
    name: string;
    description: string;
    subjects: string[];
    price: string;
    baseImage?: string;
    liveUrl?: string;
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
  onViewLMSContent?: () => void;
  onJoinLiveClass?: (courseName: string, streamUrl: string) => void;
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

export default function CoursesPage({ user, onBack, onLogout, onViewCourseDetail, onEnrollCourse, onViewLMSContent, onJoinLiveClass }: CoursesPageProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeClass, setActiveClass] = useState("12"); // Default to show Class 12 (most popular)
  const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; courseName: string; price: number; paymentType?: string; subscriptionMonths?: number }>({ isOpen: false, courseName: '', price: 0 });
  const [paymentPlanModal, setPaymentPlanModal] = useState<{ isOpen: boolean; courseName: string; baseAmount: number }>({ isOpen: false, courseName: '', baseAmount: 0 });
  const queryClient = useQueryClient();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['all-courses'],
    queryFn: async () => {
      const coursesData = await courseService.getCourses();
      
      return (coursesData || []).map((course: any) => ({
        id: course?.clas || course?.id || '',
        name: course?.name || course?.clas || '',
        description: course?.description || `Complete ${course?.name || course?.clas || 'course'} curriculum`,
        subjects: course?.subjects || ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
        price: `₹${course?.displayPrice?.toLocaleString() || course?.price?.toLocaleString() || '2999'}`,
        baseImage: course?.baseImage?.[0] || '',
        liveUrl: course?.liveUrl || ''
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

  const handleEnrollCourse = async (courseName: string, baseAmount: number) => {
    if (user.enrolledCourses.includes(courseName)) {
      console.log('User already enrolled in:', courseName);
      return;
    }
    
    const isClass11or12 = courseName.includes('Class_11') || courseName.includes('Class_12');
    console.log('Enroll Course - Course:', courseName, 'Base amount:', baseAmount, 'IsClass11or12:', isClass11or12);
    
    if (isClass11or12) {
      setPaymentPlanModal({ isOpen: true, courseName, baseAmount });
    } else {
      // For Class 9/10, use base amount directly
      setPaymentModal({ isOpen: true, courseName, price: baseAmount, paymentType: 'one-time', subscriptionMonths: 12 });
    }
  };

  const handlePlanSelect = (paymentType: 'quarterly' | 'half-yearly' | 'one-time', amount: number, subscriptionMonths: number) => {
    setPaymentPlanModal({ isOpen: false, courseName: '', baseAmount: 0 });
    setPaymentModal({ 
      isOpen: true, 
      courseName: paymentPlanModal.courseName, 
      price: amount, 
      paymentType,
      subscriptionMonths
    });
  };

  const handleContinueLearning = (courseId: string) => {
    console.log('Continue learning clicked for course:', courseId);
    console.log('User enrolled courses:', user.enrolledCourses);
    
    // Ensure user is actually enrolled before navigating
    if (!user.enrolledCourses.includes(courseId)) {
      console.error('User not enrolled in course:', courseId);
      return;
    }
    
    // Navigate to LMS content viewer
    if (onViewLMSContent) {
      onViewLMSContent();
    } else {
      onViewCourseDetail(courseId);
    }
  };

  const coursesByClass = courses?.reduce((acc, course) => {
    let className = '';
    
    // Handle new clas format: Class_9, Class_10, etc.
    if (course.id?.includes('Class_9')) className = '9';
    else if (course.id?.includes('Class_10')) className = '10';
    else if (course.id?.includes('Class_11')) className = '11';
    else if (course.id?.includes('Class_12')) className = '12';
    
    if (className) {
      if (!acc[className]) {
        acc[className] = [];
      }
      acc[className].push(course);
    }
    return acc;
  }, {} as Record<string, Course[]>) || {};


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
                  {Object.keys(coursesByClass).map((classNum) => (
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
              {Object.entries(coursesByClass).map(([classNum, courses]) => (
                <TabsContent key={classNum} value={classNum} className="mt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {courses.map((course) => {
                      const isEnrolled = user.enrolledCourses.includes(course.id);

                      return (
                        <Card key={course.id} className="hover-elevate">
                          <CardHeader>
                            <div className="flex items-start justify-between mb-4">
                              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center w-24 h-16 overflow-hidden">
                                {course.baseImage && course.baseImage.trim() && course.baseImage.startsWith('http') ? (
                                  <img 
                                    src={course.baseImage} 
                                    alt={course.name || 'Course'}
                                    className="w-full h-full object-cover rounded-lg"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  getSubjectIcon(course.name || '')
                                )}
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
                                <h4 className="text-sm font-medium mb-2">Subject:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {(() => {
                                    // Extract subject from course name for Class 11/12
                                    if (course.id.includes('Class_11_') || course.id.includes('Class_12_')) {
                                      const subject = course.id.split('_').pop();
                                      return (
                                        <Badge variant="secondary" className="text-xs">
                                          {subject}
                                        </Badge>
                                      );
                                    }
                                    // For Class 9/10, show all subjects
                                    const subjects = course.subjects || ['Physics', 'Chemistry', 'Mathematics', 'Biology'];
                                    return subjects.map((subject, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {subject}
                                      </Badge>
                                    ));
                                  })()} 
                                </div>
                              </div>



                              {/* Action Button */}
                              {isEnrolled ? (
                                <div className="space-y-2">
                                  <Button
                                    onClick={() => handleContinueLearning(course.id)}
                                    className="w-full"
                                    data-testid={`button-view-course-${course.id}`}
                                  >
                                    Continue Learning
                                  </Button>
                                  <Button 
                                    onClick={() => {
                                      console.log('Live class clicked for:', course.id);
                                      console.log('Course data:', course);
                                      
                                      if (!onJoinLiveClass) {
                                        alert('Live class functionality not available');
                                        return;
                                      }
                                      
                                      // Get liveUrl from course data directly
                                      const liveUrl = course.liveUrl;
                                      
                                      console.log('Live URL from course:', liveUrl);
                                      
                                      if (liveUrl && liveUrl.trim()) {
                                        onJoinLiveClass(course.id, liveUrl.trim());
                                      } else {
                                        alert('No live stream available for this course');
                                      }
                                    }}
                                    variant="outline"
                                    className="w-full border-red-500 text-red-600 hover:bg-red-50"
                                    data-testid={`button-live-class-${course.id}`}
                                  >
                                    🔴 Join Live Class
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  onClick={() => {
                                    // Remove currency symbol and commas, then parse as base amount
                                    const cleanPrice = course.price.replace(/[₹,]/g, '');
                                    const baseAmount = parseInt(cleanPrice);
                                    console.log('CoursesPage - Course:', course.id, 'Price string:', course.price, 'Base amount:', baseAmount);
                                    handleEnrollCourse(course.id, baseAmount);
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

      <PaymentPlanModal
        isOpen={paymentPlanModal.isOpen}
        onClose={() => setPaymentPlanModal({ isOpen: false, courseName: '', baseAmount: 0 })}
        courseName={paymentPlanModal.courseName}
        baseAmount={paymentPlanModal.baseAmount}
        userEmail={user.email || ''}
        onPlanSelect={handlePlanSelect}
      />

      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, courseName: '', price: 0 })}
        courseName={paymentModal.courseName}
        price={paymentModal.price}
        userEmail={user.email || ''}
        paymentType={paymentModal.paymentType}
        subscriptionMonths={paymentModal.subscriptionMonths}
        onPaymentSuccess={(courseName) => {
          console.log('Payment successful for:', courseName, '- Now enrolling user');
          onEnrollCourse(courseName);
          setPaymentModal({ isOpen: false, courseName: '', price: 0 });
        }}
      />
    </div>
  );
}