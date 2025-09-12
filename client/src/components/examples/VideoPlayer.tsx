import VideoPlayer from '../VideoPlayer'

export default function VideoPlayerExample() {
  const mockUser = {
    name: "Priya Sharma",
    username: "priya_sharma",
    class: "12"
  };

  return (
    <VideoPlayer 
      videoId="v1"
      user={mockUser}
      onBack={() => console.log('Back to course')}
      onLogout={() => console.log('Logout clicked')}
      onNextVideo={() => console.log('Next video')}
      onPreviousVideo={() => console.log('Previous video')}
    />
  )
}