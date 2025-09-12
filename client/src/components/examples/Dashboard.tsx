import Dashboard from '../Dashboard'

export default function DashboardExample() {
  const mockUser = {
    name: "Priya Sharma",
    username: "priya_sharma",
    class: "12",
    enrolledCourses: ["class-12-physics"]
  };

  return (
    <Dashboard 
      user={mockUser}
      onLogout={() => console.log('Logout clicked')}
      onViewCourse={(courseId) => console.log('View course:', courseId)}
      onEnrollCourse={(courseId) => console.log('Enroll course:', courseId)}
    />
  )
}