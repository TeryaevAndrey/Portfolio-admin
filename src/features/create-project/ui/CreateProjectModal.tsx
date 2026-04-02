import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { projectApi, projectQueries } from "@/entities/project";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { ProjectForm, projectFormToParams } from "@/shared/ui/project-form";
import type { ProjectFormSchema } from "@/shared/ui/project-form";

export const CreateProjectModal = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: projectApi.create,
    onSuccess: () => {
      toast.success("Проект создан!");
      queryClient.invalidateQueries({ queryKey: projectQueries.listKeys() });
      setOpen(false);
    },
    onError: (error: AxiosError) => {
      const data = error.response?.data as { message?: string };
      toast.error(data?.message || "Ошибка при создании проекта");
    },
  });

  const onSubmit = (data: ProjectFormSchema) => {
    mutate(projectFormToParams(data));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent">Добавить проект</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новый проект</DialogTitle>
        </DialogHeader>
        <ProjectForm
          onSubmit={onSubmit}
          isPending={isPending}
          submitLabel="Создать проект"
        />
      </DialogContent>
    </Dialog>
  );
};
