import { getStatusColor, getStatusLabel } from "../utils/marks";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const colorClass = getStatusColor(status);
  const label = getStatusLabel(status);
  const sizeClass =
    size === "sm" ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${colorClass} ${sizeClass}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "Approved"
            ? "bg-green-500"
            : status === "Submitted"
              ? "bg-blue-500"
              : "bg-amber-500"
        }`}
      />
      {label}
    </span>
  );
}
