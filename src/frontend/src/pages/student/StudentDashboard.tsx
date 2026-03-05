import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Award,
  BookOpen,
  Eye,
  GraduationCap,
  Info,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";
import { useApp } from "../../contexts/AppContext";
import { MOCK_STUDENTS, MOCK_SUBJECTS } from "../../data/mockData";
import { calculateFinalMarks, getMidTotal } from "../../utils/marks";

const STUDENT_ROLL = "22B81A0501";

export function StudentDashboard() {
  const { allMarks, session } = useApp();

  if (!session) return null;

  const rollNumber = session.rollNumber ?? STUDENT_ROLL;
  const student = MOCK_STUDENTS.find((s) => s.rollNumber === rollNumber);

  if (!student) {
    return (
      <div className="p-6">
        <EmptyState
          title="Student not found"
          description="Your student record could not be found. Please contact the administrator."
          icon="data"
        />
      </div>
    );
  }

  // Get all subjects relevant to this student
  const studentSubjects = MOCK_SUBJECTS.filter(
    (s) => s.branch === student.branch && s.semester === student.semester,
  );

  // Get marks per subject
  const subjectSummaries = studentSubjects.map((subject) => {
    const mid1 = allMarks.find(
      (m) =>
        m.student.rollNumber === rollNumber &&
        m.subject.code === subject.code &&
        m.midExam === "Mid1",
    );
    const mid2 = allMarks.find(
      (m) =>
        m.student.rollNumber === rollNumber &&
        m.subject.code === subject.code &&
        m.midExam === "Mid2",
    );
    const calc = calculateFinalMarks(mid1, mid2);
    return {
      subject,
      mid1,
      mid2,
      calc,
    };
  });

  const completedSubjects = subjectSummaries.filter(
    (s) => s.calc.finalMarks !== null,
  ).length;

  const avgFinal =
    subjectSummaries.filter((s) => s.calc.finalMarks !== null).length > 0
      ? Math.round(
          subjectSummaries
            .filter((s) => s.calc.finalMarks !== null)
            .reduce((sum, s) => sum + (s.calc.finalMarks ?? 0), 0) /
            subjectSummaries.filter((s) => s.calc.finalMarks !== null).length,
        )
      : null;

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm text-muted-foreground font-medium tracking-wide uppercase flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" />
            Read-Only View
          </p>
          <h1 className="text-2xl font-display font-bold text-foreground mt-0.5">
            My Academic Marks
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            VEMU Institute of Technology · Academic Year 2025–26
          </p>
        </motion.div>
      </div>

      {/* Student Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-5"
      >
        <Card className="card-elevated overflow-hidden">
          <div className="stat-card-primary p-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <GraduationCap className="w-8 h-8 text-white/90" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-display font-bold text-white">
                  {student.name}
                </h2>
                <p className="text-white/70 text-sm mt-0.5">
                  {student.rollNumber}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {[
                    { label: "Course", value: student.course },
                    { label: "Branch", value: student.branch },
                    { label: "Semester", value: `Sem ${student.semester}` },
                    { label: "Section", value: `Section ${student.section}` },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs"
                    >
                      <span className="text-white/50">{item.label}: </span>
                      <span className="text-white font-semibold">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          {
            label: "Subjects",
            value: studentSubjects.length,
            icon: BookOpen,
            color: "bg-card border border-border",
            textColor: "text-foreground",
          },
          {
            label: "Marks Published",
            value: completedSubjects,
            icon: TrendingUp,
            color: "bg-info-subtle border border-blue-200",
            textColor: "text-blue-800",
          },
          {
            label: "Avg Final Marks",
            value: avgFinal !== null ? `${avgFinal}/30` : "—",
            icon: Award,
            color: "bg-success-subtle border border-green-200",
            textColor: "text-green-800",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
            >
              <Card className={`${stat.color} card-elevated`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/50 flex items-center justify-center shrink-0">
                    <Icon className={`w-5 h-5 ${stat.textColor}`} />
                  </div>
                  <div>
                    <p
                      className={`text-xl font-display font-bold ${stat.textColor}`}
                    >
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Info Banner */}
      <div className="bg-muted/60 border border-border rounded-lg px-4 py-3 mb-5 flex items-start gap-3 text-sm">
        <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-muted-foreground text-xs">
          <strong className="text-foreground">Formula:</strong> Final Marks =
          80% × Best Mid + 20% × Other Mid (auto-rounded). Marks are read-only.
          Contact your faculty for any discrepancies.
        </p>
      </div>

      {/* Marks Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="card-elevated">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Subject-wise Mid Marks
            </CardTitle>
          </CardHeader>

          {subjectSummaries.length === 0 ? (
            <EmptyState
              title="No subjects found"
              description="No subjects are registered for your branch and semester."
              icon="data"
              ocid="student.empty_state"
            />
          ) : (
            <CardContent className="p-0">
              <div data-ocid="student.marks_table">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="pl-4 text-xs">
                        Subject Code
                      </TableHead>
                      <TableHead className="text-xs">Subject Name</TableHead>
                      <TableHead className="text-xs text-center">
                        Mid1 /30
                      </TableHead>
                      <TableHead className="text-xs text-center">
                        Mid1 Status
                      </TableHead>
                      <TableHead className="text-xs text-center">
                        Mid2 /30
                      </TableHead>
                      <TableHead className="text-xs text-center">
                        Mid2 Status
                      </TableHead>
                      <TableHead className="text-xs text-center">
                        Best Mid (80%)
                      </TableHead>
                      <TableHead className="text-xs text-center">
                        Other (20%)
                      </TableHead>
                      <TableHead className="text-xs text-center font-bold">
                        Final /30
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectSummaries.map((summary, idx) => (
                      <TableRow
                        key={summary.subject.code}
                        className="table-row-hover"
                        data-ocid={`student.row.${idx + 1}`}
                      >
                        <TableCell className="pl-4">
                          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded font-medium">
                            {summary.subject.code}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {summary.subject.name}
                        </TableCell>

                        {/* Mid1 */}
                        <TableCell className="text-center">
                          {summary.mid1 ? (
                            <span className="font-bold text-sm tabular-nums">
                              {getMidTotal(summary.mid1.marks)}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {summary.mid1 ? (
                            <StatusBadge
                              status={summary.mid1.status}
                              size="sm"
                            />
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs text-muted-foreground"
                            >
                              Not entered
                            </Badge>
                          )}
                        </TableCell>

                        {/* Mid2 */}
                        <TableCell className="text-center">
                          {summary.mid2 ? (
                            <span className="font-bold text-sm tabular-nums">
                              {getMidTotal(summary.mid2.marks)}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {summary.mid2 ? (
                            <StatusBadge
                              status={summary.mid2.status}
                              size="sm"
                            />
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs text-muted-foreground"
                            >
                              Not entered
                            </Badge>
                          )}
                        </TableCell>

                        {/* Calc */}
                        <TableCell className="text-center font-medium tabular-nums text-blue-700">
                          {summary.calc.bestMid ?? (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center tabular-nums text-muted-foreground">
                          {summary.calc.otherMid ?? (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {summary.calc.finalMarks !== null ? (
                            <span
                              className={`text-lg font-display font-bold tabular-nums ${
                                summary.calc.finalMarks >= 24
                                  ? "text-green-600"
                                  : summary.calc.finalMarks >= 18
                                    ? "text-foreground"
                                    : "text-destructive"
                              }`}
                            >
                              {summary.calc.finalMarks}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Marks Breakdown per subject (Expanded) */}
              <div className="p-4 border-t border-border bg-muted/20">
                <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wide">
                  Detailed Breakdown
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {subjectSummaries
                    .filter((s) => s.mid1 || s.mid2)
                    .map((summary) => (
                      <div
                        key={summary.subject.code}
                        className="bg-card border border-border rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold">
                            {summary.subject.name}
                          </p>
                          <span className="text-xs font-mono text-muted-foreground">
                            {summary.subject.code}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {(
                            [
                              { mid: summary.mid1, label: "Mid1" },
                              { mid: summary.mid2, label: "Mid2" },
                            ] as const
                          ).map(({ mid, label }) =>
                            mid ? (
                              <div
                                key={mid.midExam}
                                className="bg-muted/50 rounded p-2"
                              >
                                <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                                  {mid.midExam}
                                </p>
                                <div className="space-y-0.5">
                                  {mid.marks.map((mark) => (
                                    <div
                                      key={mark.markType}
                                      className="flex justify-between text-xs"
                                    >
                                      <span className="text-muted-foreground">
                                        {mark.markType}
                                      </span>
                                      <span className="font-semibold tabular-nums">
                                        {mark.markValue}
                                        <span className="text-muted-foreground font-normal">
                                          /
                                          {mark.markType === "Assignment"
                                            ? "5"
                                            : "10"}
                                        </span>
                                      </span>
                                    </div>
                                  ))}
                                  <div className="flex justify-between text-xs border-t border-border pt-1 mt-1">
                                    <span className="font-semibold">Total</span>
                                    <span className="font-bold">
                                      {getMidTotal(mid.marks)}
                                      <span className="text-muted-foreground font-normal">
                                        /30
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div
                                key={label}
                                className="bg-muted/30 rounded p-2 flex items-center justify-center"
                              >
                                <p className="text-xs text-muted-foreground">
                                  {label}: Not entered
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="text-primary hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          caffeine.ai
        </a>
      </div>
    </div>
  );
}
