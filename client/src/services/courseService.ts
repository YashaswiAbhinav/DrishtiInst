import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
    return {
      id: courseId,
      name: courseId,
      description: `Complete ${courseId} course with comprehensive coverage`,
      totalVideos: 0,
      totalDuration: "0 hours",
      students: Math.floor(Math.random() * 1000) + 500,
      subjects: [],
    };
  },

  async enrollUserInCourse(userId: string, courseName: string) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        listOfCourses: arrayUnion(courseName)
      });
      return { success: true };
    } catch (error) {
      console.error('Error enrolling user:', error);
      throw error;
    }
  },

  // Mock payment functions (replace with actual Razorpay integration)
  async createPaymentOrder(courseName: string, userEmail: string) {
    const amount = this.coursePricing[courseName as keyof typeof this.coursePricing];
    
    if (!amount) {
      throw new Error("Invalid course name");
    }

    const orderId = `order_${Date.now()}`;
    
    return {
      orderId,
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      courseName,
      price: amount,
    };
  },

  async verifyPayment(courseName: string, razorpayPaymentId: string) {
    // Mock verification - replace with actual Razorpay verification
    return {
      success: true,
      message: "Payment verified successfully",
      courseName,
      paymentId: razorpayPaymentId,
    };
  }
};