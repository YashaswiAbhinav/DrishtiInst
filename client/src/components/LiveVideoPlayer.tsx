import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import '../styles/video-security.css';

interface LiveVideoPlayerProps {
  streamUrl: string;
  courseName: string;
  onBack: () => void;
  user: {
    name: string;
    enrolledCourses: string[];
  };
}

export default function LiveVideoPlayer({ streamUrl, courseName, onBack, user }: LiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [streamStatus, setStreamStatus] = useState<'checking' | 'waiting' | 'live' | 'error'>('checking');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      setError('Failed to load live stream. Please try again.');
      setIsLoading(false);
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    // Check stream availability first
    const checkStreamAvailability = async () => {
      try {
        const response = await fetch(streamUrl, { method: 'HEAD' });
        if (response.ok) {
          setStreamStatus('live');
          return true;
        } else {
          setStreamStatus('waiting');
          return false;
        }
      } catch (error) {
        setStreamStatus('waiting');
        return false;
      }
    };

    // Load HLS.js for HLS support with authentication
    const loadHLS = async () => {
      try {
        // Check if stream is available first
        const isStreamAvailable = await checkStreamAvailability();
        
        if (!isStreamAvailable) {
          setIsLoading(false);
          // Start polling for stream availability
          const pollInterval = setInterval(async () => {
            const available = await checkStreamAvailability();
            if (available) {
              clearInterval(pollInterval);
              loadHLS(); // Retry loading
            }
          }, 10000); // Check every 10 seconds
          
          // Clear interval after 30 minutes
          setTimeout(() => clearInterval(pollInterval), 30 * 60 * 1000);
          return;
        }

        // Dynamically import HLS.js
        const Hls = (await import('hls.js')).default;
        
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setStreamStatus('live');
            setIsLoading(false);
            video.play();
          });
          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error:', data);
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              setStreamStatus('waiting');
              setError('');
            } else {
              setStreamStatus('error');
              setError('Failed to load video player.');
            }
            setIsLoading(false);
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          video.src = streamUrl;
          video.load();
        } else {
          setStreamStatus('error');
          setError('HLS not supported in this browser.');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load HLS.js:', error);
        setStreamStatus('error');
        setError('Failed to load video player.');
        setIsLoading(false);
      }
    };

    loadHLS();

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
    };
  }, [streamUrl]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold">{courseName} - Live Class</h1>
              <p className="text-gray-400">Welcome, {user.name}</p>
            </div>
          </div>
          <Badge variant="destructive" className="animate-pulse">
            🔴 LIVE
          </Badge>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative live-video-container">
        <video
          ref={videoRef}
          className="w-full h-[70vh] bg-black live-video-player"
          controls={false}
          autoPlay
          muted={isMuted}
          onContextMenu={(e) => e.preventDefault()}
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          onSelectStart={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        />
        <div className="video-security-overlay"></div>

        {/* Loading Overlay */}
        {isLoading && streamStatus === 'checking' && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Checking live stream availability...</p>
            </div>
          </div>
        )}

        {/* Waiting for Stream Overlay */}
        {streamStatus === 'waiting' && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <Card className="bg-blue-900 border-blue-700 text-white">
              <CardContent className="p-6 text-center">
                <div className="animate-pulse rounded-full h-16 w-16 bg-blue-500 mx-auto mb-4 flex items-center justify-center">
                  <Play className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Live Class Not Started Yet</h3>
                <p className="mb-4 text-blue-200">The instructor hasn't started the live session. Please wait...</p>
                <div className="flex items-center justify-center space-x-2 text-sm text-blue-300">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-300"></div>
                  <span>Checking every 10 seconds</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Overlay */}
        {streamStatus === 'error' && error && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <Card className="bg-red-900 border-red-700 text-white">
              <CardContent className="p-6 text-center">
                <p className="mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Custom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Live Class Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Course Details</h3>
              <p className="text-gray-300">Subject: {courseName}</p>
              <p className="text-gray-300">Instructor: Mukesh Sir</p>
              <p className="text-gray-300">Duration: Live Session</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Instructions</h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Keep your audio muted during the session</li>
                <li>• Use chat for questions</li>
                <li>• Recording will be available later</li>
                <li>• Stay engaged and take notes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}