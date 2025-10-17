import { collection, doc, getDocs, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Course, Subject, Chapter, Lecture } from '../../../shared/firebaseTypes';

export const firebaseContentService = {
  async getAllCourses(): Promise<Course[]> {
    try {
      console.log('Fetching courses from Firestore...');
      const snapshot = await getDocs(collection(db, 'courses'));
      console.log('Courses snapshot size:', snapshot.size);
      const courses = snapshot.docs.map(doc => {
        const data = doc.data() as Course;
        console.log('Course data:', { id: doc.id, ...data });
        return {
          ...data,
          id: doc.id
        };
      });
      return courses;
    } catch (error) {
      console.error('Error fetching all courses:', error);
      return [];
    }
  },

  async getCoursesByClass(classValue: string): Promise<Course[]> {
    try {
      const snapshot = await getDocs(collection(db, 'courses'));
      const courses = snapshot.docs
        .map(doc => ({ ...doc.data() as Course, id: doc.id }))
        .filter(course => course.name?.includes(classValue) || course.clas === classValue);
      return courses;
    } catch (error) {
      console.error(`Error fetching courses by class ${classValue}:`, error);
      return [];
    }
  },

  async getCourseById(courseId: string): Promise<Course | null> {
    try {
      const snapshot = await getDoc(doc(db, 'courses', courseId));
      if (snapshot.exists()) {
        return { ...snapshot.data() as Course, id: snapshot.id };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching course by ID ${courseId}:`, error);
      return null;
    }
  },

  async getSubjectsByCourseId(courseId: string): Promise<Subject[]> {
    try {
      console.log('Fetching subjects for course:', courseId);
      const snapshot = await getDocs(collection(db, 'courses', courseId, 'subjects'));
      console.log('Subjects snapshot size:', snapshot.size);
      const subjects = snapshot.docs.map(doc => {
        const data = doc.data() as Subject;
        console.log('Subject data:', { id: doc.id, ...data });
        return {
          ...data,
          id: doc.id
        };
      });
      return subjects;
    } catch (error) {
      console.error(`Error fetching subjects for course ${courseId}:`, error);
      return [];
    }
  },

  async getChaptersBySubjectId(courseId: string, subjectId: string): Promise<Chapter[]> {
    try {
      const snapshot = await getDocs(collection(db, 'courses', courseId, 'subjects', subjectId, 'chapters'));
      return snapshot.docs.map(doc => ({
        ...doc.data() as Chapter,
        id: doc.id
      }));
    } catch (error) {
      console.error(`Error fetching chapters for ${courseId}/${subjectId}:`, error);
      return [];
    }
  },

  async getLecturesByChapterId(courseId: string, subjectId: string, chapterId: string): Promise<Lecture[]> {
    try {
      const snapshot = await getDocs(collection(db, 'courses', courseId, 'subjects', subjectId, 'chapters', chapterId, 'lectures'));
      return snapshot.docs.map(doc => ({
        ...doc.data() as Lecture,
        id: doc.id
      }));
    } catch (error) {
      console.error(`Error fetching lectures for ${courseId}/${subjectId}/${chapterId}:`, error);
      return [];
    }
  }
};