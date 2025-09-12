import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  BookOpen
} from "lucide-react";

interface VideoPlayerProps {
  videoId: string;
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

// todo: remove mock functionality
const mockVideoData = {
  v1: {
    title: "Introduction to Electric Charges",
    subject: "Electrostatics",
    course: "Class 12 Physics",
    duration: "45:30",
    description: "In this comprehensive lecture, we explore the fundamental concepts of electric charges, their properties, and behavior in different materials.",
    // In a real implementation, this would be a secure Google Drive embed URL
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder - would be actual Google Drive embed
    notes: [
      "Electric charge is a fundamental property of matter",
      "There are two types of charges: positive and negative", 
      "Like charges repel, unlike charges attract",
      "Charge is conserved in isolated systems",
      "Conductors vs insulators behavior with charges"
    ]
  }
};

export default function VideoPlayer({ videoId, user, onBack, onLogout, onNextVideo, onPreviousVideo }: VideoPlayerProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(2730); // 45:30 in seconds
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const video = mockVideoData[videoId as keyof typeof mockVideoData];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    console.log(isPlaying ? 'Video paused' : 'Video playing');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    console.log(isMuted ? 'Video unmuted' : 'Video muted');
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseInt(e.target.value) / 100) * duration;
    setCurrentTime(newTime);
    console.log('Seeking to:', formatTime(newTime));
  };

  const skip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(newTime);
    console.log('Skipped to:', formatTime(newTime));
  };

  // Simulate video progress
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, duration]);

  // Hide controls after inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [showControls, isPlaying]);

  if (!video) {
    return <div className="min-h-screen flex items-center justify-center">Video not found</div>;
  }

  return (
    <div className={`min-h-screen bg-background ${darkMode ? 'dark' : ''}`}>
      {/* Top Navigation */}
      <nav className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Course
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
                  Video Info
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium">{video.course}</div>
                    <div className="text-xs text-muted-foreground">{video.subject}</div>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <div className="text-sm font-bold text-primary">{video.duration}</div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Key Points
                </h3>
                <div className="space-y-2">
                  {video.notes.map((note, index) => (
                    <div key={index} className="text-xs p-2 bg-muted rounded text-muted-foreground">
                      • {note}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Navigation
                </h3>
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={onPreviousVideo}
                    disabled={!onPreviousVideo}
                    data-testid="button-previous-video"
                  >
                    <SkipBack className="h-4 w-4 mr-3" />
                    Previous Video
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={onNextVideo}
                    disabled={!onNextVideo}
                    data-testid="button-next-video"
                  >
                    <SkipForward className="h-4 w-4 mr-3" />
                    Next Video
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
        <div className="flex-1 md:ml-0">
          {/* Video Player Container */}
          <div 
            ref={containerRef}
            className="relative bg-black"
            onMouseMove={() => setShowControls(true)}
            data-testid="video-container"
          >
            {/* Watermark */}
            <div className="absolute top-4 right-4 z-30 bg-black/50 text-white px-3 py-1 rounded text-sm font-medium">
              {user.username}
            </div>
            
            {/* Video Element */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {/* Placeholder for actual video */}
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    {isPlaying ? (
                      <Pause className="h-12 w-12 text-white" />
                    ) : (
                      <Play className="h-12 w-12 text-white" />
                    )}
                  </div>
                  <p className="text-lg font-medium">{video.title}</p>
                  <p className="text-sm text-gray-300 mt-2">Secure Video Player</p>
                  <p className="text-xs text-gray-400 mt-1">Download disabled • Right-click disabled</p>
                </div>
              </div>
            </div>

            {/* Video Controls */}
            <div className={`
              absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300
              ${showControls ? 'opacity-100' : 'opacity-0'}
            `}>
              {/* Progress Bar */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={(currentTime / duration) * 100}
                  onChange={handleSeek}
                  className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                  data-testid="video-progress"
                />
              </div>
              
              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => skip(-10)}
                    className="text-white hover:bg-white/20"
                    data-testid="button-skip-back"
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20"
                    data-testid="button-play-pause"
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => skip(10)}
                    className="text-white hover:bg-white/20"
                    data-testid="button-skip-forward"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                    data-testid="button-mute"
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                  
                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-white hover:bg-white/20"
                    data-testid="button-settings"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                    data-testid="button-fullscreen"
                  >
                    <Maximize2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Video Info Section */}
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="secondary">{video.subject}</Badge>
                  <Badge variant="outline">{video.course}</Badge>
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">{video.title}</h1>
                <p className="text-muted-foreground">{video.description}</p>
              </div>

              {/* Security Notice */}
              <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-yellow-500 rounded-full flex-shrink-0 mt-0.5"></div>
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                        Protected Content
                      </h3>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        This video is protected and cannot be downloaded, shared, or recorded. 
                        Your username is watermarked for security purposes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}