import { Database, FileSearch } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: "search" | "data";
  ocid?: string;
}

export function EmptyState({
  title,
  description,
  icon = "search",
  ocid,
}: EmptyStateProps) {
  const Icon = icon === "data" ? Database : FileSearch;

  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      data-ocid={ocid}
    >
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      )}
    </div>
  );
}
