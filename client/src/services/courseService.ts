import { doc, getDoc, updateDoc, arrayUnion, addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const courseService = {


  async getCourses() {
    const snapshot = await getDocs(collection(db, 'courses'));
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  },

  async getCoursePricing() {
    const snapshot = await getDocs(collection(db, 'courses'));
    const pricing: Record<string, number> = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      pricing[data.clas] = data.price;
    });
    return pricing;
  },

  async getCourseDetails(clas: string) {
    const q = query(collection(db, 'courses'), where('clas', '==', clas));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('Course not found');
    }
    
    const courseDoc = snapshot.docs[0];
    const courseData = courseDoc.data();
    
    // Get subjects from subcollection
    const subjectsSnapshot = await getDocs(collection(db, 'courses', courseDoc.id, 'subjects'));
    const subjects = subjectsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    
    return {
      ...courseData,
      id: courseDoc.id,
      subjects
    };
  },

  async enrollUserInCourse(userId: string, courseName: string) {
    try {
      // Update user's enrolled courses
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        listOfCourses: arrayUnion(courseName)
      });
      
      // Create enrollment record
      await addDoc(collection(db, 'enrollments'), {
        userId,
        courseName,
        enrolledAt: new Date(),
        status: 'active'
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error enrolling user:', error);
      throw error;
    }
  },

  async createPaymentOrder(courseName: string, userEmail: string) {
    // Get course price from Firebase
    const q = query(collection(db, 'courses'), where('clas', '==', courseName));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('Course not found');
    }
    
    const courseData = snapshot.docs[0].data();
    const amount = courseData.price;
    
    // Call VPS payment server with actual course name and custom amount
    const baseUrl = (import.meta as any).env.VITE_PAYMENT_SERVER_URL || 'https://payments.drishtinstitute.com';
    const endpoint = `${baseUrl.replace(/\/$/, '')}/api/payment/create-order`;
    
    const { auth } = await import('@/lib/firebase');
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ 
        courseName, 
        userEmail,
        customAmount: amount
      })
    });
    
    if (!response.ok) {
      throw new Error(`Payment order creation failed: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      orderId: data.orderId,
      amount: data.amount,
      currency: data.currency || 'INR',
      courseName,
      price: amount
    };
  },


};