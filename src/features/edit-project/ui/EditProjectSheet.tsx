import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { projectApi, projectQueries, type Project } from "@/entities/project";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { ProjectForm, projectFormToParams, projectToFormDefaults } from "@/shared/ui/project-form";
import type { ProjectFormSchema } from "@/shared/ui/project-form";

interface Props {
  project: Project;
  trigger: React.ReactNode;
}

export const EditProjectSheet = ({ project, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ProjectFormSchema) =>
      projectApi.update(project.id, projectFormToParams(data)),
    onSuccess: () => {
      toast.success("Проект обновлён!");
      queryClient.invalidateQueries({ queryKey: projectQueries.listKeys() });
      setOpen(false);
    },
    onError: (error: AxiosError) => {
      const data = error.response?.data as { message?: string };
      toast.error(data?.message || "Ошибка при обновлении проекта");
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Редактирование проекта</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <ProjectForm
            defaultValues={projectToFormDefaults(project)}
            onSubmit={mutate}
            isPending={isPending}
            submitLabel="Сохранить изменения"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
