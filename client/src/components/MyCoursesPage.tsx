import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Play, Folder, Video, RefreshCw } from 'lucide-react';
import { firebaseContentService } from '@/services/firebaseContentService';
import type { Course, Subject, Chapter, Lecture } from '../../../shared/firebaseTypes';

interface User {
  name: string;
  username: string;
  class: string;
  enrolledCourses: string[];
}

interface MyCoursesPageProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  onPlayVideo: (videoUrl: string) => void;
}

export default function MyCoursesPage({ user, onBack, onLogout, onPlayVideo }: MyCoursesPageProps) {
  const [currentView, setCurrentView] = useState<'courses' | 'subjects' | 'chapters' | 'lectures'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(false);
  const [breadcrumb, setBreadcrumb] = useState<string[]>(['My Courses']);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    setLoading(true);
    try {
      const allCourses = await firebaseContentService.getAllCourses();
      console.log('All courses from Firebase:', allCourses);
      const enrolledCourses = allCourses.filter(course => {
        const isEnrolled = user.enrolledCourses.some(enrolled => 
          course.clas === enrolled
        );
        return isEnrolled;
      });
      console.log('Enrolled courses:', enrolledCourses);
      setCourses(enrolledCourses);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseSubjects = async (course: Course) => {
    setLoading(true);
    try {
      const courseSubjects = await firebaseContentService.getSubjectsByCourseId(course.id!);
      setSubjects(courseSubjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectChapters = async (courseId: string, subject: Subject) => {
    setLoading(true);
    try {
      const subjectChapters = await firebaseContentService.getChaptersBySubjectId(courseId, subject.id!);
      setChapters(subjectChapters);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchChapterLectures = async (courseId: string, subjectId: string, chapter: Chapter) => {
    setLoading(true);
    try {
      const chapterLectures = await firebaseContentService.getLecturesByChapterId(courseId, subjectId, chapter.id!);
      setLectures(chapterLectures);
    } catch (error) {
      console.error('Error fetching lectures:', error);
      setLectures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setCurrentView('subjects');
    setBreadcrumb(['My Courses', course.name]);
    fetchCourseSubjects(course);
  };

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentView('chapters');
    setBreadcrumb(['My Courses', selectedCourse?.name || '', subject.name]);
    fetchSubjectChapters(selectedCourse?.id!, subject);
  };

  const handleChapterClick = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setCurrentView('lectures');
    setBreadcrumb(['My Courses', selectedCourse?.name || '', selectedSubject?.name || '', chapter.name]);
    fetchChapterLectures(selectedCourse?.id!, selectedSubject?.id!, chapter);
  };

  const handleLectureClick = (lecture: Lecture) => {
    if (lecture.videoUrl) {
      onPlayVideo(lecture.videoUrl);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumb = breadcrumb.slice(0, index + 1);
    setBreadcrumb(newBreadcrumb);
    
    if (index === 0) {
      setCurrentView('courses');
    } else if (index === 1) {
      setCurrentView('subjects');
      if (selectedCourse) {
        fetchCourseSubjects(selectedCourse);
      }
    } else if (index === 2) {
      setCurrentView('chapters');
      if (selectedCourse && selectedSubject) {
        fetchSubjectChapters(selectedCourse.id!, selectedSubject);
      }
    }
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
                  if (currentView === 'courses') {
                    fetchEnrolledCourses();
                  } else if (currentView === 'subjects' && selectedCourse) {
                    fetchCourseSubjects(selectedCourse);
                  } else if (currentView === 'chapters' && selectedCourse && selectedSubject) {
                    fetchSubjectChapters(selectedCourse.id!, selectedSubject);
                  } else if (currentView === 'lectures' && selectedCourse && selectedSubject && selectedChapter) {
                    fetchChapterLectures(selectedCourse.id!, selectedSubject.id!, selectedChapter);
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
            {currentView === 'courses' && courses.map((course) => (
              <div key={course.id}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleCourseClick(course)}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <span>{course.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{course.description}</p>
                    <p className="text-sm text-blue-600 mt-2">₹{course.price.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>
            ))}

            {currentView === 'subjects' && subjects.map((subject) => (
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
                  </CardContent>
                </Card>
              </div>
            ))}

            {currentView === 'chapters' && chapters.map((chapter) => (
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
                  </CardContent>
                </Card>
              </div>
            ))}

            {currentView === 'lectures' && lectures.map((lecture) => (
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
                      {lecture.pdfLink && (
                        <p className="text-xs text-blue-500">PDF available</p>
                      )}
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

        {!loading && (
          (currentView === 'subjects' && subjects.length === 0) ||
          (currentView === 'chapters' && chapters.length === 0) ||
          (currentView === 'lectures' && lectures.length === 0)
        ) && (
          <div className="text-center py-12">
            <p className="text-gray-500">No content available</p>
          </div>
        )}

        {currentView === 'courses' && !loading && courses.length === 0 && (
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