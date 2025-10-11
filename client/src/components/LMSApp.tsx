import { useState, useEffect } from "react";
import WelcomePage from "./WelcomePage";
import AuthForms, { type RegisterData } from "./AuthForms";
import Dashboard from "./Dashboard";
import CoursesPage from "./CoursesPage";
import CourseDetailPage from "./CourseDetailPage";
import VideoPlayer from "./VideoPlayer";
import MyCoursesPage from "./MyCoursesPage";
import LMSContentViewer from "./LMSContentViewer";
import { useAdvancedAuth } from "@/hooks/useAdvancedAuth";
import { testFirebaseConnection } from "@/utils/firebaseTest";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type AppState = 'welcome' | 'auth' | 'dashboard' | 'all-courses' | 'course-detail' | 'video-player' | 'my-courses' | 'lms-content';

interface User {
  name: string;
  username: string;
  class: string;
  enrolledCourses: string[];
  email?: string;
}

export default function LMSApp() {
  const [currentState, setCurrentState] = useState<AppState>('welcome');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>('');
  const { user, userData, loading, login, register, logout } = useAdvancedAuth();

  useEffect(() => {
    // Test Firebase connection on app load
    testFirebaseConnection();
    
    if (user && userData) {
      setCurrentState('dashboard');
    } else if (!loading) {
      setCurrentState('welcome');
    }
  }, [user, userData, loading]);

  const handleGetStarted = () => {
    setCurrentState('auth');
  };

  const handleBackToWelcome = () => {
    setCurrentState('welcome');
  };

  const handleLogin = async (identifier: string, password: string) => {
    try {
      await login(identifier, password);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleRegister = async (registerData: RegisterData) => {
    try {
      // Generate a simple device ID
      const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const result = await register({
        name: registerData.name,
        username: registerData.username,
        email: registerData.email,
        phone: registerData.phone,
        class: registerData.class,
        password: registerData.password,
        deviceId: deviceId
      });
      
      if (result.requiresOTP) {
        // Handle OTP verification if needed
        console.log('OTP verification required');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentState('welcome');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleViewCourses = () => {
    setCurrentState('courses');
  };

  const handleViewMyCourses = () => {
    console.log('handleViewMyCourses called. Setting state to "my-courses"');
    setCurrentState('my-courses');
    console.log('Current state after update:', 'my-courses'); // Log the intended state
  };

  const handleViewLMSContent = () => {
    setCurrentState('lms-content');
  };

  const handleViewCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentState('course-detail');
  };

  const handleViewAllCourses = () => {
    setCurrentState('all-courses');
  };

  const handleEnrollCourse = async (courseId: string) => {
    try {
      if (!user || !userData) return;
      
      // Update user's enrolled courses in Firebase
      const updatedCourses = [...userData.listOfCourses, courseId];
      await updateDoc(doc(db, 'users', user.uid), {
        listOfCourses: updatedCourses
      });
      
      // Update local state
      setUserData({
        ...userData,
        listOfCourses: updatedCourses
      });
      
      console.log('Successfully enrolled in:', courseId);
    } catch (error) {
      console.error('Enrollment failed:', error);
    }
  };

  const handlePlayVideo = (videoUrl: string) => {
    setSelectedVideoUrl(videoUrl);
    setCurrentState('video-player');
  };

  const handleBackToDashboard = () => {
    setCurrentState('dashboard');
  };

  const handleBackToCourses = () => {
    setCurrentState('all-courses');
  };

  const handleBackToCourseDetail = () => {
    setCurrentState('course-detail');
  };

  if (currentState === 'welcome') {
    return <WelcomePage onGetStarted={handleGetStarted} />;
  }



  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !userData) {
    if (currentState === 'auth') {
      return (
        <AuthForms
          onLogin={handleLogin}
          onRegister={handleRegister}
          onBack={handleBackToWelcome}
        />
      );
    }
    return <WelcomePage onGetStarted={handleGetStarted} />;
  }

  const currentUser: User = {
    name: userData.name,
    username: userData.userName || '',
    class: userData.userClass,
    enrolledCourses: userData.listOfCourses,
    email: userData.email || ''
  };

  if (currentState === 'dashboard') {
    return (
      <Dashboard
        user={currentUser}
        onLogout={handleLogout}
        onViewCourse={handleViewCourse}
        onEnrollCourse={handleEnrollCourse}
        onViewAllCourses={handleViewAllCourses}
        onViewMyCourses={handleViewMyCourses}
        onViewLMSContent={handleViewLMSContent}
      />
    );
  }

  if (currentState === 'lms-content') {
    return (
      <LMSContentViewer
        onBack={handleBackToDashboard}
        user={currentUser}
        onPlayVideo={(videoId, videoUrl, videoTitle) => {
          setSelectedVideoUrl(videoUrl);
          setCurrentState('video-player');
        }}
      />
    );
  }

  if (currentState === 'my-courses') {
    return (
      <MyCoursesPage
        user={currentUser}
        onBack={handleBackToDashboard}
        onLogout={handleLogout}
        onPlayVideo={handlePlayVideo}
      />
    );
  }

  if (currentState === 'all-courses') {
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
        videoUrl={selectedVideoUrl}
        user={currentUser}
        onBack={() => setCurrentState('lms-content')}
        onLogout={handleLogout}
        onNextVideo={() => console.log('Next video')}
        onPreviousVideo={() => console.log('Previous video')}
      />
    );
  }

  return <WelcomePage onGetStarted={handleGetStarted} />;
}