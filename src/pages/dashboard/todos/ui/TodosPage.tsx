import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/shared/ui/breadcrumb";
import { CreateTodoModal } from "@/features/create-todo";
import { TodoKanban } from "@/widgets/todo-kanban";

export const TodosPage = () => {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Таск-менеджер</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold">Таск-менеджер</h1>
          <p className="text-sm text-muted-foreground">
            Управление задачами: задача, дедлайн, проект, статус
          </p>
        </div>
        <CreateTodoModal />
      </div>

      <TodoKanban />
    </div>
  );
};
