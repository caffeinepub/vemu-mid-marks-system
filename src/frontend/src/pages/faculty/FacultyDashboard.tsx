import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { StatusBadge } from "../../components/StatusBadge";
import { useApp } from "../../contexts/AppContext";
import type { AppRole } from "../../types";

const ROLE_LABELS: Record<AppRole, string> = {
  HOD: "Head of Department",
  ClassTeacher: "Class Teacher",
  SubjectFaculty: "Subject Faculty",
  Student: "Student",
};

export function FacultyDashboard() {
  const { session, allMarks, students, subjects } = useApp();
  const navigate = useNavigate();

  if (!session) return null;

  const pendingApprovals = allMarks.filter(
    (m) => m.status === "Submitted",
  ).length;
  const approvedCount = allMarks.filter((m) => m.status === "Approved").length;
  const draftCount = allMarks.filter((m) => m.status === "Draft").length;

  const stats = [
    {
      label: "Total Students",
      value: students.length,
      icon: Users,
      color: "stat-card-primary",
      textColor: "text-white",
      change: "+5 this semester",
    },
    {
      label: "Subjects",
      value: subjects.length,
      icon: BookOpen,
      color: "bg-card",
      textColor: "text-foreground",
      change: `${subjects.filter((s) => s.branch === "CSE").length} CSE, ${subjects.filter((s) => s.branch === "ECE").length} ECE`,
      border: true,
    },
    {
      label: "Pending Approvals",
      value: pendingApprovals,
      icon: Clock,
      color: "bg-warning-subtle",
      textColor: "text-warning-foreground",
      change: `${draftCount} in draft`,
      border: true,
      borderColor: "border-warning",
    },
    {
      label: "Approved Marks",
      value: approvedCount,
      icon: CheckCircle2,
      color: "bg-success-subtle",
      textColor: "text-success",
      change: `${allMarks.length} total entries`,
      border: true,
      borderColor: "border-success",
    },
  ];

  // Recent 8 marks entries
  const recentMarks = [...allMarks]
    .sort((a, b) => {
      const order = { Submitted: 0, Draft: 1, Approved: 2 };
      return order[a.status] - order[b.status];
    })
    .slice(0, 8);

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-7">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm text-muted-foreground font-medium tracking-wide uppercase">
            {ROLE_LABELS[session.role]}
          </p>
          <h1 className="text-3xl font-display font-bold text-foreground mt-0.5">
            Welcome back, {session.username}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Academic Year 2025–26 · Semester 3 · VEMU Institute of Technology
          </p>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
            >
              <Card
                className={`${stat.color} ${stat.border ? "border" : "border-0"} ${stat.borderColor || ""} overflow-hidden`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p
                        className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                          stat.color === "stat-card-primary"
                            ? "text-white/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {stat.label}
                      </p>
                      <p
                        className={`text-3xl font-display font-bold ${stat.textColor}`}
                      >
                        {stat.value}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          stat.color === "stat-card-primary"
                            ? "text-white/60"
                            : "text-muted-foreground"
                        }`}
                      >
                        {stat.change}
                      </p>
                    </div>
                    <div
                      className={`p-2 rounded-lg ${
                        stat.color === "stat-card-primary"
                          ? "bg-white/15"
                          : "bg-muted"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          stat.color === "stat-card-primary"
                            ? "text-white/80"
                            : stat.textColor
                        }`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          <Card className="card-elevated h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Button
                onClick={() => navigate({ to: "/faculty/marks-entry" })}
                className="w-full justify-between h-11 font-medium"
              >
                <span className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Enter Mid Marks
                </span>
                <ArrowRight className="w-4 h-4 opacity-60" />
              </Button>

              {(session.role === "HOD" || session.role === "ClassTeacher") && (
                <Button
                  variant="secondary"
                  onClick={() => navigate({ to: "/faculty/approval" })}
                  className="w-full justify-between h-11 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Review & Approve
                  </span>
                  <span className="flex items-center gap-1">
                    {pendingApprovals > 0 && (
                      <span className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {pendingApprovals}
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 opacity-60" />
                  </span>
                </Button>
              )}

              <Button
                variant="secondary"
                onClick={() => navigate({ to: "/faculty/reports" })}
                className="w-full justify-between h-11 font-medium"
              >
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  View Reports
                </span>
                <ArrowRight className="w-4 h-4 opacity-60" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Marks Summary */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2"
        >
          <Card className="card-elevated h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Marks Summary
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <p className="text-2xl font-display font-bold text-amber-600">
                    {draftCount}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground mt-1">
                    Draft Entries
                  </p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <p className="text-2xl font-display font-bold text-blue-600">
                    {pendingApprovals}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground mt-1">
                    Awaiting Review
                  </p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <p className="text-2xl font-display font-bold text-green-600">
                    {approvedCount}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground mt-1">
                    Finalized
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Completion Progress</span>
                  <span>
                    {allMarks.length > 0
                      ? Math.round((approvedCount / allMarks.length) * 100)
                      : 0}
                    % approved
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-700"
                    style={{
                      width: `${allMarks.length > 0 ? (approvedCount / allMarks.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Recent Mark Entries
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: "/faculty/marks-entry" })}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                View All
                <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6 text-xs font-semibold">
                    Roll No.
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Student
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Subject
                  </TableHead>
                  <TableHead className="text-xs font-semibold">Mid</TableHead>
                  <TableHead className="text-xs font-semibold">Total</TableHead>
                  <TableHead className="text-xs font-semibold">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMarks.map((entry, idx) => {
                  const total = entry.marks.reduce(
                    (sum, m) => sum + m.markValue,
                    0,
                  );
                  return (
                    <TableRow
                      key={entry.key}
                      className="table-row-hover"
                      data-ocid={`dashboard.row.${idx + 1}`}
                    >
                      <TableCell className="pl-6 text-xs font-mono text-muted-foreground">
                        {entry.student.rollNumber}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {entry.student.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.subject.name}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                          {entry.midExam}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-semibold tabular-nums">
                        {total}/30
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={entry.status} size="sm" />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {recentMarks.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-sm text-muted-foreground py-8"
                    >
                      No mark entries yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
