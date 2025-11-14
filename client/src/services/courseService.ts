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
    return snapshot.docs.map(doc => ({ 
      ...doc.data(), 
      id: doc.id,
      documentId: doc.id // Add explicit documentId field
    }));
  },

  async getCoursePricing() {
    const snapshot = await getDocs(collection(db, 'courses'));
    const pricing: Record<string, number> = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      pricing[data.clas] = data.price;
      pricing[doc.id] = data.price; // Also map by document ID
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
      // Get course document ID from clas field
      const courseId = await this.getCourseIdByName(courseName);
      
      // Update user's enrolled courses with document ID
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        listOfCourses: arrayUnion(courseId)
      });
      
      // Create enrollment record
      await addDoc(collection(db, 'enrollments'), {
        userId,
        courseId,
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

  async getCourseByDocumentId(documentId: string) {
    const docRef = doc(db, 'courses', documentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Course not found');
    }
    
    return { ...docSnap.data(), id: docSnap.id };
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
    
    // Pass the actual course name to VPS server for proper enrollment
    const vpsCourseName = courseName;
    
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