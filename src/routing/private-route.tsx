import { DashboardLayout } from "@/layout/dashboard-layout";
import { Navigate, Outlet } from "react-router-dom";

export const PrivateRoute = () => {
  const token = localStorage.getItem("access_token");
  const isAuth = Boolean(token);

  if (!isAuth) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};
