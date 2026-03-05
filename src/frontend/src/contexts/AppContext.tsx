import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  INITIAL_MID_MARKS,
  MOCK_STUDENTS,
  MOCK_SUBJECTS,
} from "../data/mockData";
import type { Mark, MidMarks, SessionUser, Student, Subject } from "../types";

interface AppContextValue {
  session: SessionUser | null;
  login: (user: SessionUser) => void;
  logout: () => void;

  // Data
  allMarks: MidMarks[];
  students: Student[];
  subjects: Subject[];

  // Marks operations
  createOrUpdateMarks: (
    student: Student,
    subject: Subject,
    midExam: string,
    marks: Mark[],
  ) => string;
  submitMarks: (key: string) => void;
  approveMarks: (key: string) => void;
  rejectMarks: (key: string) => void;
  getMarksByKey: (key: string) => MidMarks | undefined;
  getMarksByFilter: (
    branch: string,
    section: string,
    semester: number,
    subjectCode: string,
  ) => MidMarks[];
  getStudentsByFilter: (
    branch: string,
    section: string,
    semester: number,
  ) => Student[];
  getSubjectsByFilter: (branch: string, semester: number) => Subject[];
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionUser | null>(() => {
    try {
      const stored = localStorage.getItem("vemu_session");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [allMarks, setAllMarks] = useState<MidMarks[]>(INITIAL_MID_MARKS);
  const [students] = useState<Student[]>(MOCK_STUDENTS);
  const [subjects] = useState<Subject[]>(MOCK_SUBJECTS);

  const login = useCallback((user: SessionUser) => {
    localStorage.setItem("vemu_session", JSON.stringify(user));
    setSession(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("vemu_session");
    setSession(null);
  }, []);

  const createOrUpdateMarks = useCallback(
    (
      student: Student,
      subject: Subject,
      midExam: string,
      marks: Mark[],
    ): string => {
      const key = `${student.rollNumber}_${subject.code}_${midExam}`;
      setAllMarks((prev) => {
        const existing = prev.find((m) => m.key === key);
        if (existing) {
          return prev.map((m) =>
            m.key === key ? { ...m, marks, status: "Draft" as const } : m,
          );
        }
        const newEntry: MidMarks = {
          key,
          student,
          subject,
          midExam,
          status: "Draft",
          marks,
        };
        return [...prev, newEntry];
      });
      return key;
    },
    [],
  );

  const submitMarks = useCallback((key: string) => {
    setAllMarks((prev) =>
      prev.map((m) =>
        m.key === key ? { ...m, status: "Submitted" as const } : m,
      ),
    );
  }, []);

  const approveMarks = useCallback((key: string) => {
    setAllMarks((prev) =>
      prev.map((m) =>
        m.key === key ? { ...m, status: "Approved" as const } : m,
      ),
    );
  }, []);

  const rejectMarks = useCallback((key: string) => {
    setAllMarks((prev) =>
      prev.map((m) => (m.key === key ? { ...m, status: "Draft" as const } : m)),
    );
  }, []);

  const getMarksByKey = useCallback(
    (key: string) => allMarks.find((m) => m.key === key),
    [allMarks],
  );

  const getMarksByFilter = useCallback(
    (branch: string, section: string, semester: number, subjectCode: string) =>
      allMarks.filter(
        (m) =>
          m.student.branch === branch &&
          m.student.section === section &&
          m.student.semester === semester &&
          m.subject.code === subjectCode,
      ),
    [allMarks],
  );

  const getStudentsByFilter = useCallback(
    (branch: string, section: string, semester: number) =>
      students.filter(
        (s) =>
          s.branch === branch &&
          s.section === section &&
          s.semester === semester,
      ),
    [students],
  );

  const getSubjectsByFilter = useCallback(
    (branch: string, semester: number) =>
      subjects.filter((s) => s.branch === branch && s.semester === semester),
    [subjects],
  );

  return (
    <AppContext.Provider
      value={{
        session,
        login,
        logout,
        allMarks,
        students,
        subjects,
        createOrUpdateMarks,
        submitMarks,
        approveMarks,
        rejectMarks,
        getMarksByKey,
        getMarksByFilter,
        getStudentsByFilter,
        getSubjectsByFilter,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
