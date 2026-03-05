import type { FinalMarksCalculation, Mark, MidMarks } from "../types";

export function getMidTotal(marks: Mark[]): number {
  const examMarks = marks.filter((m) => m.markType !== "Assignment");
  const assignment = marks.find((m) => m.markType === "Assignment");
  const examTotal = examMarks.reduce((sum, m) => sum + m.markValue, 0);
  const assignmentTotal = assignment ? assignment.markValue : 0;
  return Math.min(examTotal, 25) + Math.min(assignmentTotal, 5);
}

export function getExamSubtotal(marks: Mark[]): number {
  return marks
    .filter((m) => m.markType !== "Assignment")
    .reduce((sum, m) => sum + m.markValue, 0);
}

export function calculateFinalMarks(
  mid1Marks: MidMarks | undefined,
  mid2Marks: MidMarks | undefined,
): FinalMarksCalculation {
  const mid1Total = mid1Marks ? getMidTotal(mid1Marks.marks) : null;
  const mid2Total = mid2Marks ? getMidTotal(mid2Marks.marks) : null;

  if (mid1Total === null && mid2Total === null) {
    return {
      mid1Total: null,
      mid2Total: null,
      bestMid: null,
      otherMid: null,
      finalMarks: null,
    };
  }

  if (mid1Total !== null && mid2Total !== null) {
    const bestMid = Math.max(mid1Total, mid2Total);
    const otherMid = Math.min(mid1Total, mid2Total);
    const finalMarks = Math.round(0.8 * bestMid + 0.2 * otherMid);
    return { mid1Total, mid2Total, bestMid, otherMid, finalMarks };
  }

  // Only one mid available
  const onlyMid = mid1Total ?? mid2Total!;
  return {
    mid1Total,
    mid2Total,
    bestMid: onlyMid,
    otherMid: null,
    finalMarks: Math.round(0.8 * onlyMid),
  };
}

export function validateMark(value: string, max: number): string | null {
  if (value === "" || value === undefined) return null;
  const num = Number(value);
  if (Number.isNaN(num)) return "Must be a number";
  if (num < 0) return "Cannot be negative";
  if (num > max) return `Max is ${max}`;
  return null;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "Approved":
      return "bg-success-subtle text-success border-success";
    case "Submitted":
      return "bg-info-subtle text-info-foreground border-info";
    case "Draft":
      return "bg-warning-subtle text-warning-foreground border-warning";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "Approved":
      return "Approved";
    case "Submitted":
      return "Pending Review";
    case "Draft":
      return "Draft";
    default:
      return status;
  }
}
