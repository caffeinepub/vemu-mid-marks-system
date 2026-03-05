import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { CheckCircle2, Filter, Loader2, Shield, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";
import { useApp } from "../../contexts/AppContext";
import { BRANCHES, SECTIONS, SEMESTERS } from "../../data/mockData";
import type { MidMarks } from "../../types";
import { getMidTotal } from "../../utils/marks";

export function ApprovalPage() {
  const { allMarks, subjects, approveMarks, rejectMarks } = useApp();

  const [branch, setBranch] = useState("CSE");
  const [section, setSection] = useState("");
  const [semester, setSemester] = useState("3");
  const [subjectCode, setSubjectCode] = useState("");
  const [statusFilter, setStatusFilter] = useState("Submitted");
  const [processingKey, setProcessingKey] = useState<string | null>(null);

  const filteredSubjects = subjects.filter(
    (s) => s.branch === branch && s.semester === Number(semester),
  );

  const filteredMarks = allMarks.filter((m) => {
    if (m.student.branch !== branch) return false;
    if (section && m.student.section !== section) return false;
    if (m.student.semester !== Number(semester)) return false;
    if (subjectCode && m.subject.code !== subjectCode) return false;
    if (statusFilter !== "All" && m.status !== statusFilter) return false;
    return true;
  });

  const handleApprove = async (key: string) => {
    setProcessingKey(key);
    await new Promise((r) => setTimeout(r, 400));
    approveMarks(key);
    setProcessingKey(null);
    toast.success("Marks approved and locked");
  };

  const handleReject = async (key: string) => {
    setProcessingKey(key);
    await new Promise((r) => setTimeout(r, 300));
    rejectMarks(key);
    setProcessingKey(null);
    toast.info("Marks returned to draft");
  };

  const pendingCount = filteredMarks.filter(
    (m) => m.status === "Submitted",
  ).length;
  const approvedCount = filteredMarks.filter(
    (m) => m.status === "Approved",
  ).length;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Marks Approval
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Review and approve submitted mark entries · Approved marks are locked
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-warning-subtle border border-amber-200 rounded-lg p-4"
        >
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
            Pending Review
          </p>
          <p className="text-3xl font-display font-bold text-amber-800 mt-1">
            {pendingCount}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-success-subtle border border-green-200 rounded-lg p-4"
        >
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">
            Approved
          </p>
          <p className="text-3xl font-display font-bold text-green-800 mt-1">
            {approvedCount}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-muted/60 border border-border rounded-lg p-4"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Filtered Total
          </p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">
            {filteredMarks.length}
          </p>
        </motion.div>
      </div>

      {/* Filters */}
      <Card className="card-elevated mb-5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Branch</Label>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger
                  className="h-9 text-sm"
                  data-ocid="approval.branch_select"
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
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Sections</SelectItem>
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
              <Select value={semester} onValueChange={setSemester}>
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
              <Label className="text-xs font-medium">Subject</Label>
              <Select value={subjectCode} onValueChange={setSubjectCode}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Subjects</SelectItem>
                  {filteredSubjects.map((s) => (
                    <SelectItem key={s.code} value={s.code}>
                      {s.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Submitted">Pending Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="card-elevated">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Mark Entries
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {filteredMarks.length} entries
            </Badge>
          </div>
        </CardHeader>

        {filteredMarks.length === 0 ? (
          <EmptyState
            title="No mark entries found"
            description="Try adjusting your filters or select 'All Status' to see all entries."
            icon="search"
            ocid="approval.empty_state"
          />
        ) : (
          <CardContent className="p-0">
            <div data-ocid="approval.table">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="pl-4 text-xs">Roll No.</TableHead>
                    <TableHead className="text-xs">Student Name</TableHead>
                    <TableHead className="text-xs">Subject</TableHead>
                    <TableHead className="text-xs text-center">Mid</TableHead>
                    <TableHead className="text-xs text-center">Total</TableHead>
                    <TableHead className="text-xs text-center">Q1</TableHead>
                    <TableHead className="text-xs text-center">Q2</TableHead>
                    <TableHead className="text-xs text-center">Q3</TableHead>
                    <TableHead className="text-xs text-center">Asgn</TableHead>
                    <TableHead className="text-xs text-center">
                      Status
                    </TableHead>
                    <TableHead className="text-xs text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMarks.map((entry: MidMarks, idx) => {
                    const total = getMidTotal(entry.marks);
                    const q1 = entry.marks.find((m) => m.markType === "Q1");
                    const q2 = entry.marks.find((m) => m.markType === "Q2");
                    const q3 = entry.marks.find((m) => m.markType === "Q3");
                    const asgn = entry.marks.find(
                      (m) => m.markType === "Assignment",
                    );
                    const isProcessing = processingKey === entry.key;

                    return (
                      <TableRow
                        key={entry.key}
                        className="table-row-hover"
                        data-ocid={`approval.row.${idx + 1}`}
                      >
                        <TableCell className="pl-4 text-xs font-mono text-muted-foreground">
                          {entry.student.rollNumber}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {entry.student.name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <span>{entry.subject.code}</span>
                          <span className="text-xs text-muted-foreground/70 ml-1 hidden lg:inline">
                            – {entry.subject.name}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                            {entry.midExam}
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-bold text-sm tabular-nums">
                          {total}/30
                        </TableCell>
                        <TableCell className="text-center text-sm tabular-nums">
                          {q1?.markValue ?? "—"}
                        </TableCell>
                        <TableCell className="text-center text-sm tabular-nums">
                          {q2?.markValue ?? "—"}
                        </TableCell>
                        <TableCell className="text-center text-sm tabular-nums">
                          {q3?.markValue ?? "—"}
                        </TableCell>
                        <TableCell className="text-center text-sm tabular-nums">
                          {asgn?.markValue ?? "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusBadge status={entry.status} size="sm" />
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.status === "Submitted" ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(entry.key)}
                                disabled={isProcessing}
                                data-ocid={`approval.approve_button.${idx + 1}`}
                                className="h-7 px-2.5 text-xs bg-green-600 hover:bg-green-700"
                              >
                                {isProcessing ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={isProcessing}
                                    data-ocid={`approval.reject_button.${idx + 1}`}
                                    className="h-7 px-2.5 text-xs border-destructive text-destructive hover:bg-destructive/10"
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Reject
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent data-ocid="approval.dialog">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Reject Marks Entry?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will return the marks to Draft status
                                      for <strong>{entry.student.name}</strong>{" "}
                                      — {entry.subject.name} ({entry.midExam}).
                                      The faculty can then edit and resubmit.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel data-ocid="approval.cancel_button">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleReject(entry.key)}
                                      data-ocid="approval.confirm_button"
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Yes, Reject
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          ) : entry.status === "Approved" ? (
                            <div className="flex items-center justify-center gap-1 text-xs text-green-700">
                              <Shield className="w-3.5 h-3.5" />
                              <span>Locked</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Awaiting submit
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
        )}
      </Card>
    </div>
  );
}
