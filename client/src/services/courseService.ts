import { doc, getDoc, updateDoc, arrayUnion, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const courseService = {
  // Course pricing data
  coursePricing: {
    "Class 9th": 2999,
    "Class 10th": 3999,
    "Class 11th": 4999,
    "Class 12th": 5999,
  },

  // Available courses
  availableCourses: ["Class 9th", "Class 10th", "Class 11th", "Class 12th"],

  async getCourses() {
    return this.availableCourses;
  },

  async getCoursePricing() {
    return this.coursePricing;
  },

  async getCourseDetails(courseId: string) {
    // Mock subjects and videos for better demo experience
    const mockSubjects = [
      {
        id: 'physics',
        name: 'Physics',
        description: 'Fundamental concepts of physics',
        videoCount: 25,
        duration: '45 hours',
        videos: Array.from({ length: 25 }, (_, i) => ({
          id: `physics_video_${i + 1}`,
          title: `Physics Lesson ${i + 1}`,
          duration: `${Math.floor(Math.random() * 30) + 10} min`,
          watched: Math.random() > 0.7,
          embedUrl: `https://www.youtube.com/embed/dQw4w9WgXcQ?t=${i * 10}`
        }))
      },
      {
        id: 'chemistry',
        name: 'Chemistry',
        description: 'Chemical reactions and compounds',
        videoCount: 20,
        duration: '35 hours',
        videos: Array.from({ length: 20 }, (_, i) => ({
          id: `chemistry_video_${i + 1}`,
          title: `Chemistry Lesson ${i + 1}`,
          duration: `${Math.floor(Math.random() * 25) + 15} min`,
          watched: Math.random() > 0.8,
          embedUrl: `https://www.youtube.com/embed/dQw4w9WgXcQ?t=${i * 15}`
        }))
      },
      {
        id: 'mathematics',
        name: 'Mathematics',
        description: 'Advanced mathematical concepts',
        videoCount: 30,
        duration: '50 hours',
        videos: Array.from({ length: 30 }, (_, i) => ({
          id: `math_video_${i + 1}`,
          title: `Mathematics Lesson ${i + 1}`,
          duration: `${Math.floor(Math.random() * 35) + 20} min`,
          watched: Math.random() > 0.6,
          embedUrl: `https://www.youtube.com/embed/dQw4w9WgXcQ?t=${i * 20}`
        }))
      }
    ];

    const totalVideos = mockSubjects.reduce((acc, subject) => acc + subject.videoCount, 0);
    const totalHours = mockSubjects.reduce((acc, subject) => acc + parseInt(subject.duration), 0);

    return {
      id: courseId,
      name: courseId,
      description: `Complete ${courseId} course with comprehensive coverage of all subjects`,
      totalVideos,
      totalDuration: `${totalHours} hours`,
      students: Math.floor(Math.random() * 1000) + 500,
      subjects: mockSubjects,
    };
  },

  async enrollUserInCourse(userId: string, courseName: string) {
    try {
      console.log('Enrolling user in course:', { userId, courseName });
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        listOfCourses: arrayUnion(courseName)
      });
      console.log('Successfully enrolled user in course');
      return { success: true };
    } catch (error) {
      console.error('Error enrolling user:', error);
      throw error;
    }
  },

  async createPaymentOrder(courseName: string, userEmail: string) {
  const amount = this.coursePricing[courseName as keyof typeof this.coursePricing];

  if (!amount) {
    throw new Error('Invalid course name');
  }

  // Get the payment server URL from environment
  const baseUrl = (import.meta as any).env.VITE_PAYMENT_SERVER_URL;
  if (!baseUrl) {
    throw new Error('Payment server URL not configured. Set VITE_PAYMENT_SERVER_URL in .env');
  }

  const endpoint = `${baseUrl.replace(/\/$/, '')}/api/payment/create-order`;
  console.log('Creating payment order at:', endpoint);

  // Get Firebase ID token for auth
  const { auth } = await import('@/lib/firebase');
  let headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ courseName, userEmail })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed creating server order: ${response.status} ${text}`);
  }

  const data = await response.json();
  return {
    orderId: data.orderId || data.order?.id,
    amount: data.amount || data.order?.amount,
    currency: data.currency || data.order?.currency,
    courseName,
    price: data.price || amount
  };
},


};