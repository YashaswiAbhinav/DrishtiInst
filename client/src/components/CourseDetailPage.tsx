import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  BookOpen, 
  Play, 
  ArrowLeft,
  Bell,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Clock,
  ChevronDown,
  ChevronRight,
  Users,
  Download,
  Lock
} from "lucide-react";

interface Video {
  id: string;
  title: string;
  duration: string;
  watched: boolean;
  embedUrl?: string;
}

interface Subject {
  id: string;
  name: string;
  description: string;
  videoCount: number;
  duration: string;
  videos: Video[];
}

interface Course {
  id: string;
  name: string;
  description: string;
  totalVideos: number;
  totalDuration: string;
  students: number;
  subjects: Subject[];
}

interface CourseDetailPageProps {
  courseId: string;
  user: {
    name: string;
    username: string;
    class: string;
    enrolledCourses: string[];
  };
  onBack: () => void;
  onLogout: () => void;
  onPlayVideo: (videoUrl: string) => void;
}

export default function CourseDetailPage({ courseId, user, onBack, onLogout, onPlayVideo }: CourseDetailPageProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>(["electrostatics"]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/course/${courseId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCourse(data.course);
      } catch (err) {
        setError("Failed to fetch course data.");
        console.error("Error fetching course data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const isEnrolled = user.enrolledCourses.includes(courseId);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const getProgressPercentage = () => {
    if (!course) return 0;
    const totalVideos = course.subjects.reduce((acc, subject) => acc + subject.videos.length, 0);
    const watchedVideos = course.subjects.reduce((acc, subject) => 
      acc + subject.videos.filter(video => video.watched).length, 0
    );
    return Math.round((watchedVideos / totalVideos) * 100);
  };

  if (!course) {
    return <div className="min-h-screen flex items-center justify-center">Course not found</div>;
  }

  return (
    <div className={`min-h-screen bg-background ${darkMode ? 'dark' : ''}`}>
      {/* Top Navigation */}
      <nav className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Courses
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
                  Course Progress
                </h3>
                <div className="space-y-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{getProgressPercentage()}%</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{course.totalVideos}</div>
                    <div className="text-xs text-muted-foreground">Total Videos</div>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{course.totalDuration}</div>
                    <div className="text-xs text-muted-foreground">Total Duration</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start" disabled data-testid="button-download">
                    <Download className="h-4 w-4 mr-3" />
                    Download Notes
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" disabled data-testid="button-practice">
                    <BookOpen className="h-4 w-4 mr-3" />
                    Practice Tests
                  </Button>
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
          <div className="max-w-5xl mx-auto">
            {/* Course Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-foreground">{course.name}</h1>
                {isEnrolled ? (
                  <Badge variant="default" className="px-3 py-1">Enrolled</Badge>
                ) : (
                  <Badge variant="outline" className="px-3 py-1">Not Enrolled</Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-4">{course.description}</p>
              
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {course.students.toLocaleString()} students
                </div>
                <div className="flex items-center">
                  <Play className="h-4 w-4 mr-1" />
                  {course.totalVideos} videos
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {course.totalDuration}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {isEnrolled && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">Your Progress</h3>
                    <span className="text-sm text-muted-foreground">{getProgressPercentage()}% Complete</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Content */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-6">Course Content</h2>
              
              {course.subjects.map((subject, index) => (
                <Card key={subject.id}>
                  <Collapsible
                    open={expandedSubjects.includes(subject.id)}
                    onOpenChange={() => toggleSubject(subject.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover-elevate" data-testid={`subject-${subject.id}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <span className="text-primary font-semibold">{index + 1}</span>
                            </div>
                            <div>
                              <CardTitle className="text-lg">{subject.name}</CardTitle>
                              <CardDescription>{subject.description}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-sm font-medium">{subject.videoCount} videos</div>
                              <div className="text-xs text-muted-foreground">{subject.duration}</div>
                            </div>
                            {expandedSubjects.includes(subject.id) ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {subject.videos.map((video, videoIndex) => (
                            <div 
                              key={video.id}
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer hover-elevate"
                              onClick={() => isEnrolled && video.embedUrl ? onPlayVideo(video.embedUrl) : undefined}
                              data-testid={`video-${video.id}`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                                  {isEnrolled ? (
                                    video.watched ? (
                                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                    ) : (
                                      <Play className="h-4 w-4" />
                                    )
                                  ) : (
                                    <Lock className="h-4 w-4" />
                                  )}
                                </div>
                                <div>
                                  <div className="text-sm font-medium">{video.title}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Video {videoIndex + 1} • {video.duration}
                                  </div>
                                </div>
                              </div>
                              {video.watched && (
                                <Badge variant="secondary" className="text-xs">Watched</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>

            {/* Enrollment CTA */}
            {!isEnrolled && (
              <Card className="mt-8 bg-primary/5 border-primary/20">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2">Enroll in this course to access all content</h3>
                  <p className="text-muted-foreground mb-4">
                    Get access to all {course.totalVideos} videos, practice tests, and study materials
                  </p>
                  <Button className="px-8" data-testid="button-enroll-now">
                    Enroll Now
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}