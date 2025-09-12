import CoursesPage from '../CoursesPage'

export default function CoursesPageExample() {
  const mockUser = {
    name: "Priya Sharma",
    username: "priya_sharma", 
    class: "12",
    enrolledCourses: ["class-12-physics"]
  };

  return (
    <CoursesPage 
      user={mockUser}
      onBack={() => console.log('Back to dashboard')}
      onLogout={() => console.log('Logout clicked')}
      onViewCourseDetail={(courseId) => console.log('View course detail:', courseId)}
      onEnrollCourse={(courseId) => console.log('Enroll course:', courseId)}
    />
  )
}