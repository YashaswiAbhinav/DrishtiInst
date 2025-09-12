import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Trophy, Smartphone } from "lucide-react";
import instituteImage from "@assets/generated_images/Institute_building_exterior_0bc714ad.png";
import teacherImage from "@assets/generated_images/Teacher_founder_professional_headshot_415eeeb9.png";
import studentsImage from "@assets/generated_images/Student_success_group_photo_126f6c66.png";
import appMockupImage from "@assets/generated_images/Mobile_app_advertisement_mockup_19aa6e82.png";

interface WelcomeHeroProps {
  onGetStarted: () => void;
}

export default function WelcomeHero({ onGetStarted }: WelcomeHeroProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation Bar */}
      <nav className="px-6 py-4 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-semibold text-primary">Drishti Institute</span>
          </div>
          <Button onClick={onGetStarted} data-testid="button-login">
            Login
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-16 bg-gradient-to-r from-primary/10 to-blue-100">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${instituteImage})` }}
        ></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-primary mb-6">
            Excellence in Education
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Join thousands of students achieving academic success with our expert faculty and comprehensive courses for Classes 9-12
          </p>
          <Button 
            size="lg" 
            onClick={onGetStarted}
            className="text-lg px-8 py-4"
            data-testid="button-get-started"
          >
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Institute Introduction */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">About Drishti Institute</h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              Established with a vision to provide quality education, Drishti Institute has been nurturing young minds for over a decade. 
              We specialize in comprehensive coaching for Classes 9-12 in Physics, Chemistry, Mathematics, and Biology.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover-elevate">
              <CardContent className="p-6">
                <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Expert Faculty</h3>
                <p className="text-gray-600">Learn from experienced teachers with proven track records</p>
              </CardContent>
            </Card>
            <Card className="text-center hover-elevate">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">10,000+ Students</h3>
                <p className="text-gray-600">Join our growing community of successful learners</p>
              </CardContent>
            </Card>
            <Card className="text-center hover-elevate">
              <CardContent className="p-6">
                <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">95% Success Rate</h3>
                <p className="text-gray-600">Exceptional results in board exams and competitive tests</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Sir Section */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-6">Meet Our Founder</h2>
              <h3 className="text-2xl font-medium text-primary mb-4">Dr. Rajesh Sharma</h3>
              <p className="text-gray-600 mb-4">
                With over 20 years of experience in education, Dr. Sharma has dedicated his life to making quality education accessible to all. 
                A Ph.D. in Physics from IIT Delhi and former professor at prestigious institutions.
              </p>
              <p className="text-gray-600 mb-6">
                His innovative teaching methods and student-centric approach have helped thousands of students achieve their academic goals and secure admissions in top colleges.
              </p>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">20+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">50,000+</div>
                  <div className="text-sm text-gray-600">Students Taught</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">15+</div>
                  <div className="text-sm text-gray-600">Awards Won</div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <img 
                src={teacherImage} 
                alt="Dr. Rajesh Sharma - Founder" 
                className="rounded-lg shadow-lg max-w-sm w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Topper Students Section */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">Our Success Stories</h2>
            <p className="text-lg text-gray-600">Meet some of our top performers who achieved excellence</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <Card className="hover-elevate">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Priya Sharma</h3>
                <p className="text-primary font-medium mb-2">98.2% in Class 12</p>
                <p className="text-gray-600 text-sm">Secured admission in AIIMS Delhi</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Arjun Patel</h3>
                <p className="text-primary font-medium mb-2">96.8% in Class 12</p>
                <p className="text-gray-600 text-sm">IIT Bombay Computer Science</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ananya Singh</h3>
                <p className="text-primary font-medium mb-2">97.4% in Class 12</p>
                <p className="text-gray-600 text-sm">NEET All India Rank 125</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center">
            <img 
              src={studentsImage} 
              alt="Successful students celebrating" 
              className="rounded-lg shadow-lg max-w-2xl w-full"
            />
          </div>
        </div>
      </section>

      {/* Mobile App Advertisement */}
      <section className="px-6 py-16 bg-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-6">
                Download Our Mobile App
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Take your learning on the go with our mobile app. Access all courses, watch lectures, 
                and track your progress anywhere, anytime.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-gray-700">Offline video downloads</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-gray-700">Progress tracking & analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-gray-700">Push notifications for new content</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-gray-700">Interactive quizzes & assessments</span>
                </div>
              </div>
              <div className="flex space-x-4">
                <Button className="flex items-center space-x-2" data-testid="button-android-app">
                  <Smartphone className="h-5 w-5" />
                  <span>Download for Android</span>
                </Button>
                <Button variant="outline" disabled>
                  <span>iOS Coming Soon</span>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <img 
                src={appMockupImage} 
                alt="Drishti Institute Mobile App" 
                className="max-w-sm w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-6 py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4">Ready to Excel in Your Studies?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of successful students and start your journey towards academic excellence today.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={onGetStarted}
            className="text-lg px-8 py-4"
            data-testid="button-cta-get-started"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BookOpen className="h-6 w-6" />
            <span className="text-lg font-semibold">Drishti Institute</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 Drishti Institute. All rights reserved. | Empowering minds, shaping futures.
          </p>
        </div>
      </footer>
    </div>
  );
}