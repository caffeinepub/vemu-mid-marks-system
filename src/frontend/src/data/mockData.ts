import type { MidMarks, Student, Subject } from "../types";

export const MOCK_STUDENTS: Student[] = [
  {
    rollNumber: "22B81A0501",
    name: "Anil Kumar",
    course: "B.Tech",
    branch: "CSE",
    semester: 3,
    section: "A",
  },
  {
    rollNumber: "22B81A0502",
    name: "Priya Reddy",
    course: "B.Tech",
    branch: "CSE",
    semester: 3,
    section: "A",
  },
  {
    rollNumber: "22B81A0503",
    name: "Ravi Shankar",
    course: "B.Tech",
    branch: "CSE",
    semester: 3,
    section: "A",
  },
  {
    rollNumber: "22B81A0504",
    name: "Sneha Rao",
    course: "B.Tech",
    branch: "CSE",
    semester: 3,
    section: "A",
  },
  {
    rollNumber: "22B81A0505",
    name: "Kiran Babu",
    course: "B.Tech",
    branch: "CSE",
    semester: 3,
    section: "A",
  },
  {
    rollNumber: "22B81A0506",
    name: "Divya Lakshmi",
    course: "B.Tech",
    branch: "CSE",
    semester: 3,
    section: "B",
  },
  {
    rollNumber: "22B81A0507",
    name: "Suresh Varma",
    course: "B.Tech",
    branch: "CSE",
    semester: 3,
    section: "B",
  },
  {
    rollNumber: "22B81A0508",
    name: "Meena Kumari",
    course: "B.Tech",
    branch: "CSE",
    semester: 3,
    section: "B",
  },
  {
    rollNumber: "22B81A0601",
    name: "Arjun Naidu",
    course: "B.Tech",
    branch: "ECE",
    semester: 3,
    section: "A",
  },
  {
    rollNumber: "22B81A0602",
    name: "Pooja Devi",
    course: "B.Tech",
    branch: "ECE",
    semester: 3,
    section: "A",
  },
];

export const MOCK_SUBJECTS: Subject[] = [
  { code: "CS301", name: "Data Structures", branch: "CSE", semester: 3 },
  { code: "CS302", name: "Computer Organization", branch: "CSE", semester: 3 },
  { code: "CS303", name: "Discrete Mathematics", branch: "CSE", semester: 3 },
  {
    code: "CS304",
    name: "Object Oriented Programming",
    branch: "CSE",
    semester: 3,
  },
  { code: "EC301", name: "Analog Electronics", branch: "ECE", semester: 3 },
  { code: "EC302", name: "Signals and Systems", branch: "ECE", semester: 3 },
];

export const INITIAL_MID_MARKS: MidMarks[] = [
  {
    key: "22B81A0501_CS301_Mid1",
    student: MOCK_STUDENTS[0],
    subject: MOCK_SUBJECTS[0],
    midExam: "Mid1",
    status: "Approved",
    marks: [
      { markType: "Q1", markValue: 8, markQuestion: "Question 1" },
      { markType: "Q2", markValue: 9, markQuestion: "Question 2" },
      { markType: "Q3", markValue: 7, markQuestion: "Question 3" },
      { markType: "Assignment", markValue: 5, markQuestion: "Assignment" },
    ],
  },
  {
    key: "22B81A0501_CS301_Mid2",
    student: MOCK_STUDENTS[0],
    subject: MOCK_SUBJECTS[0],
    midExam: "Mid2",
    status: "Submitted",
    marks: [
      { markType: "Q1", markValue: 7, markQuestion: "Question 1" },
      { markType: "Q2", markValue: 8, markQuestion: "Question 2" },
      { markType: "Q3", markValue: 6, markQuestion: "Question 3" },
      { markType: "Assignment", markValue: 4, markQuestion: "Assignment" },
    ],
  },
  {
    key: "22B81A0502_CS301_Mid1",
    student: MOCK_STUDENTS[1],
    subject: MOCK_SUBJECTS[0],
    midExam: "Mid1",
    status: "Approved",
    marks: [
      { markType: "Q1", markValue: 9, markQuestion: "Question 1" },
      { markType: "Q2", markValue: 8, markQuestion: "Question 2" },
      { markType: "Q3", markValue: 10, markQuestion: "Question 3" },
      { markType: "Assignment", markValue: 5, markQuestion: "Assignment" },
    ],
  },
  {
    key: "22B81A0502_CS301_Mid2",
    student: MOCK_STUDENTS[1],
    subject: MOCK_SUBJECTS[0],
    midExam: "Mid2",
    status: "Draft",
    marks: [
      { markType: "Q1", markValue: 6, markQuestion: "Question 1" },
      { markType: "Q2", markValue: 7, markQuestion: "Question 2" },
      { markType: "Q3", markValue: 5, markQuestion: "Question 3" },
      { markType: "Assignment", markValue: 4, markQuestion: "Assignment" },
    ],
  },
  {
    key: "22B81A0503_CS301_Mid1",
    student: MOCK_STUDENTS[2],
    subject: MOCK_SUBJECTS[0],
    midExam: "Mid1",
    status: "Submitted",
    marks: [
      { markType: "Q1", markValue: 7, markQuestion: "Question 1" },
      { markType: "Q2", markValue: 6, markQuestion: "Question 2" },
      { markType: "Q3", markValue: 8, markQuestion: "Question 3" },
      { markType: "Assignment", markValue: 5, markQuestion: "Assignment" },
    ],
  },
  {
    key: "22B81A0504_CS301_Mid1",
    student: MOCK_STUDENTS[3],
    subject: MOCK_SUBJECTS[0],
    midExam: "Mid1",
    status: "Approved",
    marks: [
      { markType: "Q1", markValue: 10, markQuestion: "Question 1" },
      { markType: "Q2", markValue: 9, markQuestion: "Question 2" },
      { markType: "Q3", markValue: 8, markQuestion: "Question 3" },
      { markType: "Assignment", markValue: 5, markQuestion: "Assignment" },
    ],
  },
  {
    key: "22B81A0505_CS301_Mid1",
    student: MOCK_STUDENTS[4],
    subject: MOCK_SUBJECTS[0],
    midExam: "Mid1",
    status: "Draft",
    marks: [
      { markType: "Q1", markValue: 5, markQuestion: "Question 1" },
      { markType: "Q2", markValue: 6, markQuestion: "Question 2" },
      { markType: "Q3", markValue: 4, markQuestion: "Question 3" },
      { markType: "Assignment", markValue: 3, markQuestion: "Assignment" },
    ],
  },
  {
    key: "22B81A0501_CS302_Mid1",
    student: MOCK_STUDENTS[0],
    subject: MOCK_SUBJECTS[1],
    midExam: "Mid1",
    status: "Approved",
    marks: [
      { markType: "Q1", markValue: 9, markQuestion: "Question 1" },
      { markType: "Q2", markValue: 8, markQuestion: "Question 2" },
      { markType: "Q3", markValue: 7, markQuestion: "Question 3" },
      { markType: "Assignment", markValue: 5, markQuestion: "Assignment" },
    ],
  },
];

export const BRANCHES = ["CSE", "ECE", "EEE", "MECH", "CIVIL"];
export const SECTIONS = ["A", "B", "C", "D"];
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
export const MID_EXAMS = ["Mid1", "Mid2"];
