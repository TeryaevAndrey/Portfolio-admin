import { axiosInstance } from "@/shared/api/base";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RemoveCaseResponse } from "./types";
import { toast } from "sonner";
import { caseQueries } from "@/entities/case";
import type { AxiosError } from "axios";

export const useRemoveCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete<RemoveCaseResponse>(
        `/cases/${id}`,
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caseQueries.listKeys() });

      toast.success("Кейс успешно удален!");
    },
    onError: (error: AxiosError) => {
      const data = error.response?.data as {
        message?: string;
      };

      toast.error(data?.message || "Произошла ошибка при удалении кейса");
    },
  });
};
