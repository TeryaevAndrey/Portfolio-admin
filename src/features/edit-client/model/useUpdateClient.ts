import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/entities/client";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { clientQueries } from "@/entities/client";
import type { UpdateClientParams } from "@/entities/client";

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateClientParams }) =>
      clientApi.updateClient(id, data),
    onSuccess: () => {
      toast.success("Клиент обновлён успешно!");
      queryClient.invalidateQueries({
        queryKey: clientQueries.listKeys(),
      });
    },
    onError: (error: AxiosError) => {
      const data = error.response?.data as { message?: string };
      toast.error(data?.message || "Произошла ошибка при обновлении клиента");
    },
  });
};
