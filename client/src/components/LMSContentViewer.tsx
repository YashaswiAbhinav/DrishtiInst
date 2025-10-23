import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  BookOpen, 
  Folder, 
  Video, 
  Play,
  RefreshCw,
  Clock,
  Users,
  Star,
  ArrowLeft
} from 'lucide-react';
import { ExternalLink } from 'lucide-react';
import { firebaseContentService } from '@/services/firebaseContentService';
import type { Course, Subject, Chapter, Lecture } from '../../../shared/firebaseTypes';

interface LMSContentViewerProps {
  onBack: () => void;
  onPlayVideo?: (videoId: string, videoUrl: string, videoTitle: string) => void;
  user?: {
    enrolledCourses: string[];
  };
}

interface CourseWithContent extends Course {
  subjects?: (Subject & {
    chapters?: (Chapter & {
      lectures?: Lecture[];
    })[];
  })[];
}

export default function LMSContentViewer({ onBack, onPlayVideo, user }: LMSContentViewerProps) {
  const [courses, setCourses] = useState<CourseWithContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      if (!user || user.enrolledCourses.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }
      
      // Fetch courses from Firebase based on enrolled courses
      const allCourses = await firebaseContentService.getAllCourses();
      console.log('All courses from Firebase:', allCourses);
      const enrolledCourses = allCourses.filter(course => {
        const isEnrolled = user.enrolledCourses.some(enrolled => {
          // Match by clas field: "Class 10th" matches "Class_10"
          const normalizedEnrolled = enrolled.replace(/\s+/g, '_').replace('th', '').replace('st', '').replace('nd', '').replace('rd', '');
          const normalizedClas = course.clas?.replace(/\s+/g, '_');
          return normalizedClas?.toLowerCase() === normalizedEnrolled.toLowerCase();
        });
        console.log(`Course ${course.name} (${course.clas}) enrolled:`, isEnrolled);
        return isEnrolled;
      });
      console.log('Enrolled courses:', enrolledCourses);
      
      // Fetch nested content for each enrolled course
      const coursesWithContent = await Promise.all(
        enrolledCourses.map(async (course) => {
          const subjects = await firebaseContentService.getSubjectsByCourseId(course.id!);
          const subjectsWithContent = await Promise.all(
            subjects.map(async (subject) => {
              const chapters = await firebaseContentService.getChaptersBySubjectId(course.id!, subject.id!);
              const chaptersWithContent = await Promise.all(
                chapters.map(async (chapter) => {
                  const lectures = await firebaseContentService.getLecturesByChapterId(course.id!, subject.id!, chapter.id!);
                  return { ...chapter, lectures };
                })
              );
              return { ...subject, chapters: chaptersWithContent };
            })
          );
          return { ...course, subjects: subjectsWithContent };
        })
      );
      
      setCourses(coursesWithContent);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleLectureClick = (lecture: Lecture) => {
    if (onPlayVideo && lecture.videoUrl) {
      onPlayVideo(lecture.id!, lecture.videoUrl, lecture.name);
    }
  };

  const renderCourseCard = (course: CourseWithContent) => {
    const subjectCount = course.subjects?.length || 0;
    const totalLectures = course.subjects?.reduce((acc, subject) => {
      return acc + (subject.chapters?.reduce((subAcc, chapter) => {
        return subAcc + (chapter.lectures?.length || 0);
      }, 0) || 0);
    }, 0) || 0;

    return (
      <motion.div
        key={course.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="group"
      >
        <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50 group-hover:from-blue-50 group-hover:to-indigo-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-600 rounded-xl text-white group-hover:bg-blue-700 transition-colors">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-900">
                    {course.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Complete course with {subjectCount} subjects
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {totalLectures} lectures
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{Math.floor(Math.random() * 1000) + 500} students</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{Math.floor(totalLectures * 1.5)} hours</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>4.{Math.floor(Math.random() * 3) + 7}</span>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => toggleExpanded(course.id!)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {expandedItems.has(course.id!) ? 'Hide Subjects' : 'View Subjects'}
                <ChevronRight className={`h-4 w-4 ml-2 transition-transform ${
                  expandedItems.has(course.id!) ? 'rotate-90' : ''
                }`} />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <AnimatePresence>
          {expandedItems.has(course.id!) && course.subjects && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 ml-6 space-y-3"
            >
              {course.subjects.map(subject => (
                <div key={subject.id}>
                  {renderSubjectCard(subject, course.name)}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderSubjectCard = (subject: Subject & { chapters?: (Chapter & { lectures?: Lecture[] })[] }, courseName: string) => {
    const chapterCount = subject.chapters?.length || 0;
    const lectureCount = subject.chapters?.reduce((acc, chapter) => {
      return acc + (chapter.lectures?.length || 0);
    }, 0) || 0;

    return (
      <motion.div
        key={subject.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-200 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Folder className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                  <p className="text-sm text-gray-600">{chapterCount} chapters • {lectureCount} lectures</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toggleExpanded(subject.id!)}
              >
                {expandedItems.has(subject.id!) ? 'Hide' : 'Show'} Chapters
              </Button>
            </div>
            
            <AnimatePresence>
              {expandedItems.has(subject.id!) && subject.chapters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 space-y-2"
                >
                  {subject.chapters.map(chapter => (
                    <div key={chapter.id}>
                      {renderChapterCard(chapter, courseName, subject.name)}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderChapterCard = (chapter: Chapter & { lectures?: Lecture[] }, courseName: string, subjectName: string) => {
    const lectureCount = chapter.lectures?.length || 0;

    return (
      <motion.div
        key={chapter.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="border border-orange-200 hover:border-orange-300 transition-colors bg-orange-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Folder className="h-4 w-4 text-orange-600" />
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">{chapter.name}</h4>
                  <p className="text-xs text-gray-600">{lectureCount} lectures</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => toggleExpanded(chapter.id!)}
                className="text-orange-600 hover:text-orange-700"
              >
                {expandedItems.has(chapter.id!) ? 'Hide' : 'Show'} Lectures
              </Button>
            </div>
            
            <AnimatePresence>
              {expandedItems.has(chapter.id!) && chapter.lectures && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 space-y-2"
                >
                  {chapter.lectures.map(lecture => (
                    <motion.div
                      key={lecture.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between p-2 bg-white rounded-lg border hover:shadow-sm transition-all cursor-pointer"
                      onClick={() => handleLectureClick(lecture)}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-red-100 rounded">
                          <Video className="h-3 w-3 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{lecture.name}</p>
                          {lecture.pdfLink && (
                            <p className="text-xs text-blue-500">PDF available</p>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 px-2">
                        <Play className="h-3 w-3 mr-1" />
                        <span className="text-xs">Play</span>
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Loading course content...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center">
                <ExternalLink className="h-5 w-5 mr-2" />
                Error Loading Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">{error}</p>
              <div className="space-x-2">
                <Button onClick={fetchCourses} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                <Button onClick={onBack} variant="secondary">
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack}>
                ← Back
              </Button>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Course Content</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={fetchCourses} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Badge variant="secondary">
                {courses.length} courses
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {courses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-white">
              <CardContent className="text-center py-16">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {!user || user.enrolledCourses.length === 0 ? 'No Enrolled Courses' : 'No Courses Found'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {!user || user.enrolledCourses.length === 0 
                    ? 'You need to enroll in courses first to access content.' 
                    : 'No course content is available. Please check your Google Drive setup.'}
                </p>
                <div className="space-x-2">
                  <Button onClick={onBack} variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                  {user && user.enrolledCourses.length > 0 && (
                    <Button onClick={fetchCourses} className="bg-blue-600 hover:bg-blue-700">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry Loading
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Enrolled Courses</h2>
              <p className="text-gray-600">Access content for courses you're enrolled in</p>
            </motion.div>
            
            <div className="grid gap-6">
              {courses.map(course => (
                <div key={course.id}>
                  {renderCourseCard(course)}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}