import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MidMarks {
    marks: Array<Mark>;
    status: MarkStatus;
    creator: Principal;
    subject: Subject;
    midExam: string;
    student: Student;
}
export interface Mark {
    markType: string;
    markValue: bigint;
    markQuestion: string;
}
export interface Subject {
    branch: string;
    semester: bigint;
    code: string;
    name: string;
}
export interface UserProfile {
    branch?: string;
    username: string;
    appRole: AppRole;
    section?: string;
    passwordHash: string;
}
export interface Student {
    branch: string;
    semester: bigint;
    name: string;
    section: string;
    rollNumber: string;
    course: string;
}
export enum AppRole {
    HOD = "HOD",
    ClassTeacher = "ClassTeacher",
    SubjectFaculty = "SubjectFaculty",
    Student = "Student"
}
export enum MarkStatus {
    Approved = "Approved",
    Draft = "Draft",
    Submitted = "Submitted"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addStudent(rollNumber: string, name: string, course: string, branch: string, semester: bigint, section: string, studentPrincipal: Principal | null): Promise<void>;
    addSubject(code: string, name: string, branch: string, semester: bigint): Promise<void>;
    approveMidMarks(key: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createMidMarks(student: Student, subject: Subject, midExam: string): Promise<string>;
    getAllMarks(): Promise<Array<MidMarks>>;
    getAllStudents(): Promise<Array<Student>>;
    getAllSubjects(): Promise<Array<Subject>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMarksByBranchSectionSemesterSubject(branch: string, section: string, semester: bigint, subjectCode: string): Promise<Array<MidMarks>>;
    getMidMarks(key: string): Promise<MidMarks>;
    getStudent(rollNumber: string): Promise<Student>;
    getStudentsByBranchSectionSemester(branch: string, section: string, semester: bigint): Promise<Array<Student>>;
    getSubject(code: string): Promise<Subject>;
    getUserProfilePublic(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    rejectMidMarks(key: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitMidMarks(key: string): Promise<void>;
    updateMidMarks(key: string, newMarks: Array<Mark>): Promise<void>;
}
