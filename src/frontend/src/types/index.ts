export type AppRole = "HOD" | "ClassTeacher" | "SubjectFaculty" | "Student";

export type MarkStatus = "Draft" | "Submitted" | "Approved";

export interface SessionUser {
  username: string;
  role: AppRole;
  rollNumber?: string;
  branch?: string;
  section?: string;
}

export interface Student {
  rollNumber: string;
  name: string;
  course: string;
  branch: string;
  semester: number;
  section: string;
}

export interface Subject {
  code: string;
  name: string;
  branch: string;
  semester: number;
}

export interface Mark {
  markType: string; // "Q1" | "Q2" | "Q3" | "Assignment"
  markValue: number;
  markQuestion: string;
}

export interface MidMarks {
  key: string;
  marks: Mark[];
  status: MarkStatus;
  subject: Subject;
  midExam: string; // "Mid1" | "Mid2"
  student: Student;
}

export interface MarksEntryRow {
  student: Student;
  q1: string;
  q2: string;
  q3: string;
  assignment: string;
  errors: Record<string, string>;
  existingKey?: string;
  status?: MarkStatus;
}

export interface FinalMarksCalculation {
  mid1Total: number | null;
  mid2Total: number | null;
  bestMid: number | null;
  otherMid: number | null;
  finalMarks: number | null;
}
