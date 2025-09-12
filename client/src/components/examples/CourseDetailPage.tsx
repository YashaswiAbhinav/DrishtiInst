import CourseDetailPage from '../CourseDetailPage'

export default function CourseDetailPageExample() {
  const mockUser = {
    name: "Priya Sharma",
    username: "priya_sharma",
    class: "12", 
    enrolledCourses: ["class-12-physics"]
  };

  return (
    <CourseDetailPage 
      courseId="class-12-physics"
      user={mockUser}
      onBack={() => console.log('Back to courses')}
      onLogout={() => console.log('Logout clicked')}
      onPlayVideo={(videoId) => console.log('Play video:', videoId)}
    />
  )
}