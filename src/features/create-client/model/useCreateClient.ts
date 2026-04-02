import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClientApi } from "../api/create-client.api";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { clientQueries } from "@/entities/client";

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClientApi.createClient,
    onSuccess: () => {
      toast.success("Клиент добавлен успешно!");
      queryClient.invalidateQueries({
        queryKey: clientQueries.listKeys(),
      });
    },
    onError: (error: AxiosError) => {
      const data = error.response?.data as {
        message?: string;
      };
      toast.error(data?.message || "Произошла ошибка при добавлении клиента");
    },
  });
};
