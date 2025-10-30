import { useState, useEffect } from "react";
import WelcomePage from "./WelcomePage";
import AuthForms, { type RegisterData } from "./AuthForms";
import Dashboard from "./Dashboard";
import CoursesPage from "./CoursesPage";
import CourseDetailPage from "./CourseDetailPage";
import VideoPlayer from "./VideoPlayer";
import MyCoursesPage from "./MyCoursesPage";
import LMSContentViewer from "./LMSContentViewer";
import EmailVerificationPrompt from "./EmailVerificationPrompt";
import ContactUs from "./ContactUs";
import TermsAndConditions from "./TermsAndConditions";
import RefundPolicy from "./RefundPolicy";
import LinkEmailPassword from "./LinkEmailPassword";
import LiveVideoPlayer from "./LiveVideoPlayer";

import { useAdvancedAuth } from "@/hooks/useAdvancedAuth";

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type AppState = 'welcome' | 'auth' | 'dashboard' | 'all-courses' | 'course-detail' | 'video-player' | 'lms-content' | 'email-verification' | 'contact' | 'terms' | 'refund' | 'link-email' | 'live-class';

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
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>('Course Video');
  const [liveStreamUrl, setLiveStreamUrl] = useState<string>('');
  const [liveCourseName, setLiveCourseName] = useState<string>('');
  const { user, userData, loading, login, register, logout, enrollInCourse, sendEmailVerificationToUser, refreshUser } = useAdvancedAuth();

  useEffect(() => {
      if (user && userData) {
      // Consider user verified if auth emailVerified OR Firestore emailVerified OR provider includes google
      const providerIsGoogle = !!user.providerData?.some(p => p.providerId === 'google.com');
      const firestoreVerified = !!userData.emailVerified;
      if (user.emailVerified || !userData.email || providerIsGoogle || firestoreVerified) {
        setCurrentState('dashboard');
      } else {
        // User logged in but email not verified - show verification prompt
        setCurrentState('email-verification');
      }
      return;
    }

    // If user is signed in but there's no Firestore user doc yet,
    // this is likely a fresh OAuth sign-in (Google). Send them to
    // the registration flow so they can complete profile creation.
    if (user && !userData && !loading) {
      const isGoogle = user.providerData?.some(p => p.providerId === 'google.com');
      if (isGoogle) {
        setCurrentState('auth');
        return;
      }
    }

    if (!loading) {
      setCurrentState('welcome');
    }
  }, [user, userData, loading, user?.emailVerified]);

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
      
      await register({
        name: registerData.name,
        username: registerData.username,
        email: registerData.email,
        phone: registerData.phone,
        class: registerData.class,
        password: registerData.password,
        deviceId: deviceId
      });
    } catch (error) {
      console.error('Registration failed:', error);
      // Re-throw the error so AuthForms can handle it
      throw error;
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
    setCurrentState('all-courses');
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
    // This should only be called after successful payment
    // The payment modal handles the actual enrollment
    try {
      if (!user || !userData) return false;
      
      await enrollInCourse(courseId);
      console.log('Successfully enrolled in:', courseId);
      return true;
    } catch (error) {
      console.error('Enrollment failed:', error);
      return false;
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

  const handleJoinLiveClass = (courseName: string, streamUrl: string) => {
    setLiveCourseName(courseName);
    setLiveStreamUrl(streamUrl);
    setCurrentState('live-class');
  };

  if (currentState === 'welcome') {
    return (
      <WelcomePage 
        onGetStarted={handleGetStarted}
        onContactUs={() => setCurrentState('contact')}
        onTerms={() => setCurrentState('terms')}
        onRefund={() => setCurrentState('refund')}
      />
    );
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
    return (
      <WelcomePage 
        onGetStarted={handleGetStarted}
        onContactUs={() => setCurrentState('contact')}
        onTerms={() => setCurrentState('terms')}
        onRefund={() => setCurrentState('refund')}
      />
    );
  }

  const currentUser: User = {
    name: userData.name,
    username: userData.userName || '',
    class: userData.userClass,
    enrolledCourses: userData.listOfCourses,
    email: userData.email || ''
  };

  if (currentState === 'link-email') {
    return (
      <LinkEmailPassword
        onBack={() => setCurrentState('dashboard')}
      />
    );
  }

  if (currentState === 'dashboard') {
    return (
      <Dashboard
        user={currentUser}
        onLogout={handleLogout}
        onViewCourse={handleViewCourse}
        onEnrollCourse={handleEnrollCourse}
        onViewAllCourses={handleViewAllCourses}
        onViewLMSContent={handleViewLMSContent}
        onLinkEmail={() => setCurrentState('link-email')}
        onJoinLiveClass={handleJoinLiveClass}
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
          setSelectedVideoTitle(videoTitle || 'Course Video');
          setCurrentState('video-player');
        }}
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
        onViewLMSContent={handleViewLMSContent}
        onJoinLiveClass={handleJoinLiveClass}
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
        videoTitle={selectedVideoTitle}
        videoDescription="Learn from our expert instructors with comprehensive course content."
        user={currentUser}
        onBack={() => setCurrentState('lms-content')}
        onLogout={handleLogout}
      />
    );
  }

  if (currentState === 'email-verification') {
    return (
      <EmailVerificationPrompt
        userEmail={userData?.email || ''}
        onBack={handleLogout}
        onResendEmail={sendEmailVerificationToUser}
        onRefresh={refreshUser}
      />
    );
  }

  if (currentState === 'contact') {
    return <ContactUs onBack={() => setCurrentState('welcome')} />;
  }

  if (currentState === 'terms') {
    return <TermsAndConditions onBack={() => setCurrentState('welcome')} />;
  }

  if (currentState === 'refund') {
    return <RefundPolicy onBack={() => setCurrentState('welcome')} />;
  }

  if (currentState === 'live-class') {
    return (
      <LiveVideoPlayer
        streamUrl={liveStreamUrl}
        courseName={liveCourseName}
        onBack={handleBackToDashboard}
        user={currentUser}
      />
    );
  }



  return (
    <WelcomePage 
      onGetStarted={handleGetStarted}
      onContactUs={() => setCurrentState('contact')}
      onTerms={() => setCurrentState('terms')}
      onRefund={() => setCurrentState('refund')}
    />
  );
}