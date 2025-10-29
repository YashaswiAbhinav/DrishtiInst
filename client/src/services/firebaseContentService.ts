import { collection, doc, getDocs, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Course, Subject, Chapter, Lecture } from '../../../shared/firebaseTypes';

export const firebaseContentService = {
  async getAllCourses(): Promise<Course[]> {
    try {
      const snapshot = await getDocs(collection(db, 'courses'));
      return snapshot.docs.map(doc => ({ ...doc.data() as Course, id: doc.id }));
    } catch (error) {
      console.error('Error fetching all courses:', error);
      return [];
    }
  },

  async getCoursesByClass(clas: string): Promise<Course[]> {
    try {
      const q = query(collection(db, 'courses'), where('clas', '==', clas));
      const snapshot = await getDocs(q);
      const courses = snapshot.docs.map(doc => ({ ...doc.data() as Course, id: doc.id }));
      return courses;
    } catch (error) {
      console.error(`Error fetching courses by clas ${clas}:`, error);
      return [];
    }
  },

  async getCourseByClas(clas: string): Promise<Course | null> {
    try {
      const q = query(collection(db, 'courses'), where('clas', '==', clas));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { ...doc.data() as Course, id: doc.id };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching course by clas ${clas}:`, error);
      return null;
    }
  },

  async getSubjectsByCourseId(courseId: string): Promise<Subject[]> {
    try {
      const snapshot = await getDocs(collection(db, 'courses', courseId, 'subjects'));
      return snapshot.docs.map(doc => ({ ...doc.data() as Subject, id: doc.id }));
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