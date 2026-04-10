import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import {
  todoApi,
  todoQueries,
  TodoStatus,
  TODO_STATUS_LABELS,
  type Todo,
} from "@/entities/todo";
import { projectApi, projectQueries } from "@/entities/project";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

const schema = z.object({
  title: z.string().min(1, "Введите название задачи"),
  deadline: z.string().nullable().optional(),
  status: z.nativeEnum(TodoStatus),
  projectId: z.string().nullable().optional(),
});

type FormSchema = z.infer<typeof schema>;

interface Props {
  todo: Todo;
  trigger: React.ReactNode;
}

export const EditTodoSheet = ({ todo, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: projects } = useQuery({
    ...projectQueries.list({ limit: 100 }),
    enabled: open,
  });

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: todo.title,
      deadline: todo.deadline ?? null,
      status: todo.status,
      projectId: todo.projectId ? String(todo.projectId) : null,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormSchema) =>
      todoApi.update(todo.id, {
        title: data.title,
        deadline: data.deadline || null,
        status: data.status,
        projectId: data.projectId ? Number(data.projectId) : null,
      }),
    onSuccess: () => {
      toast.success("Задача обновлена!");
      queryClient.invalidateQueries({ queryKey: todoQueries.listKeys() });
      setOpen(false);
    },
    onError: (error: AxiosError) => {
      const d = error.response?.data as { message?: string };
      toast.error(d?.message || "Ошибка при обновлении");
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Редактирование задачи</SheetTitle>
        </SheetHeader>
        <form
          onSubmit={form.handleSubmit((d) => mutate(d))}
          className="flex flex-col gap-4 mt-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label>Задача *</Label>
            <Input {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Дедлайн</Label>
            <Input type="date" {...form.register("deadline")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Статус</Label>
            <Controller
              name="status"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(TodoStatus).map((s) => (
                      <SelectItem key={s} value={s}>
                        {TODO_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Проект</Label>
            <Controller
              name="projectId"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => field.onChange(v || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Не выбран" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.items.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Сохраняем..." : "Сохранить"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};
