import type { Express } from "express";
import { createServer, type Server } from "http";
import express from 'express';
import path from 'path';
import type { firestore } from 'firebase-admin';
import { driveService } from "./driveService";
import { paymentService } from "./paymentService";
import { admin } from './firebaseAdmin';
import { requireAuth, AuthedRequest } from './middleware/auth';

export async function registerRoutes(app: Express): Promise<Server> {
  // Get available courses (all classes)
  app.get('/api/courses', async (req, res) => {
    try {
      const availableCourses = ['Class_9', 'Class_10', 'Class_11_Maths', 'Class_12_Maths', 'Class_11_Physics', 'Class_11_Chemistry', 'Class_12_Physics', 'Class_12_Chemistry'];
      res.json({ courses: availableCourses });
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  });

  // Get specific course details from Firebase by clas
  app.get('/api/course/:clas', async (req, res) => {
    try {
      const { clas } = req.params;
      
      // Fetch from Firebase Firestore using clas field
      const db = admin.firestore();
      const coursesRef = db.collection('courses');
      const snapshot = await coursesRef.where('clas', '==', clas).get();
      
      if (snapshot.empty) {
        return res.status(404).json({ error: 'Course not found' });
      }
      
      const courseDoc = snapshot.docs[0];
      const courseData = courseDoc.data();
      
      const course = {
        id: courseDoc.id,
        ...courseData,
        totalVideos: 0,
        totalDuration: '0 hours',
        students: 0,
        subjects: []
      };
      
      res.json({ course });
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Failed to fetch course details' });
    }
  });

  // Get latest announcement
  app.get('/api/announcements/latest', async (req, res) => {
    try {
      // This should fetch from Firebase Firestore announcements collection
      // For now, return null to indicate no announcements
      res.json({ announcement: null });
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Failed to fetch announcement' });
    }
  });

  // Get enrolled courses content (with access control)
  app.get('/api/my-courses', async (req, res) => {
    try {
      const { enrolledCourses } = req.query;
      if (!enrolledCourses) {
        return res.json({ courses: [] });
      }

      const userCourses: string[] = Array.isArray(enrolledCourses)
        ? (enrolledCourses as string[])
        : (typeof enrolledCourses === 'string' ? enrolledCourses.split(',') : []);
      const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
      
      if (!rootFolderId) {
        return res.status(500).json({ error: 'Root folder ID not configured' });
      }

      const structure = await driveService.getCompleteStructure(rootFolderId);
      
      // Filter structure to only include enrolled courses
      const enrolledStructure = structure.filter((course) =>
        userCourses.some((enrolled) =>
          typeof enrolled === 'string' && (
            course.name.toLowerCase().includes(enrolled.toLowerCase()) ||
            enrolled.toLowerCase().includes(course.name.toLowerCase())
          )
        )
      );
      res.json({ courses: enrolledStructure });
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Failed to fetch enrolled courses' });
    }
  });

  // Enrollment is now handled client-side with Firebase
  app.post('/api/enroll', async (req, res) => {
    try {
      const { courseName } = req.body;
      // This endpoint now just validates the course exists
      const availableCourses = ['Class_9', 'Class_10', 'Class_11_Maths', 'Class_12_Maths', 'Class_11_Physics', 'Class_11_Chemistry', 'Class_12_Physics', 'Class_12_Chemistry'];
      
      if (!availableCourses.includes(courseName)) {
        return res.status(400).json({ error: 'Invalid course name' });
      }

      res.json({ message: 'Course enrollment validated' });
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Failed to validate enrollment' });
    }
  });

  // Get specific folder contents (with access control)
  app.get('/api/folder/:folderId', async (req, res) => {
    try {
      const { folderId } = req.params;
      const { enrolledCourses } = req.query;
      
      // Basic access control - could be enhanced with more sophisticated checks
      if (!enrolledCourses) {
        return res.status(403).json({ error: 'Access denied - no enrolled courses' });
      }

      const contents = await driveService.getFolderContents(folderId);
      res.json({ contents });
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Failed to fetch folder contents' });
    }
  });

  // Get course subjects for a specific class
  app.get('/api/drive/course/:courseName', async (req, res) => {
    try {
      const { courseName } = req.params;
      const { enrolledCourses } = req.query;
      
      // Check if user is enrolled in this course
      const userCoursesCheck: string[] = Array.isArray(enrolledCourses)
        ? (enrolledCourses as string[])
        : (typeof enrolledCourses === 'string' ? [enrolledCourses] : []);
      const hasAccess = userCoursesCheck.some((enrolled) =>
        typeof enrolled === 'string' && (
          courseName.toLowerCase().includes(enrolled.toLowerCase()) ||
          enrolled.toLowerCase().includes(courseName.toLowerCase())
        )
      );
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied - not enrolled in this course' });
      }

      const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
      if (!rootFolderId) {
        return res.status(500).json({ error: 'Root folder ID not configured' });
      }

      const structure = await driveService.getCompleteStructure(rootFolderId);
      const course = structure.find(c => 
        c.name.toLowerCase().includes(courseName.toLowerCase())
      );
      
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      res.json({ subjects: course.children || [] });
    } catch (error) {
      console.error('API Error:', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch course subjects';
      res.status(500).json({ error: message });
    }
  });

  // Clear cache endpoint
  app.post('/api/cache/clear', (req, res) => {
    driveService.clearCache();
    res.json({ message: 'Cache cleared successfully' });
  });

  // Webhook endpoint: must use raw body to verify signature. Mount here before JSON body is consumed.
  app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const signature = req.headers['x-razorpay-signature'] as string | undefined;
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
      if (!signature || !secret) {
        console.warn('Webhook missing signature or secret not configured');
        return res.status(400).send('invalid');
      }

      const payload = req.body as Buffer;
      const expected = require('crypto')
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      if (expected !== signature) {
        console.warn('Webhook signature mismatch');
        return res.status(400).send('invalid signature');
      }

      const bodyJson = JSON.parse(payload.toString('utf8'));
      const event = bodyJson.event;
      console.log('Razorpay webhook event:', event);

      // Handle payment events
      if (event === 'payment.captured' || event === 'payment.authorized') {
        const paymentEntity = bodyJson.payload?.payment?.entity;
        if (paymentEntity && paymentEntity.id) {
          const db = admin.firestore();
          const paymentId = paymentEntity.id;
          const orderId = paymentEntity.order_id;
          const amount = paymentEntity.amount;

          const docRef = db.collection('payments').doc(paymentId);
          await docRef.set({
            razorpayPaymentId: paymentId,
            razorpayOrderId: orderId,
            amount,
            status: paymentEntity.status || event,
            raw: paymentEntity,
            receivedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });

          // Optionally: enroll user based on stored order document
          try {
            const orderDoc = await db.collection('orders').doc(orderId).get();
            if (orderDoc.exists) {
              const orderData = orderDoc.data() || {};
              const uid = orderData.uid;
              const courseName = orderData.courseName;
              if (uid && courseName) {
                const enrollmentRef = db.collection('users').doc(uid).collection('enrollments').doc(courseName);
                await enrollmentRef.set({
                  courseName,
                  enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
                  paymentId
                }, { merge: true });
              }
            }
          } catch (e) {
            console.error('Webhook enrollment error', e);
          }
        }
      }

      return res.status(200).send('ok');
    } catch (err) {
      console.error('Webhook processing error', err);
      return res.status(500).send('error');
    }
  });

  app.post('/api/payment/create-order', requireAuth, async (req, res) => {
    try {
      const { courseName, userEmail } = req.body;
      const uid = (req as AuthedRequest).user?.uid;

      if (!courseName || !userEmail) {
        return res.status(400).json({ error: 'Course name and user email are required' });
      }

      const pricing = paymentService.getCoursePricing();
      const amount = pricing[courseName as keyof typeof pricing];
      if (!amount) {
        return res.status(400).json({ error: 'Invalid course name' });
      }

      const receipt = `course_${courseName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
      const order = await paymentService.createOrder(amount, 'INR', receipt);

      // Persist server-side order mapping for later verification/webhook processing
      try {
        const db = admin.firestore();
        await db.collection('orders').doc(order.id).set({
          orderId: order.id,
          uid: uid || null,
          userEmail,
          courseName,
          amount: order.amount,
          currency: order.currency,
          status: 'created',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.error('Failed to persist order to Firestore', e);
      }

      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        courseName,
        price: amount
      });
    } catch (error) {
      console.error('Payment order creation error:', error);
      res.status(500).json({ error: 'Failed to create payment order' });
    }
  });

  app.post('/api/payment/verify', async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseName } = req.body;
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Missing parameters' });
      }

      const isValid = paymentService.verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      if (!isValid) return res.status(400).json({ error: 'Payment verification failed' });

      const db = admin.firestore();
      const paymentDocRef = db.collection('payments').doc(razorpay_payment_id);

      const txResult = await db.runTransaction(async (tx) => {
        const doc = await tx.get(paymentDocRef);
        if (doc.exists && doc.data()?.status === 'processed') {
          return { alreadyProcessed: true };
        }

        tx.set(paymentDocRef, {
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          signature: razorpay_signature,
          courseName: courseName || null,
          status: 'processed',
          processedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Enroll user if order exists and has uid
        const orderDoc = await tx.get(db.collection('orders').doc(razorpay_order_id));
        if (orderDoc.exists) {
          const orderData = orderDoc.data() || {};
          const uid = orderData.uid;
          const course = orderData.courseName || courseName;
          if (uid && course) {
            const enrollmentRef = db.collection('users').doc(uid).collection('enrollments').doc(course);
            tx.set(enrollmentRef, {
              courseName: course,
              enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
              paymentId: razorpay_payment_id
            }, { merge: true });
          }
        }

        return { alreadyProcessed: false };
      });

      if (txResult.alreadyProcessed) {
        return res.json({ success: true, message: 'already processed' });
      }

      return res.json({ success: true, message: 'payment verified and recorded', paymentId: razorpay_payment_id });
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({ error: 'Payment verification failed' });
    }
  });

  app.get('/api/course-pricing', (req, res) => {
    try {
      const pricing = paymentService.getCoursePricing();
      res.json({ pricing });
    } catch (error) {
      console.error('Error fetching course pricing:', error);
      res.status(500).json({ error: 'Failed to fetch course pricing' });
    }
  });

  // Test endpoint to check Google Drive connection
  app.get('/api/test-drive', async (req, res) => {
    try {
      const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
      if (!rootFolderId) {
        return res.status(500).json({ error: 'Root folder ID not configured' });
      }
      
      const structure = await driveService.getCompleteStructure(rootFolderId);
      
      res.json({ 
        success: true, 
        rootFolderId,
        courses: structure.map(s => ({ name: s.name, childrenCount: s.children?.length || 0 }))
      });
    } catch (error) {
      console.error('Drive test error:', error);
      const message = error instanceof Error ? error.message : 'Drive test failed';
      res.status(500).json({ error: message });
    }
  });

  // Serve images from attached_assets
  app.get('/api/image/:filename', (req, res) => {
    const { filename } = req.params;
    const imagePath = path.join(__dirname, '../attached_assets/generated_images', filename);
    res.sendFile(imagePath);
  });

  const httpServer = createServer(app);
  return httpServer;
}
