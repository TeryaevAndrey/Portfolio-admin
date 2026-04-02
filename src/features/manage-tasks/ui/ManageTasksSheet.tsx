import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectApi, projectQueries, type Project, type Task } from "@/entities/project";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Pencil, Trash, Plus, Check, X } from "lucide-react";
import { Separator } from "@/shared/ui/separator";

const TaskLine = ({
  task,
  projectId,
}: {
  task: Task;
  projectId: number;
}) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [cost, setCost] = useState(task.cost ? String(task.cost) : "");
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: projectQueries.listKeys() });
  };

  const updateMutation = useMutation({
    mutationFn: () =>
      projectApi.updateTask(projectId, task.id, {
        title,
        description: description || undefined,
        cost: cost ? Number(cost) : undefined,
      }),
    onSuccess: () => {
      invalidate();
      setEditing(false);
      toast.success("Задача обновлена");
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => projectApi.removeTask(projectId, task.id),
    onSuccess: () => {
      invalidate();
      toast.success("Задача удалена");
    },
  });

  if (editing) {
    return (
      <div className="flex flex-col gap-2 p-3 border rounded-lg">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название задачи"
          autoFocus
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Описание"
          rows={2}
        />
        <Input
          type="number"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="Стоимость"
        />
        <div className="flex gap-2">
          <Button
            size="icon-sm"
            variant="accent"
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={() => setEditing(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-2 p-3 border rounded-lg">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{task.title}</p>
        {task.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
        )}
        {task.cost != null && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {Number(task.cost).toLocaleString("ru-RU")} ₽
          </p>
        )}
      </div>
      <div className="flex gap-1 shrink-0">
        <Button size="icon-sm" variant="ghost" onClick={() => setEditing(true)}>
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="icon-sm"
          variant="destructive"
          onClick={() => removeMutation.mutate()}
          disabled={removeMutation.isPending}
        >
          <Trash className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

interface Props {
  project: Project;
  trigger: React.ReactNode;
}

export const ManageTasksSheet = ({ project, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCost, setNewCost] = useState("");
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () =>
      projectApi.createTask(project.id, {
        title: newTitle,
        description: newDescription || undefined,
        cost: newCost ? Number(newCost) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectQueries.listKeys() });
      setNewTitle("");
      setNewDescription("");
      setNewCost("");
      toast.success("Задача добавлена");
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Задачи: {project.title}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex flex-col gap-4">
          {/* Новая задача */}
          <FieldGroup>
            <Field>
              <FieldLabel>Новая задача</FieldLabel>
              <Input
                placeholder="Название задачи"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </Field>
            <Textarea
              placeholder="Описание (необязательно)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={2}
            />
            <Input
              type="number"
              placeholder="Стоимость задачи"
              value={newCost}
              onChange={(e) => setNewCost(e.target.value)}
            />
            <Button
              variant="accent"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !newTitle.trim()}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить задачу
            </Button>
          </FieldGroup>

          <Separator />

          {/* Список задач */}
          <div className="flex flex-col gap-2">
            {project.tasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Задач ещё нет
              </p>
            )}
            {project.tasks.map((task) => (
              <TaskLine key={task.id} task={task} projectId={project.id} />
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
