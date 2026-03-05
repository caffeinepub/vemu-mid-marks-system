import { Toaster } from "@/components/ui/sonner";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { PageLayout } from "./components/PageLayout";
import { AppProvider, useApp } from "./contexts/AppContext";
import { LoginPage } from "./pages/LoginPage";
import { ApprovalPage } from "./pages/faculty/ApprovalPage";
import { FacultyDashboard } from "./pages/faculty/FacultyDashboard";
import { MarksEntryPage } from "./pages/faculty/MarksEntryPage";
import { ReportsPage } from "./pages/faculty/ReportsPage";
import { StudentDashboard } from "./pages/student/StudentDashboard";

// ─── Auth Guard ─────────────────────────────────────────────
function RequireFaculty({ children }: { children: React.ReactNode }) {
  const { session } = useApp();
  if (!session) return <Navigate to="/login" />;
  if (session.role === "Student") return <Navigate to="/student/dashboard" />;
  return <>{children}</>;
}

function RequireApprover({ children }: { children: React.ReactNode }) {
  const { session } = useApp();
  if (!session) return <Navigate to="/login" />;
  if (session.role === "Student" || session.role === "SubjectFaculty") {
    return <Navigate to="/faculty/dashboard" />;
  }
  return <>{children}</>;
}

function RequireStudent({ children }: { children: React.ReactNode }) {
  const { session } = useApp();
  if (!session) return <Navigate to="/login" />;
  if (session.role !== "Student") return <Navigate to="/faculty/dashboard" />;
  return <>{children}</>;
}

// ─── Root component ────────────────────────────────────────
function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  );
}

// ─── Index Redirect ────────────────────────────────────────
function IndexRedirect() {
  const { session } = useApp();
  if (!session) return <Navigate to="/login" />;
  if (session.role === "Student") return <Navigate to="/student/dashboard" />;
  return <Navigate to="/faculty/dashboard" />;
}

// ─── Routes ────────────────────────────────────────────────
const rootRoute = createRootRoute({ component: RootComponent });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexRedirect,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const facultyDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/faculty/dashboard",
  component: () => (
    <RequireFaculty>
      <PageLayout>
        <FacultyDashboard />
      </PageLayout>
    </RequireFaculty>
  ),
});

const marksEntryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/faculty/marks-entry",
  component: () => (
    <RequireFaculty>
      <PageLayout>
        <MarksEntryPage />
      </PageLayout>
    </RequireFaculty>
  ),
});

const approvalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/faculty/approval",
  component: () => (
    <RequireApprover>
      <PageLayout>
        <ApprovalPage />
      </PageLayout>
    </RequireApprover>
  ),
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/faculty/reports",
  component: () => (
    <RequireFaculty>
      <PageLayout>
        <ReportsPage />
      </PageLayout>
    </RequireFaculty>
  ),
});

const studentDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student/dashboard",
  component: () => (
    <RequireStudent>
      <PageLayout>
        <StudentDashboard />
      </PageLayout>
    </RequireStudent>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  facultyDashboardRoute,
  marksEntryRoute,
  approvalRoute,
  reportsRoute,
  studentDashboardRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ─── App ───────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}
