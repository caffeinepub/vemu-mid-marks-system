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
  BarChart3,
  Download,
  FileText,
  Loader2,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";
import { useApp } from "../../contexts/AppContext";
import { BRANCHES, SECTIONS, SEMESTERS } from "../../data/mockData";
import type { MidMarks } from "../../types";
import { calculateFinalMarks, getMidTotal } from "../../utils/marks";

interface ReportRow {
  rollNumber: string;
  name: string;
  section: string;
  subject: string;
  subjectCode: string;
  mid1Total: number | null;
  mid2Total: number | null;
  bestMid: number | null;
  otherMid: number | null;
  finalMarks: number | null;
  mid1Status: string;
  mid2Status: string;
}

export function ReportsPage() {
  const { allMarks, getStudentsByFilter, getSubjectsByFilter } = useApp();

  const [branch, setBranch] = useState("CSE");
  const [section, setSection] = useState("A");
  const [semester, setSemester] = useState("3");
  const [subjectCode, setSubjectCode] = useState("");
  const [reportRows, setReportRows] = useState<ReportRow[]>([]);
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const subjects = getSubjectsByFilter(branch, Number(semester));

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 400));

    const students = getStudentsByFilter(branch, section, Number(semester));
    const targetSubjects = subjectCode
      ? subjects.filter((s) => s.code === subjectCode)
      : subjects.filter(
          (s) => s.branch === branch && s.semester === Number(semester),
        );

    const rows: ReportRow[] = [];

    for (const student of students) {
      for (const subject of targetSubjects) {
        const mid1Entry = allMarks.find(
          (m) =>
            m.student.rollNumber === student.rollNumber &&
            m.subject.code === subject.code &&
            m.midExam === "Mid1",
        );
        const mid2Entry = allMarks.find(
          (m) =>
            m.student.rollNumber === student.rollNumber &&
            m.subject.code === subject.code &&
            m.midExam === "Mid2",
        );

        const calc = calculateFinalMarks(mid1Entry, mid2Entry);

        rows.push({
          rollNumber: student.rollNumber,
          name: student.name,
          section: student.section,
          subject: subject.name,
          subjectCode: subject.code,
          mid1Total: calc.mid1Total,
          mid2Total: calc.mid2Total,
          bestMid: calc.bestMid,
          otherMid: calc.otherMid,
          finalMarks: calc.finalMarks,
          mid1Status: mid1Entry?.status ?? "—",
          mid2Status: mid2Entry?.status ?? "—",
        });
      }
    }

    setReportRows(rows);
    setGenerated(true);
    setGenerating(false);
    toast.success(`Report generated: ${rows.length} entries`);
  };

  const handleExportCSV = () => {
    if (!reportRows.length) {
      toast.error("Generate a report first");
      return;
    }
    const headers = [
      "Roll Number",
      "Name",
      "Section",
      "Subject Code",
      "Subject",
      "Mid1 Total",
      "Mid1 Status",
      "Mid2 Total",
      "Mid2 Status",
      "Best Mid (80%)",
      "Other Mid (20%)",
      "Final Marks",
    ];
    const csvRows = reportRows.map((r) => [
      r.rollNumber,
      r.name,
      r.section,
      r.subjectCode,
      r.subject,
      r.mid1Total ?? "—",
      r.mid1Status,
      r.mid2Total ?? "—",
      r.mid2Status,
      r.bestMid ?? "—",
      r.otherMid ?? "—",
      r.finalMarks ?? "—",
    ]);

    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VEMU_MidMarks_${branch}_${section}_Sem${semester}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Excel report downloaded");
  };

  const handleExportPDF = () => {
    if (!reportRows.length) {
      toast.error("Generate a report first");
      return;
    }
    window.print();
    toast.info("Print dialog opened — save as PDF");
  };

  // Stats
  const avgFinal =
    reportRows.filter((r) => r.finalMarks !== null).length > 0
      ? Math.round(
          reportRows
            .filter((r) => r.finalMarks !== null)
            .reduce((sum, r) => sum + (r.finalMarks ?? 0), 0) /
            reportRows.filter((r) => r.finalMarks !== null).length,
        )
      : null;

  const passCount = reportRows.filter(
    (r) => r.finalMarks !== null && r.finalMarks >= 18,
  ).length;

  const subjectLabel = subjectCode
    ? (subjects.find((s) => s.code === subjectCode)?.name ?? subjectCode)
    : "All Subjects";

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6 no-print">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Reports
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Generate class-wise and subject-wise marks reports with export
        </p>
      </div>

      {/* Filters */}
      <Card className="card-elevated mb-5 no-print">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Branch</Label>
              <Select
                value={branch}
                onValueChange={(v) => {
                  setBranch(v);
                  setGenerated(false);
                }}
              >
                <SelectTrigger
                  data-ocid="reports.branch_select"
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
                  setGenerated(false);
                }}
              >
                <SelectTrigger className="h-9 text-sm">
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
                  setGenerated(false);
                }}
              >
                <SelectTrigger className="h-9 text-sm">
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
              <Label className="text-xs font-medium">Subject (optional)</Label>
              <Select
                value={subjectCode}
                onValueChange={(v) => {
                  setSubjectCode(v);
                  setGenerated(false);
                }}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Subjects</SelectItem>
                  {subjects.map((s) => (
                    <SelectItem key={s.code} value={s.code}>
                      {s.code} – {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generating}
              data-ocid="reports.generate_button"
              className="h-9 text-sm font-medium"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {generated && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          ref={printRef}
        >
          {/* Print Header (visible only in print) */}
          <div className="print-header hidden print:block mb-6">
            <h1 className="text-xl font-bold">
              VEMU Institute of Technology (Autonomous)
            </h1>
            <h2 className="text-lg mt-1">Student Mid Marks Report</h2>
            <p className="text-sm mt-1">
              Branch: {branch} | Section: {section} | Semester: {semester} |
              Subject: {subjectLabel}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Generated: {new Date().toLocaleString()}
            </p>
          </div>

          {/* Stats */}
          {reportRows.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-5 no-print">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-card border border-border rounded-lg p-4 card-elevated"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Total Entries
                  </p>
                </div>
                <p className="text-2xl font-display font-bold text-foreground">
                  {reportRows.length}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-lg p-4 card-elevated"
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Class Average
                  </p>
                </div>
                <p className="text-2xl font-display font-bold text-primary">
                  {avgFinal ?? "—"}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    /30
                  </span>
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-success-subtle border border-green-200 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-green-600" />
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                    Pass Rate
                  </p>
                </div>
                <p className="text-2xl font-display font-bold text-green-800">
                  {reportRows.filter((r) => r.finalMarks !== null).length > 0
                    ? Math.round(
                        (passCount /
                          reportRows.filter((r) => r.finalMarks !== null)
                            .length) *
                          100,
                      )
                    : 0}
                  <span className="text-sm font-normal">%</span>
                </p>
              </motion.div>
            </div>
          )}

          {/* Export Buttons */}
          <div className="flex justify-between items-center mb-4 no-print">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {branch} / Section {section} · Sem {semester} · {subjectLabel}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {reportRows.length} entries · Generated{" "}
                {new Date().toLocaleTimeString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleExportCSV}
                data-ocid="reports.export_excel_button"
                className="h-9 text-sm font-medium gap-2"
              >
                <Download className="w-4 h-4" />
                Export Excel (CSV)
              </Button>
              <Button
                variant="outline"
                onClick={handleExportPDF}
                data-ocid="reports.export_pdf_button"
                className="h-9 text-sm font-medium gap-2"
              >
                <FileText className="w-4 h-4" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Report Table */}
          <Card className="card-elevated">
            {reportRows.length === 0 ? (
              <EmptyState
                title="No data for selected filters"
                description="No marks have been entered for the selected combination. Try different filters."
                icon="data"
                ocid="reports.empty_state"
              />
            ) : (
              <CardContent className="p-0">
                <div className="overflow-x-auto print-table">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="pl-4 text-xs">#</TableHead>
                        <TableHead className="text-xs">Roll No.</TableHead>
                        <TableHead className="text-xs">Name</TableHead>
                        <TableHead className="text-xs">Subject</TableHead>
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
                      {reportRows.map((row, idx) => (
                        <TableRow
                          key={`${row.rollNumber}_${row.subjectCode}`}
                          className="table-row-hover text-sm"
                          data-ocid={`reports.row.${idx + 1}`}
                        >
                          <TableCell className="pl-4 text-xs text-muted-foreground tabular-nums">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {row.rollNumber}
                          </TableCell>
                          <TableCell className="font-medium">
                            {row.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            <span className="font-mono">{row.subjectCode}</span>
                            <span className="hidden lg:inline">
                              {" "}
                              – {row.subject}
                            </span>
                          </TableCell>
                          <TableCell className="text-center tabular-nums font-medium">
                            {row.mid1Total ?? (
                              <span className="text-muted-foreground text-xs">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.mid1Status !== "—" ? (
                              <StatusBadge status={row.mid1Status} size="sm" />
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center tabular-nums font-medium">
                            {row.mid2Total ?? (
                              <span className="text-muted-foreground text-xs">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.mid2Status !== "—" ? (
                              <StatusBadge status={row.mid2Status} size="sm" />
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center tabular-nums text-blue-700 font-medium">
                            {row.bestMid ?? (
                              <span className="text-muted-foreground text-xs">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center tabular-nums text-muted-foreground">
                            {row.otherMid ?? (
                              <span className="text-muted-foreground text-xs">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.finalMarks !== null ? (
                              <span
                                className={`text-base font-bold tabular-nums ${
                                  row.finalMarks >= 24
                                    ? "text-green-600"
                                    : row.finalMarks >= 18
                                      ? "text-foreground"
                                      : "text-destructive"
                                }`}
                              >
                                {row.finalMarks}
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
              </CardContent>
            )}
          </Card>
        </motion.div>
      )}

      {!generated && (
        <div className="text-center py-20 text-muted-foreground no-print">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-25" />
          <p className="text-sm font-medium">No report generated yet</p>
          <p className="text-xs mt-1 max-w-xs mx-auto">
            Select your filters above and click "Generate Report" to see marks
            summary
          </p>
        </div>
      )}
    </div>
  );
}
