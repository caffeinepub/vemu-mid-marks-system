import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../contexts/AppContext";
import type { AppRole } from "../types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: AppRole[];
  ocid: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/faculty/dashboard",
    icon: LayoutDashboard,
    roles: ["HOD", "ClassTeacher", "SubjectFaculty"],
    ocid: "nav.dashboard_link",
  },
  {
    label: "Marks Entry",
    href: "/faculty/marks-entry",
    icon: ClipboardList,
    roles: ["HOD", "ClassTeacher", "SubjectFaculty"],
    ocid: "nav.marks_entry_link",
  },
  {
    label: "Approvals",
    href: "/faculty/approval",
    icon: CheckCircle2,
    roles: ["HOD", "ClassTeacher"],
    ocid: "nav.approval_link",
  },
  {
    label: "Reports",
    href: "/faculty/reports",
    icon: BarChart3,
    roles: ["HOD", "ClassTeacher", "SubjectFaculty"],
    ocid: "nav.reports_link",
  },
  {
    label: "My Marks",
    href: "/student/dashboard",
    icon: GraduationCap,
    roles: ["Student"],
    ocid: "nav.dashboard_link",
  },
];

export function AppSidebar() {
  const { session, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  if (!session) return null;

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(session.role),
  );

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate({ to: "/login" });
  };

  const roleLabel: Record<AppRole, string> = {
    HOD: "Head of Department",
    ClassTeacher: "Class Teacher",
    SubjectFaculty: "Subject Faculty",
    Student: "Student",
  };

  return (
    <aside className="sidebar-gradient flex flex-col h-screen w-64 shrink-0 sticky top-0 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
            <img
              src="/assets/uploads/image-1.png"
              alt="VEMU Institute of Technology"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider leading-tight">
              VEMU
            </p>
            <p className="text-sm font-display font-semibold text-sidebar-foreground leading-tight truncate">
              Mid Marks System
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-3 mx-3 mt-4 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-sidebar-primary-foreground uppercase">
              {session.username.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {session.username}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {roleLabel[session.role]}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-2 text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/40 mb-2">
          Navigation
        </p>
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              data-ocid={item.ocid}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-white/15 text-sidebar-foreground shadow-[inset_3px_0_0_oklch(0.75_0.18_75)]"
                  : "text-sidebar-foreground/70 hover:bg-white/8 hover:text-sidebar-foreground"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive
                    ? "text-sidebar-primary"
                    : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
                }`}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3 h-3 text-sidebar-primary opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-sidebar-border pt-3">
        <div className="flex items-center gap-2 px-3 py-2 mb-2">
          <BookOpen className="w-3 h-3 text-sidebar-foreground/40" />
          <span className="text-xs text-sidebar-foreground/40">
            VEMU — Autonomous
          </span>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          data-ocid="nav.logout_button"
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-destructive-foreground hover:bg-destructive/20 text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
