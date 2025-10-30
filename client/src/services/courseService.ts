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

  async getCourseIdByName(courseName: string) {
    const q = query(collection(db, 'courses'), where('clas', '==', courseName));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('Course not found');
    }
    
    return snapshot.docs[0].id;
  },

  async createPaymentOrder(courseName: string, userEmail: string, customAmount?: number) {
    console.log('=== createPaymentOrder called ===', { courseName, userEmail, customAmount });
    let amount = customAmount;
    
    // If no custom amount provided, get from Firebase
    if (!amount) {
      const q = query(collection(db, 'courses'), where('clas', '==', courseName));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('Course not found');
      }
      
      const courseData = snapshot.docs[0].data();
      amount = courseData.price;
    }
    
    // Call VPS payment server with actual course name and custom amount
    const baseUrl = (import.meta as any).env.VITE_PAYMENT_SERVER_URL || 'https://payments.drishtinstitute.com';
    const endpoint = `${baseUrl.replace(/\/$/, '')}/api/payment/create-order`;
    
    const { auth } = await import('@/lib/firebase');
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
    
    // Map new course names to VPS-expected format
    const courseNameMapping = {
      'Class_9': 'Class 9th',
      'Class_10': 'Class 10th', 
      'Class_11_Physics': 'Class 11th',
      'Class_11_Chemistry': 'Class 11th',
      'Class_11_Maths': 'Class 11th',
      'Class_12_Physics': 'Class 12th',
      'Class_12_Chemistry': 'Class 12th',
      'Class_12_Maths': 'Class 12th'
    };
    
    const vpsCourseName = courseNameMapping[courseName] || courseName;
    
    const payload = { 
      courseName: vpsCourseName, 
      userEmail,
      customAmount: amount
    };
    
    console.log('Creating payment order with payload:', payload);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Payment order creation failed:', response.status, errorText);
      throw new Error(`Payment order creation failed: ${response.status} - ${errorText}`);
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