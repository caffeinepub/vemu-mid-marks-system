import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  Info,
  Loader2,
  RefreshCw,
  Save,
  Search,
  Send,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";
import { useApp } from "../../contexts/AppContext";
import { BRANCHES, MID_EXAMS, SECTIONS, SEMESTERS } from "../../data/mockData";
import type { MarksEntryRow } from "../../types";
import {
  calculateFinalMarks,
  getMidTotal,
  validateMark,
} from "../../utils/marks";

export function MarksEntryPage() {
  const {
    getStudentsByFilter,
    getSubjectsByFilter,
    getMarksByFilter,
    getMarksByKey,
    createOrUpdateMarks,
    submitMarks,
  } = useApp();

  const [branch, setBranch] = useState("CSE");
  const [section, setSection] = useState("A");
  const [semester, setSemester] = useState("3");
  const [subjectCode, setSubjectCode] = useState("");
  const [midExam, setMidExam] = useState("Mid1");
  const [rows, setRows] = useState<MarksEntryRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const subjects = getSubjectsByFilter(branch, Number(semester));

  const handleLoad = async () => {
    if (!subjectCode) {
      toast.error("Please select a subject first");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));

    const students = getStudentsByFilter(branch, section, Number(semester));
    const existingMarks = getMarksByFilter(
      branch,
      section,
      Number(semester),
      subjectCode,
    );

    const newRows: MarksEntryRow[] = students.map((student) => {
      const key = `${student.rollNumber}_${subjectCode}_${midExam}`;
      const existing = existingMarks.find(
        (m) =>
          m.student.rollNumber === student.rollNumber && m.midExam === midExam,
      );

      if (existing) {
        const q1 = existing.marks.find((m) => m.markType === "Q1");
        const q2 = existing.marks.find((m) => m.markType === "Q2");
        const q3 = existing.marks.find((m) => m.markType === "Q3");
        const asgn = existing.marks.find((m) => m.markType === "Assignment");
        return {
          student,
          q1: q1 ? String(q1.markValue) : "",
          q2: q2 ? String(q2.markValue) : "",
          q3: q3 ? String(q3.markValue) : "",
          assignment: asgn ? String(asgn.markValue) : "",
          errors: {},
          existingKey: key,
          status: existing.status,
        };
      }
      return {
        student,
        q1: "",
        q2: "",
        q3: "",
        assignment: "",
        errors: {},
        existingKey: undefined,
        status: undefined,
      };
    });

    setRows(newRows);
    setLoaded(true);
    setLoading(false);
    toast.success(`Loaded ${newRows.length} students`);
  };

  const updateRow = useCallback(
    (
      index: number,
      field: "q1" | "q2" | "q3" | "assignment",
      value: string,
    ) => {
      setRows((prev) => {
        const updated = [...prev];
        const row = { ...updated[index] };
        row[field] = value;

        // Validate
        const maxMap = { q1: 10, q2: 10, q3: 10, assignment: 5 };
        const err = validateMark(value, maxMap[field]);
        row.errors = { ...row.errors, [field]: err || "" };

        // Check total
        const q1v = Number(row.q1) || 0;
        const q2v = Number(row.q2) || 0;
        const q3v = Number(row.q3) || 0;
        const av = Number(row.assignment) || 0;
        const total = q1v + q2v + q3v + av;
        if (total > 30) {
          row.errors.total = `Total ${total} exceeds 30`;
        } else {
          row.errors.total = "";
        }

        updated[index] = row;
        return updated;
      });
    },
    [],
  );

  const calcRowTotal = (row: MarksEntryRow) => {
    const q1v = Number(row.q1) || 0;
    const q2v = Number(row.q2) || 0;
    const q3v = Number(row.q3) || 0;
    const av = Number(row.assignment) || 0;
    return q1v + q2v + q3v + av;
  };

  const hasErrors = rows.some((r) =>
    Object.values(r.errors).some((e) => e !== ""),
  );

  const buildMarks = (row: MarksEntryRow) => [
    {
      markType: "Q1",
      markValue: Number(row.q1) || 0,
      markQuestion: "Question 1",
    },
    {
      markType: "Q2",
      markValue: Number(row.q2) || 0,
      markQuestion: "Question 2",
    },
    {
      markType: "Q3",
      markValue: Number(row.q3) || 0,
      markQuestion: "Question 3",
    },
    {
      markType: "Assignment",
      markValue: Number(row.assignment) || 0,
      markQuestion: "Assignment",
    },
  ];

  const handleSave = async () => {
    if (hasErrors) {
      toast.error("Fix validation errors before saving");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    const subject = subjects.find((s) => s.code === subjectCode);
    if (!subject) {
      setSaving(false);
      return;
    }

    for (const row of rows) {
      if (row.status === "Approved") continue; // locked
      createOrUpdateMarks(row.student, subject, midExam, buildMarks(row));
    }

    setSaving(false);
    toast.success("Marks saved as draft");
    // Reload
    handleLoad();
  };

  const handleSubmitAll = async () => {
    if (hasErrors) {
      toast.error("Fix validation errors before submitting");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    const subject = subjects.find((s) => s.code === subjectCode);
    if (!subject) {
      setSubmitting(false);
      return;
    }

    let submitted = 0;
    for (const row of rows) {
      if (row.status === "Approved") continue;
      const key = createOrUpdateMarks(
        row.student,
        subject,
        midExam,
        buildMarks(row),
      );
      submitMarks(key);
      submitted++;
    }

    setSubmitting(false);
    toast.success(`${submitted} entries submitted for approval`);
    handleLoad();
  };

  // Get otherMid data for final marks column
  const getOtherMidKey = (rollNumber: string) => {
    const other = midExam === "Mid1" ? "Mid2" : "Mid1";
    return `${rollNumber}_${subjectCode}_${other}`;
  };

  const isApproved = (row: MarksEntryRow) => row.status === "Approved";

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Marks Entry
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Enter question-wise mid examination marks for students
        </p>
      </div>

      {/* Filters */}
      <Card className="card-elevated mb-5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Filter Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Branch</Label>
              <Select
                value={branch}
                onValueChange={(v) => {
                  setBranch(v);
                  setLoaded(false);
                }}
              >
                <SelectTrigger
                  data-ocid="marks.branch_select"
                  className="h-9 text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BRANCHES.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Section</Label>
              <Select
                value={section}
                onValueChange={(v) => {
                  setSection(v);
                  setLoaded(false);
                }}
              >
                <SelectTrigger
                  data-ocid="marks.section_select"
                  className="h-9 text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Semester</Label>
              <Select
                value={semester}
                onValueChange={(v) => {
                  setSemester(v);
                  setLoaded(false);
                }}
              >
                <SelectTrigger
                  data-ocid="marks.semester_select"
                  className="h-9 text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEMESTERS.map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      Sem {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Subject</Label>
              <Select
                value={subjectCode}
                onValueChange={(v) => {
                  setSubjectCode(v);
                  setLoaded(false);
                }}
              >
                <SelectTrigger
                  data-ocid="marks.subject_select"
                  className="h-9 text-sm"
                >
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.code} value={s.code}>
                      {s.code} – {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Mid Exam</Label>
              <Select
                value={midExam}
                onValueChange={(v) => {
                  setMidExam(v);
                  setLoaded(false);
                }}
              >
                <SelectTrigger
                  data-ocid="marks.mid_select"
                  className="h-9 text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MID_EXAMS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleLoad}
              disabled={loading}
              data-ocid="marks.load_button"
              className="h-9 text-sm font-medium"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Load Students
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <div className="bg-info-subtle border border-blue-200 rounded-lg px-4 py-3 mb-5 flex items-start gap-3 text-sm">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <div className="text-blue-800">
          <strong>Marks Structure:</strong> Q1, Q2, Q3 each max 10 marks (best 2
          of 3, exam max 25) + Assignment max 5 = Total max 30. Final = 80% of
          best mid + 20% of other mid (auto-rounded).
        </div>
      </div>

      {/* Marks Table */}
      <AnimatePresence>
        {loaded && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="card-elevated">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Students — {branch}/{section} · Sem {semester} ·{" "}
                    {subjects.find((s) => s.code === subjectCode)?.name} ·{" "}
                    {midExam}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {rows.length} students
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLoad}
                      className="h-7 w-7 p-0"
                      title="Refresh"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {rows.length === 0 ? (
                <EmptyState
                  title="No students found"
                  description="No students match the selected branch, section, and semester."
                  icon="data"
                  ocid="marks.empty_state"
                />
              ) : (
                <>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto" data-ocid="marks.table">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="pl-4 text-xs w-32">
                              Roll No.
                            </TableHead>
                            <TableHead className="text-xs">Name</TableHead>
                            <TableHead className="text-xs text-center w-20">
                              Q1{" "}
                              <span className="text-muted-foreground">/10</span>
                            </TableHead>
                            <TableHead className="text-xs text-center w-20">
                              Q2{" "}
                              <span className="text-muted-foreground">/10</span>
                            </TableHead>
                            <TableHead className="text-xs text-center w-20">
                              Q3{" "}
                              <span className="text-muted-foreground">/10</span>
                            </TableHead>
                            <TableHead className="text-xs text-center w-24">
                              Asgn{" "}
                              <span className="text-muted-foreground">/5</span>
                            </TableHead>
                            <TableHead className="text-xs text-center w-24">
                              Total{" "}
                              <span className="text-muted-foreground">/30</span>
                            </TableHead>
                            <TableHead className="text-xs text-center w-24">
                              Final
                            </TableHead>
                            <TableHead className="text-xs text-center w-28">
                              Status
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rows.map((row, idx) => {
                            const total = calcRowTotal(row);
                            const hasRowError = Object.values(row.errors).some(
                              (e) => e !== "",
                            );
                            const locked = isApproved(row);

                            // Final marks calculation
                            const thisKey = `${row.student.rollNumber}_${subjectCode}_${midExam}`;
                            const otherKey = getOtherMidKey(
                              row.student.rollNumber,
                            );
                            const thisMidData = getMarksByKey(thisKey);
                            const otherMidData = getMarksByKey(otherKey);
                            const mid1 =
                              midExam === "Mid1" ? thisMidData : otherMidData;
                            const mid2 =
                              midExam === "Mid2" ? thisMidData : otherMidData;
                            const calc = calculateFinalMarks(mid1, mid2);

                            return (
                              <TableRow
                                key={row.student.rollNumber}
                                data-ocid={`marks.row.${idx + 1}`}
                                className={`table-row-hover ${hasRowError ? "bg-red-50" : ""} ${locked ? "opacity-75" : ""}`}
                              >
                                <TableCell className="pl-4 text-xs font-mono text-muted-foreground">
                                  {row.student.rollNumber}
                                </TableCell>
                                <TableCell className="text-sm font-medium">
                                  {row.student.name}
                                </TableCell>

                                {(["q1", "q2", "q3"] as const).map((field) => (
                                  <TableCell
                                    key={field}
                                    className="text-center p-2"
                                  >
                                    <div className="flex flex-col items-center gap-0.5">
                                      <input
                                        type="number"
                                        min={0}
                                        max={10}
                                        value={row[field]}
                                        disabled={locked}
                                        onChange={(e) =>
                                          updateRow(idx, field, e.target.value)
                                        }
                                        className={`mark-input ${row.errors[field] ? "error" : ""}`}
                                        placeholder="0"
                                      />
                                      {row.errors[field] && (
                                        <span className="text-[10px] text-destructive leading-tight">
                                          {row.errors[field]}
                                        </span>
                                      )}
                                    </div>
                                  </TableCell>
                                ))}

                                <TableCell className="text-center p-2">
                                  <div className="flex flex-col items-center gap-0.5">
                                    <input
                                      type="number"
                                      min={0}
                                      max={5}
                                      value={row.assignment}
                                      disabled={locked}
                                      onChange={(e) =>
                                        updateRow(
                                          idx,
                                          "assignment",
                                          e.target.value,
                                        )
                                      }
                                      className={`mark-input w-16 ${row.errors.assignment ? "error" : ""}`}
                                      placeholder="0"
                                    />
                                    {row.errors.assignment && (
                                      <span className="text-[10px] text-destructive leading-tight">
                                        {row.errors.assignment}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>

                                <TableCell className="text-center p-2">
                                  <span
                                    className={`text-sm font-bold tabular-nums ${
                                      row.errors.total
                                        ? "text-destructive"
                                        : total === 30
                                          ? "text-green-600"
                                          : "text-foreground"
                                    }`}
                                  >
                                    {total}
                                    {row.errors.total && (
                                      <AlertCircle className="w-3 h-3 inline ml-1" />
                                    )}
                                  </span>
                                </TableCell>

                                <TableCell className="text-center p-2">
                                  {calc.finalMarks !== null ? (
                                    <span className="text-sm font-bold tabular-nums text-primary">
                                      {calc.finalMarks}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">
                                      —
                                    </span>
                                  )}
                                </TableCell>

                                <TableCell className="text-center p-2">
                                  {row.status ? (
                                    <StatusBadge
                                      status={row.status}
                                      size="sm"
                                    />
                                  ) : (
                                    <span className="text-xs text-muted-foreground">
                                      New
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>

                  {/* Actions */}
                  <div className="px-4 py-4 border-t border-border bg-muted/20 flex items-center justify-between flex-wrap gap-3">
                    <p className="text-xs text-muted-foreground">
                      {rows.filter((r) => r.status === "Approved").length}{" "}
                      locked (approved) ·{" "}
                      {rows.filter((r) => r.status !== "Approved").length}{" "}
                      editable
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={handleSave}
                        disabled={saving || hasErrors}
                        data-ocid="marks.save_button"
                        className="h-9 text-sm font-medium"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Draft
                      </Button>
                      <Button
                        onClick={handleSubmitAll}
                        disabled={submitting || hasErrors}
                        data-ocid="marks.submit_button"
                        className="h-9 text-sm font-medium"
                      >
                        {submitting ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Submit for Approval
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!loaded && (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            Select filters and click "Load Students" to begin marks entry
          </p>
        </div>
      )}
    </div>
  );
}
