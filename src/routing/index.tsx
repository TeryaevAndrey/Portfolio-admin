import { Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "./private-route";
import { PublicRoute } from "./public-route";
import { CasesPage } from "@/pages/dashboard/cases";
import { SignInPage } from "@/pages/auth/sign-in";
import { HomePage } from "@/pages/dashboard/home";
import { UsersPage } from "@/pages/dashboard/users";
import { ClientsPage } from "@/pages/dashboard/clients";
import { ProjectsPage } from "@/pages/dashboard/projects";
import { StatsPage } from "@/pages/dashboard/stats";
import { ReviewsPage } from "@/pages/dashboard/reviews";
import { ServicesPage } from "@/pages/dashboard/services";
import { ProposalTemplatesPage } from "@/pages/dashboard/proposal-templates";
import { TodosPage } from "@/pages/dashboard/todos";
import { PomodoroPage } from "@/pages/dashboard/pomodoro";
import { CalculatorPage } from "@/pages/dashboard/calculator";
import { LeadsPage } from "@/pages/dashboard/leads";
import { CallbacksPage } from "@/pages/dashboard/callbacks";
import { FinancePage } from "@/pages/dashboard/finance";
import { BlogPage } from "@/pages/dashboard/blog";
import { DocumentsPage } from "@/pages/dashboard/documents";
import { ActivityLogPage } from "@/pages/dashboard/activity-log";

export const Routing = () => {
  return (
    <Routes>
      {/* Публичные роуты */}
      <Route element={<PublicRoute />}>
        <Route path="/auth/sign-in" element={<SignInPage />} />
      </Route>

      {/* Группа защищенных роутов */}
      {/* Все, что внутри, будет обернуто в PrivateRoute (и DashboardLayout) */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<HomePage />} />
        <Route path="/dashboard/users" element={<UsersPage />} />
        <Route path="/dashboard/clients" element={<ClientsPage />} />
        <Route path="/dashboard/projects" element={<ProjectsPage />} />
        <Route path="/dashboard/cases" element={<CasesPage />} />
        <Route path="/dashboard/stats" element={<StatsPage />} />
        <Route path="/dashboard/reviews" element={<ReviewsPage />} />
        <Route path="/dashboard/services" element={<ServicesPage />} />
        <Route path="/dashboard/proposal-templates" element={<ProposalTemplatesPage />} />
        <Route path="/dashboard/todos" element={<TodosPage />} />
        <Route path="/dashboard/pomodoro" element={<PomodoroPage />} />
        <Route path="/dashboard/calculator" element={<CalculatorPage />} />
        <Route path="/dashboard/leads" element={<LeadsPage />} />
        <Route path="/dashboard/callbacks" element={<CallbacksPage />} />
        <Route path="/dashboard/finance" element={<FinancePage />} />
        <Route path="/dashboard/blog" element={<BlogPage />} />
        <Route path="/dashboard/documents" element={<DocumentsPage />} />
        <Route path="/dashboard/activity-log" element={<ActivityLogPage />} />
      </Route>

      {/* Редирект для всех несуществующих страниц (вместо Redirect) */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
