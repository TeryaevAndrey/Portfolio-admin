import { useMutation } from "@tanstack/react-query";
import { logoutApi } from "../api/logout.api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutApi.logout,
    onSuccess: () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      toast.success("Вы успешно вышли из системы");

      navigate("/auth/sign-in");
    },
    onError: () => {
      toast.error("Не получилось выйти из системы");
    },
  });
};
