import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Play, Folder, Video, RefreshCw } from 'lucide-react';

interface User {
  name: string;
  username: string;
  class: string;
  enrolledCourses: string[];
}

interface DriveItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  modifiedTime: string;
  webViewLink: string;
  embedUrl?: string;
}

interface MyCoursesPageProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  onPlayVideo: (videoUrl: string) => void;
}

export default function MyCoursesPage({ user, onBack, onLogout, onPlayVideo }: MyCoursesPageProps) {
  const [currentView, setCurrentView] = useState<'courses' | 'subjects' | 'chapters' | 'lectures'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<DriveItem | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<DriveItem | null>(null);
  const [items, setItems] = useState<DriveItem[]>([]);
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [breadcrumb, setBreadcrumb] = useState<string[]>(['My Courses']);

  useEffect(() => {
    fetchAvailableCourses();
  }, []);

  const fetchAvailableCourses = async () => {
    try {
      // Only show enrolled courses for this user
      setAvailableCourses(user.enrolledCourses);
    } catch (error) {
      console.error('Error setting available courses:', error);
      setAvailableCourses([]);
    }
  };

  const fetchCourseSubjects = async (courseName: string, clearCache = false) => {
    setLoading(true);
    try {
      if (clearCache) {
        await fetch('/api/cache/clear', { method: 'POST' });
      }
      
      const enrolledCoursesParam = user.enrolledCourses.join(',');
      const response = await fetch(`/api/drive/course/${encodeURIComponent(courseName)}?enrolledCourses=${enrolledCoursesParam}&t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`Access denied: ${response.statusText}`);
      }
      
      const data = await response.json();
      setItems(data.subjects || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolderContents = async (folderId: string, clearCache = false) => {
    setLoading(true);
    try {
      if (clearCache) {
        await fetch('/api/cache/clear', { method: 'POST' });
      }
      
      const enrolledCoursesParam = user.enrolledCourses.join(',');
      const response = await fetch(`/api/drive/folder/${folderId}?enrolledCourses=${enrolledCoursesParam}&t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`Access denied: ${response.statusText}`);
      }
      
      const data = await response.json();
      setItems(data.contents || []);
    } catch (error) {
      console.error('Error fetching folder contents:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseName: string) => {
    setSelectedCourse(courseName);
    setCurrentView('subjects');
    setBreadcrumb(['My Courses', courseName]);
    fetchCourseSubjects(courseName, true); // Clear cache for fresh data
  };

  const handleSubjectClick = (subject: DriveItem) => {
    setSelectedSubject(subject);
    setCurrentView('chapters');
    setBreadcrumb(['My Courses', selectedCourse, subject.name]);
    fetchFolderContents(subject.id, true); // Clear cache for fresh data
  };

  const handleChapterClick = (chapter: DriveItem) => {
    setSelectedChapter(chapter);
    setCurrentView('lectures');
    setBreadcrumb(['My Courses', selectedCourse, selectedSubject?.name || '', chapter.name]);
    fetchFolderContents(chapter.id, true); // Clear cache for fresh data
  };

  const handleLectureClick = (lecture: DriveItem) => {
    if (lecture.embedUrl) {
      onPlayVideo(lecture.embedUrl);
    } else {
      window.open(lecture.webViewLink, '_blank');
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumb = breadcrumb.slice(0, index + 1);
    setBreadcrumb(newBreadcrumb);
    
    if (index === 0) {
      setCurrentView('courses');
      setItems([]);
    } else if (index === 1) {
      setCurrentView('subjects');
      fetchCourseSubjects(selectedCourse);
    } else if (index === 2) {
      setCurrentView('chapters');
      if (selectedSubject) {
        fetchFolderContents(selectedSubject.id);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">My Courses</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  if (currentView === 'subjects' && selectedCourse) {
                    fetchCourseSubjects(selectedCourse, true);
                  } else if (currentView === 'chapters' && selectedSubject) {
                    fetchFolderContents(selectedSubject.id, true);
                  } else if (currentView === 'lectures' && selectedChapter) {
                    fetchFolderContents(selectedChapter.id, true);
                  }
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={onLogout}>Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentView === 'courses' && user.enrolledCourses.map((course) => (
              <div key={course}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleCourseClick(course)}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <span>{course}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Click to view subjects</p>
                  </CardContent>
                </Card>
              </div>
            ))}

            {currentView === 'subjects' && items.map((subject) => (
              <div key={subject.id}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSubjectClick(subject)}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Folder className="h-5 w-5 text-green-600" />
                      <span>{subject.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Click to view chapters</p>
                    <p className="text-xs text-gray-400 mt-2">Updated: {formatDate(subject.modifiedTime)}</p>
                  </CardContent>
                </Card>
              </div>
            ))}

            {currentView === 'chapters' && items.map((chapter) => (
              <div key={chapter.id}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleChapterClick(chapter)}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Folder className="h-5 w-5 text-orange-600" />
                      <span>{chapter.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Click to view lectures</p>
                    <p className="text-xs text-gray-400 mt-2">Updated: {formatDate(chapter.modifiedTime)}</p>
                  </CardContent>
                </Card>
              </div>
            ))}

            {currentView === 'lectures' && items.map((lecture) => (
              <div key={lecture.id}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleLectureClick(lecture)}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Video className="h-5 w-5 text-red-600" />
                      <span className="text-sm">{lecture.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">Updated: {formatDate(lecture.modifiedTime)}</p>
                      <Button size="sm" className="flex items-center space-x-1">
                        <Play className="h-4 w-4" />
                        <span>Play</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {!loading && items.length === 0 && currentView !== 'courses' && (
          <div className="text-center py-12">
            <p className="text-gray-500">No content available</p>
          </div>
        )}

        {currentView === 'courses' && !loading && user.enrolledCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Enrolled Courses</h3>
            <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
            <Button onClick={onBack} variant="outline">
              Go to Dashboard to Enroll
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}