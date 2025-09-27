import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize2,
  ArrowLeft,
  Bell,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Settings,
  SkipBack,
  SkipForward,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  Share,
  Download,
  Clock,
  Eye,
  Video,
  FileText
} from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  user: {
    name: string;
    username: string;
    class: string;
  };
  onBack: () => void;
  onLogout: () => void;
  onNextVideo?: () => void;
  onPreviousVideo?: () => void;
}

// Mock related videos data
const mockRelatedVideos = [
  { id: '1', title: 'Units and Measurements - L2 SI Units', duration: '42:15', views: '1.2K', thumbnail: '/api/placeholder/160/90' },
  { id: '2', title: 'Units and Measurements - L3 Dimensional Analysis', duration: '38:20', views: '980', thumbnail: '/api/placeholder/160/90' },
  { id: '3', title: 'Motion - L1 Types of Motion', duration: '45:30', views: '1.5K', thumbnail: '/api/placeholder/160/90' },
  { id: '4', title: 'Motion - L2 Uniform Motion', duration: '40:10', views: '1.1K', thumbnail: '/api/placeholder/160/90' },
  { id: '5', title: 'Force and Laws - L1 Newton\'s Laws', duration: '50:25', views: '2.1K', thumbnail: '/api/placeholder/160/90' },
];

const mockNotes = [
  'Introduction to fundamental units and derived units',
  'Understanding the SI system of measurement',
  'Conversion between different unit systems',
  'Significant figures and their importance',
  'Error analysis in measurements'
];

export default function VideoPlayer({ videoUrl, user, onBack, onLogout, onNextVideo, onPreviousVideo }: VideoPlayerProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  
  const videoRef = useRef<HTMLIFrameElement>(null);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLike = () => {
    setLiked(!liked);
    if (disliked) setDisliked(false);
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <nav className="bg-white border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Drishti Institute</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex gap-6 p-6 max-w-7xl mx-auto">
        {/* Left Column - Video Player */}
        <div className="flex-1 space-y-4">
          {/* Video Player */}
          <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
            <div className="absolute top-3 right-3 z-10 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
              {user.username}
            </div>
            
            <div className="aspect-video">
              {videoUrl ? (
                <iframe
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Course Video"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <div className="text-center">
                    <Play className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No Video Selected</p>
                    <p className="text-sm text-gray-400 mt-2">Please select a video to play</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Video Info */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Units and Measurements - L1 Introduction
            </h1>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>1,234 views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>2 days ago</span>
                </div>
                <Badge variant="secondary">Class 9 Physics</Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant={liked ? "default" : "outline"} 
                  size="sm"
                  onClick={handleLike}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {liked ? '124' : '123'}
                </Button>
                <Button 
                  variant={disliked ? "default" : "outline"} 
                  size="sm"
                  onClick={handleDislike}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  {disliked ? '3' : '2'}
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
            
            <div className="border-t my-4" />
            
            <div className="flex items-start space-x-3">
              <Avatar>
                <AvatarFallback>DI</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Drishti Institute</h3>
                <p className="text-sm text-gray-600 mb-2">Physics Department</p>
                <p className="text-sm text-gray-700">
                  In this comprehensive lecture, we explore the fundamental concepts of units and measurements, 
                  covering the SI system, dimensional analysis, and error calculations essential for physics studies.
                </p>
              </div>
            </div>
          </div>

          {/* Lecture Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 mr-2" />
                Lecture Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockNotes.map((note, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{note}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Related Videos */}
        <div className="w-80 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Up Next</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockRelatedVideos.map((video, index) => (
                <div key={video.id} className="flex space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-14 bg-gray-200 rounded flex items-center justify-center">
                      <Video className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                      {video.title}
                    </h4>
                    <p className="text-xs text-gray-600">Drishti Institute</p>
                    <p className="text-xs text-gray-500">{video.views} views</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={onPreviousVideo}
                disabled={!onPreviousVideo}
              >
                <SkipBack className="h-4 w-4 mr-2" />
                Previous Lecture
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={onNextVideo}
                disabled={!onNextVideo}
              >
                <SkipForward className="h-4 w-4 mr-2" />
                Next Lecture
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}