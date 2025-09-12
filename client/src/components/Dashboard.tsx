import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  };
  onLogout: () => void;
  onViewCourse: (courseId: string) => void;
  onEnrollCourse: (courseId: string) => void;
  onViewAllCourses?: () => void;
}

// todo: remove mock functionality
const mockAnnouncements = [
  {
    id: 1,
    title: "New Chemistry Lab Videos Added",
    content: "Complete practical demonstrations for Class 11 and 12 students are now available.",
    date: "2024-01-15",
    priority: "high"
  },
  {
    id: 2,
    title: "Physics Mock Test Schedule",
    content: "Monthly mock tests for JEE preparation starting from next week.",
    date: "2024-01-14",
    priority: "medium"
  },
  {
    id: 3,
    title: "Holiday Schedule Update",
    content: "Classes will resume on January 20th after the winter break.",
    date: "2024-01-12",
    priority: "low"
  }
];

const mockPopularCourses = [
  {
    id: "class-12-physics",
    name: "Class 12 Physics",
    description: "Complete JEE & Board preparation",
    students: 2847,
    videos: 156,
    duration: "180 hours",
    thumbnail: "/api/placeholder/300/200"
  },
  {
    id: "class-11-chemistry",
    name: "Class 11 Chemistry", 
    description: "Foundation for organic & inorganic chemistry",
    students: 1924,
    videos: 134,
    duration: "160 hours",
    thumbnail: "/api/placeholder/300/200"
  },
  {
    id: "class-10-maths",
    name: "Class 10 Mathematics",
    description: "Board exam preparation with practice tests",
    students: 3156,
    videos: 98,
    duration: "120 hours",
    thumbnail: "/api/placeholder/300/200"
  }
];

export default function Dashboard({ user, onLogout, onViewCourse, onEnrollCourse, onViewAllCourses }: DashboardProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const enrolledCourseDetails = mockPopularCourses.filter(course => 
    user.enrolledCourses.includes(course.id)
  );

  const availableCourses = mockPopularCourses.filter(course => 
    !user.enrolledCourses.includes(course.id)
  );

  const displayCourses = enrolledCourseDetails.length > 0 ? enrolledCourseDetails : availableCourses;

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen bg-background ${darkMode ? 'dark' : ''}`}>
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
                  Navigation
                </h3>
                <div className="space-y-2">
                  <Button variant="secondary" className="w-full justify-start" data-testid="nav-dashboard">
                    <BookOpen className="h-4 w-4 mr-3" />
                    Dashboard
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" data-testid="nav-courses">
                    <Play className="h-4 w-4 mr-3" />
                    My Courses
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" data-testid="nav-progress">
                    <Award className="h-4 w-4 mr-3" />
                    Progress
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
                  <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <div className="text-xs text-muted-foreground">Average Progress</div>
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
            <div className="mb-8">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Latest Update</CardTitle>
                    </div>
                    <Badge variant="default">New</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{mockAnnouncements[0].content}</p>
                  <p className="text-xs text-muted-foreground mt-2">{mockAnnouncements[0].date}</p>
                </CardContent>
              </Card>
            </div>

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
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg mb-4 flex items-center justify-center">
                        <Play className="h-12 w-12 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <CardDescription>{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {course.students.toLocaleString()} students
                          </div>
                          <div className="flex items-center">
                            <Play className="h-4 w-4 mr-1" />
                            {course.videos} videos
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {course.duration}
                        </div>
                        
                        {user.enrolledCourses.includes(course.id) ? (
                          <Button 
                            onClick={() => onViewCourse(course.id)} 
                            className="w-full"
                            data-testid={`button-view-course-${course.id}`}
                          >
                            Continue Learning
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => onEnrollCourse(course.id)} 
                            variant="outline" 
                            className="w-full"
                            data-testid={`button-enroll-course-${course.id}`}
                          >
                            Enroll Now
                          </Button>
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
    </div>
  );
}