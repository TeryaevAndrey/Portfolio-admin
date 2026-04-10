import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isPast, isToday, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { ArrowRight, ArrowLeft, CalendarClock, Briefcase, Pencil, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  todoApi,
  todoQueries,
  TodoStatus,
  TODO_STATUS_LABELS,
  TODO_STATUS_COLORS,
  type Todo,
} from "@/entities/todo";
import { EditTodoSheet } from "@/features/edit-todo";
import { RemoveTodoButton } from "@/features/remove-todo";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { cn } from "@/lib/utils";

const STATUS_ORDER = [TodoStatus.TODO, TodoStatus.IN_PROGRESS, TodoStatus.DONE];

const COLUMN_STYLES: Record<TodoStatus, string> = {
  [TodoStatus.TODO]: "border-slate-200 dark:border-slate-700",
  [TodoStatus.IN_PROGRESS]: "border-blue-200 dark:border-blue-800",
  [TodoStatus.DONE]: "border-green-200 dark:border-green-800",
};

const COLUMN_HEADER_STYLES: Record<TodoStatus, string> = {
  [TodoStatus.TODO]: "bg-slate-50 dark:bg-slate-900/50",
  [TodoStatus.IN_PROGRESS]: "bg-blue-50 dark:bg-blue-950/30",
  [TodoStatus.DONE]: "bg-green-50 dark:bg-green-950/30",
};

interface TodoCardProps {
  todo: Todo;
  canMoveLeft: boolean;
  canMoveRight: boolean;
}

const TodoCard = ({ todo, canMoveLeft, canMoveRight }: TodoCardProps) => {
  const queryClient = useQueryClient();

  const { mutate: changeStatus, isPending } = useMutation({
    mutationFn: (status: TodoStatus) => todoApi.update(todo.id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoQueries.listKeys() });
    },
    onError: () => toast.error("Ошибка при изменении статуса"),
  });

  const currentIdx = STATUS_ORDER.indexOf(todo.status);

  const deadlineInfo = (() => {
    if (!todo.deadline) return null;
    const date = parseISO(todo.deadline);
    const overdue = isPast(date) && !isToday(date) && todo.status !== TodoStatus.DONE;
    const isNear = isToday(date);
    return {
      label: format(date, "d MMM yyyy", { locale: ru }),
      overdue,
      isNear,
    };
  })();

  return (
    <Card className={cn("py-0 gap-0 group", isPending && "opacity-60 pointer-events-none")}>
      <CardContent className="p-3 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug flex-1">{todo.title}</p>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <EditTodoSheet
              todo={todo}
              trigger={
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              }
            />
            <RemoveTodoButton todo={todo} />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {todo.project && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Briefcase className="w-3 h-3 shrink-0" />
              <span className="truncate">{todo.project.title}</span>
            </div>
          )}
          {deadlineInfo && (
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs",
                deadlineInfo.overdue
                  ? "text-destructive font-medium"
                  : deadlineInfo.isNear
                  ? "text-amber-500 font-medium"
                  : "text-muted-foreground"
              )}
            >
              {deadlineInfo.overdue ? (
                <AlertCircle className="w-3 h-3 shrink-0" />
              ) : (
                <CalendarClock className="w-3 h-3 shrink-0" />
              )}
              <span>{deadlineInfo.label}</span>
              {deadlineInfo.overdue && <span>(просрочено)</span>}
              {deadlineInfo.isNear && <span>(сегодня)</span>}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              TODO_STATUS_COLORS[todo.status]
            )}
          >
            {TODO_STATUS_LABELS[todo.status]}
          </span>
          <div className="flex items-center gap-1">
            {canMoveLeft && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground"
                title="Переместить назад"
                onClick={() => changeStatus(STATUS_ORDER[currentIdx - 1])}
              >
                <ArrowLeft className="w-3 h-3" />
              </Button>
            )}
            {canMoveRight && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground"
                title="Переместить вперёд"
                onClick={() => changeStatus(STATUS_ORDER[currentIdx + 1])}
              >
                <ArrowRight className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const TodoKanban = () => {
  const { data, isLoading } = useQuery({
    queryKey: todoQueries.listKeys({ limit: 200 }),
    queryFn: () => todoApi.getList({ limit: 200 }),
  });

  const grouped = STATUS_ORDER.reduce<Record<TodoStatus, Todo[]>>(
    (acc, status) => {
      acc[status] = data?.items.filter((t) => t.status === status) ?? [];
      return acc;
    },
    {} as Record<TodoStatus, Todo[]>
  );

  if (isLoading) {
    return (
      <p className="text-center py-16 text-muted-foreground">Загрузка...</p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      {STATUS_ORDER.map((status, colIdx) => (
        <div key={status} className="flex flex-col gap-3">
          {/* Заголовок колонки */}
          <div
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg border",
              COLUMN_STYLES[status],
              COLUMN_HEADER_STYLES[status]
            )}
          >
            <span className="text-sm font-semibold">
              {TODO_STATUS_LABELS[status]}
            </span>
            <span className="text-xs text-muted-foreground bg-background border rounded-full px-2 py-0.5">
              {grouped[status].length}
            </span>
          </div>

          {/* Карточки */}
          <div className="flex flex-col gap-2">
            {grouped[status].length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">
                Нет задач
              </p>
            )}
            {grouped[status].map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                canMoveLeft={colIdx > 0}
                canMoveRight={colIdx < STATUS_ORDER.length - 1}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
