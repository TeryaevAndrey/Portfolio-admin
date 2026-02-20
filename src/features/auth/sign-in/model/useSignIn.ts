import { useMutation } from "@tanstack/react-query";
import { signInApi } from "../api/sign-in.api";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

export const useSignIn = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: signInApi.signIn,
    onSuccess: (data) => {
      localStorage.setItem("access_token", data.accessToken);
      localStorage.setItem("refresh_token", data.refreshToken);

      navigate("/dashboard");

      toast.success("Авторизация прошла успешно!");
    },
    onError: (error: AxiosError) => {
      const data = error.response?.data as {
        message?: string;
      };

      toast.error(data?.message || "Произошла ошибка");
    },
  });
};
