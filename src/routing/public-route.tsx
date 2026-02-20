import { Navigate, Outlet } from "react-router-dom";

export const PublicRoute = () => {
  const token = localStorage.getItem("access_token");
  const isAuth = Boolean(token);

  if (isAuth) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
