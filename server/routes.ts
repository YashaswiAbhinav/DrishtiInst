import type { Express } from "express";
import { createServer, type Server } from "http";
import { driveService } from "./driveService";
import { paymentService } from "./paymentService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get available courses (all classes)
  app.get('/api/courses', async (req, res) => {
    try {
      const availableCourses = ['Class 9th', 'Class 10th', 'Class 11th', 'Class 12th'];
      res.json({ courses: availableCourses });
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  });

  // Get specific course details from Firebase
  app.get('/api/course/:courseId', async (req, res) => {
    try {
      const { courseId } = req.params;
      
      // This should fetch from Firebase Firestore
      // For now, return a basic structure
      const course = {
        id: courseId,
        name: courseId,
        description: `Complete ${courseId} course with comprehensive coverage`,
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

      const userCourses = Array.isArray(enrolledCourses) ? enrolledCourses : enrolledCourses.split(',');
      const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
      
      if (!rootFolderId) {
        return res.status(500).json({ error: 'Root folder ID not configured' });
      }

      const structure = await driveService.getCompleteStructure(rootFolderId);
      
      // Filter structure to only include enrolled courses
      const enrolledStructure = structure.filter(course => 
        userCourses.some(enrolled => 
          course.name.toLowerCase().includes(enrolled.toString().toLowerCase()) ||
          enrolled.toString().toLowerCase().includes(course.name.toLowerCase())
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
      const availableCourses = ['Class 9th', 'Class 10th', 'Class 11th', 'Class 12th'];
      
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
      const userCourses = Array.isArray(enrolledCourses) ? enrolledCourses : [enrolledCourses];
      const hasAccess = userCourses.some(enrolled => 
        courseName.toLowerCase().includes(enrolled.toString().toLowerCase()) ||
        enrolled.toString().toLowerCase().includes(courseName.toLowerCase())
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
      res.status(500).json({ error: 'Failed to fetch course subjects' });
    }
  });

  // Clear cache endpoint
  app.post('/api/cache/clear', (req, res) => {
    driveService.clearCache();
    res.json({ message: 'Cache cleared successfully' });
  });

  // Payment routes
  app.post('/api/payment/create-order', async (req, res) => {
    try {
      const { courseName, userEmail } = req.body;
      
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
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseName, userEmail } = req.body;
      
      const isValid = paymentService.verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      
      if (isValid) {
        // Payment verified successfully
        res.json({ 
          success: true, 
          message: 'Payment verified successfully',
          courseName,
          paymentId: razorpay_payment_id
        });
      } else {
        res.status(400).json({ error: 'Payment verification failed' });
      }
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
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
