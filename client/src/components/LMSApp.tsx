import { useState } from "react";
import WelcomeHero from "./WelcomeHero";
import AuthForms, { type RegisterData } from "./AuthForms";
import Dashboard from "./Dashboard";
import CoursesPage from "./CoursesPage";
import CourseDetailPage from "./CourseDetailPage";
import VideoPlayer from "./VideoPlayer";

type AppState = 'welcome' | 'auth' | 'dashboard' | 'courses' | 'course-detail' | 'video-player';

interface User {
  name: string;
  username: string;
  class: string;
  enrolledCourses: string[];
}

export default function LMSApp() {
  const [currentState, setCurrentState] = useState<AppState>('welcome');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');

  // todo: remove mock functionality
  const mockUser: User = {
    name: "Priya Sharma", 
    username: "priya_sharma",
    class: "12",
    enrolledCourses: ["class-12-physics"]
  };

  const handleGetStarted = () => {
    setCurrentState('auth');
  };

  const handleBackToWelcome = () => {
    setCurrentState('welcome');
  };

  const handleLogin = (username: string, password: string) => {
    console.log('Login attempt:', { username, password });
    // todo: remove mock functionality - implement real authentication
    setCurrentUser(mockUser);
    setCurrentState('dashboard');
  };

  const handleRegister = (userData: RegisterData) => {
    console.log('Registration successful:', userData);
    // todo: remove mock functionality - implement real registration
    const newUser: User = {
      name: userData.name,
      username: userData.username,
      class: userData.class,
      enrolledCourses: []
    };
    setCurrentUser(newUser);
    setCurrentState('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentState('welcome');
  };

  const handleViewCourses = () => {
    setCurrentState('courses');
  };

  const handleViewCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentState('course-detail');
  };

  const handleEnrollCourse = (courseId: string) => {
    console.log('Enrollment request for course:', courseId);
    // todo: remove mock functionality - implement real enrollment
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        enrolledCourses: [...currentUser.enrolledCourses, courseId]
      });
    }
  };

  const handlePlayVideo = (videoId: string) => {
    setSelectedVideoId(videoId);
    setCurrentState('video-player');
  };

  const handleBackToDashboard = () => {
    setCurrentState('dashboard');
  };

  const handleBackToCourses = () => {
    setCurrentState('courses');
  };

  const handleBackToCourseDetail = () => {
    setCurrentState('course-detail');
  };

  if (currentState === 'welcome') {
    return <WelcomeHero onGetStarted={handleGetStarted} />;
  }

  if (currentState === 'auth') {
    return (
      <AuthForms
        onLogin={handleLogin}
        onRegister={handleRegister}
        onBack={handleBackToWelcome}
      />
    );
  }

  if (!currentUser) {
    return <WelcomeHero onGetStarted={handleGetStarted} />;
  }

  if (currentState === 'dashboard') {
    return (
      <Dashboard
        user={currentUser}
        onLogout={handleLogout}
        onViewCourse={handleViewCourse}
        onEnrollCourse={handleEnrollCourse}
      />
    );
  }

  if (currentState === 'courses') {
    return (
      <CoursesPage
        user={currentUser}
        onBack={handleBackToDashboard}
        onLogout={handleLogout}
        onViewCourseDetail={handleViewCourse}
        onEnrollCourse={handleEnrollCourse}
      />
    );
  }

  if (currentState === 'course-detail') {
    return (
      <CourseDetailPage
        courseId={selectedCourseId}
        user={currentUser}
        onBack={handleBackToCourses}
        onLogout={handleLogout}
        onPlayVideo={handlePlayVideo}
      />
    );
  }

  if (currentState === 'video-player') {
    return (
      <VideoPlayer
        videoId={selectedVideoId}
        user={currentUser}
        onBack={handleBackToCourseDetail}
        onLogout={handleLogout}
        onNextVideo={() => console.log('Next video')}
        onPreviousVideo={() => console.log('Previous video')}
      />
    );
  }

  return <WelcomeHero onGetStarted={handleGetStarted} />;
}