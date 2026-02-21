import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCaseApi } from "../api/create-case.api";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { caseQueries } from "@/entities/case";

export const useCreateCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCaseApi.createCase,
    onSuccess: () => {
      toast.success("Кейс создан успешно!");
      queryClient.invalidateQueries({
        queryKey: caseQueries.listKeys(),
      });
    },
    onError: (error: AxiosError) => {
      const data = error.response?.data as {
        message?: string;
      };

      toast.error(data?.message || "Произошла ошибка при создании кейса");
    },
  });
};
