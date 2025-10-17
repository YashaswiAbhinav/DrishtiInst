export interface Course {
  id?: string;
  name: string;
  clas: string;
  courseId: string;
  description: string;
  price: number;
  baseImage: string[];
  startDate: number;
  endDate: number;
}

export interface Subject {
  id?: string;
  name: string;
  subjectID: string;
}

export interface Chapter {
  id?: string;
  name: string;
}

export interface Lecture {
  id?: string;
  name: string;
  videoUrl: string;
  pdfLink?: string;
}