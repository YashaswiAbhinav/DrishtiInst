import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, LogOut } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  videoTitle?: string;
  videoDescription?: string;
  user: {
    name: string;
    username: string;
    class: string;
  };
  onBack: () => void;
  onLogout: () => void;
}

export default function VideoPlayer({ videoUrl, videoTitle = "Course Video", videoDescription = "Watch and learn from our expert instructors.", user, onBack, onLogout }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Position watermark randomly every 2 minutes and fade in/out
    const repositionWatermark = () => {
      if (watermarkRef.current) {
        // Position in corners or edges to be less intrusive
        const positions = [
          { left: '5%', top: '5%' },
          { right: '5%', top: '5%' },
          { left: '5%', bottom: '10%' },
          { right: '5%', bottom: '10%' },
          { left: '50%', top: '5%' },
          { left: '50%', bottom: '10%' }
        ];
        const position = positions[Math.floor(Math.random() * positions.length)];
        
        // Apply position
        Object.assign(watermarkRef.current.style, {
          left: position.left || 'auto',
          right: position.right || 'auto',
          top: position.top || 'auto',
          bottom: position.bottom || 'auto',
          opacity: '0.3'
        });
        
        // Fade in briefly every 2 minutes
        setTimeout(() => {
          if (watermarkRef.current) {
            watermarkRef.current.style.opacity = '0.6';
            setTimeout(() => {
              if (watermarkRef.current) {
                watermarkRef.current.style.opacity = '0.15';
              }
            }, 3000); // Show for 3 seconds
          }
        }, 1000);
      }
    };

    repositionWatermark();
    const interval = setInterval(repositionWatermark, 120000); // Every 2 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">Drishti Institute</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Video Player */}
        <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
          {/* Student Name Watermark */}
          <div 
            ref={watermarkRef}
            className="absolute z-20 text-white/40 text-xs font-light pointer-events-none select-none"
            style={{ 
              left: '5%', 
              top: '5%',
              opacity: '0.15',
              transition: 'all 3s ease-in-out',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              fontFamily: 'monospace'
            }}
          >
            {user.name}
          </div>
          
          <div className="aspect-video">
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full"
                controls
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
                style={{ outline: 'none' }}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                  <p className="text-lg font-medium">No Video Selected</p>
                  <p className="text-sm text-gray-400 mt-2">Please select a video to play</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{videoTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {videoDescription}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}