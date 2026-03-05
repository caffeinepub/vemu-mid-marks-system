import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import { GraduationCap, Loader2, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../contexts/AppContext";
import type { AppRole } from "../types";

const DEMO_CREDENTIALS: Record<
  string,
  { password: string; role: AppRole; rollNumber?: string }
> = {
  hod1: { password: "hod123", role: "HOD" },
  ct1: { password: "ct123", role: "ClassTeacher" },
  sf1: { password: "sf123", role: "SubjectFaculty" },
  student1: { password: "stu123", role: "Student", rollNumber: "22B81A0501" },
};

const ROLE_LABELS: Record<AppRole, string> = {
  HOD: "HOD",
  ClassTeacher: "Class Teacher",
  SubjectFaculty: "Subject Faculty",
  Student: "Student",
};

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppRole | "">("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login } = useApp();
  const navigate = useNavigate();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!username.trim()) errs.username = "Username is required";
    if (!password) errs.password = "Password is required";
    if (!role) errs.role = "Please select a role";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    // Simulate network delay
    await new Promise((res) => setTimeout(res, 600));

    const creds = DEMO_CREDENTIALS[username];
    if (!creds || creds.password !== password || creds.role !== role) {
      setLoading(false);
      toast.error("Invalid credentials or role mismatch");
      setErrors({ auth: "Invalid username, password, or role" });
      return;
    }

    login({
      username,
      role: creds.role,
      rollNumber: creds.rollNumber,
      branch: "CSE",
      section: "A",
    });

    toast.success(`Welcome, ${username}!`);

    if (creds.role === "Student") {
      navigate({ to: "/student/dashboard" });
    } else {
      navigate({ to: "/faculty/dashboard" });
    }
    setLoading(false);
  };

  return (
    <div className="login-bg min-h-screen flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-64 h-64 rounded-full bg-white/3 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/6 w-96 h-96 rounded-full bg-amber-400/5 blur-3xl" />
        {/* Geometric grid lines */}
        <svg
          aria-hidden="true"
          role="presentation"
          className="absolute inset-0 w-full h-full opacity-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Header Card */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 mx-auto mb-4 flex items-center justify-center overflow-hidden"
          >
            <img
              src="/assets/uploads/image-1.png"
              alt="VEMU Institute of Technology"
              className="w-full h-full object-contain"
            />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-display font-bold text-white leading-tight"
          >
            VEMU Institute of Technology
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-white/60 mt-1 tracking-wide"
          >
            (Autonomous) · P. Kothakota, Chittoor
          </motion.p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Card Header Bar */}
          <div className="bg-primary px-6 py-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary-foreground/80" />
            <div>
              <h2 className="text-base font-semibold text-primary-foreground">
                Student Mid Marks System
              </h2>
              <p className="text-xs text-primary-foreground/60">
                Secure Academic Portal
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errors.auth && (
              <div
                className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg"
                data-ocid="login.error_state"
              >
                {errors.auth}
              </div>
            )}

            <div className="space-y-1.5">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-foreground"
              >
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrors((p) => ({ ...p, username: "", auth: "" }));
                }}
                data-ocid="login.username_input"
                className={`h-10 ${errors.username ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                autoComplete="username"
              />
              {errors.username && (
                <p className="text-xs text-destructive">{errors.username}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((p) => ({ ...p, password: "", auth: "" }));
                }}
                data-ocid="login.password_input"
                className={`h-10 ${errors.password ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">
                Role
              </Label>
              <Select
                value={role}
                onValueChange={(v) => {
                  setRole(v as AppRole);
                  setErrors((p) => ({ ...p, role: "" }));
                }}
              >
                <SelectTrigger
                  data-ocid="login.role_select"
                  className={`h-10 ${errors.role ? "border-destructive" : ""}`}
                >
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-xs text-destructive">{errors.role}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              data-ocid="login.submit_button"
              className="w-full h-11 text-sm font-semibold mt-2 bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Sign In to Portal
                </>
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="px-6 pb-6">
            <div className="bg-muted/60 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground/70 mb-1.5">
                Demo Credentials:
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                <span>HOD: hod1 / hod123</span>
                <span>ClassTeacher: ct1 / ct123</span>
                <span>Faculty: sf1 / sf123</span>
                <span>Student: student1 / stu123</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-xs text-white/30 mt-6">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="text-white/50 hover:text-white/70 underline"
            target="_blank"
            rel="noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
