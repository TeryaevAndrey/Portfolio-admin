import { useCallback, useEffect, useState, type HTMLAttributes } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Search,
  Pencil,
  ListChecks,
  Play,
  Pause,
  CheckCheck,
} from "lucide-react";

import { projectApi, projectQueries, ProjectStatus, PROJECT_STATUS_LABELS } from "@/entities/project";
import { sphereQueries } from "@/entities/sphere";
import { clientQueries } from "@/entities/client";
import { PAGE_LIMIT } from "@/shared/constants/pagination.constants";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardFooter } from "@/shared/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { Text } from "@/shared/ui/text";
import { PagePagination } from "@/shared/ui/page-pagination";
import { EditProjectSheet } from "@/features/edit-project";
import { ManageTasksSheet } from "@/features/manage-tasks";

const STATUS_COLORS: Record<ProjectStatus, string> = {
  [ProjectStatus.DRAFT]: "text-muted-foreground",
  [ProjectStatus.IN_PROGRESS]: "text-blue-500",
  [ProjectStatus.PAUSED]: "text-yellow-500",
  [ProjectStatus.COMPLETED]: "text-green-500",
  [ProjectStatus.CANCELLED]: "text-red-500",
};

interface Props extends HTMLAttributes<HTMLDivElement> {}

export const ProjectsTable = ({ className }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSearch = searchParams.get("search") || "";
  const currentStatus = (searchParams.get("status") as ProjectStatus) || "";
  const currentSphereId = searchParams.get("sphereId") || "";
  const currentClientId = searchParams.get("clientId") || "";

  const [localSearch, setLocalSearch] = useState(currentSearch);
  const [debouncedSearch] = useDebounce(localSearch, 700);

  useEffect(() => setLocalSearch(currentSearch), [currentSearch]);

  const updateFilters = useCallback(
    (newParams: Record<string, string | number | undefined | null>) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          Object.entries(newParams).forEach(([key, value]) => {
            if (value === null || value === undefined || value === "" || value === "ALL") {
              params.delete(key);
            } else {
              params.set(key, String(value));
            }
          });
          if (!Object.prototype.hasOwnProperty.call(newParams, "page")) {
            params.set("page", "1");
          }
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (debouncedSearch !== currentSearch) {
      updateFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch, currentSearch, updateFilters]);

  const { data } = useQuery(
    projectQueries.list({
      search: currentSearch || undefined,
      status: currentStatus || undefined,
      sphereId: currentSphereId ? Number(currentSphereId) : undefined,
      clientId: currentClientId ? Number(currentClientId) : undefined,
      page: currentPage,
      limit: PAGE_LIMIT,
    }),
  );

  const { data: spheres } = useQuery(sphereQueries.list());
  const { data: clients } = useQuery(clientQueries.list({ limit: 100 }));

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ProjectStatus }) =>
      projectApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectQueries.listKeys() });
      toast.success("Статус проекта обновлён");
    },
    onError: () => toast.error("Ошибка при обновлении статуса"),
  });

  const setStatus = (id: number, status: ProjectStatus) => {
    statusMutation.mutate({ id, status });
  };

  return (
    <Card className={cn(className)}>
      <CardContent>
        {/* Фильтры */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <InputGroup className="lg:max-w-xs">
            <InputGroupInput
              placeholder="Поиск по названию..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            <InputGroupAddon align="inline-end">
              <Search />
            </InputGroupAddon>
          </InputGroup>

          {/* Статус */}
          <Select
            value={currentStatus || "ALL"}
            onValueChange={(v) => updateFilters({ status: v === "ALL" ? "" : v })}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ALL">Все статусы</SelectItem>
                {Object.values(ProjectStatus).map((s) => (
                  <SelectItem key={s} value={s}>
                    {PROJECT_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Сфера */}
          <Select
            value={currentSphereId || "ALL"}
            onValueChange={(v) => updateFilters({ sphereId: v === "ALL" ? "" : v })}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Все сферы" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ALL">Все сферы</SelectItem>
                {spheres?.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Клиент */}
          <Select
            value={currentClientId || "ALL"}
            onValueChange={(v) => updateFilters({ clientId: v === "ALL" ? "" : v })}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Все клиенты" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ALL">Все клиенты</SelectItem>
                {clients?.items.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.fullName}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Таблица */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Сфера</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Стоимость</TableHead>
              <TableHead>Оплачено</TableHead>
              <TableHead>Задачи</TableHead>
              <TableHead>Срок</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.id}</TableCell>
                <TableCell className="font-medium max-w-[180px] truncate">
                  {project.title}
                </TableCell>
                <TableCell>{project.client?.fullName || "—"}</TableCell>
                <TableCell>{project.sphere?.name || "—"}</TableCell>
                <TableCell>
                  <span className={cn("text-sm font-medium", STATUS_COLORS[project.status])}>
                    {PROJECT_STATUS_LABELS[project.status]}
                  </span>
                </TableCell>
                <TableCell>
                  {project.totalCost
                    ? `${Number(project.totalCost).toLocaleString("ru-RU")} ₽`
                    : "—"}
                </TableCell>
                <TableCell>
                  {project.paidAmount
                    ? `${Number(project.paidAmount).toLocaleString("ru-RU")} ₽`
                    : "—"}
                </TableCell>
                <TableCell>{project.tasks.length}</TableCell>
                <TableCell>
                  {project.deadline
                    ? format(new Date(project.deadline), "dd.MM.yyyy")
                    : "—"}
                </TableCell>

                {/* Действия */}
                <TableCell>
                  <div className="flex items-center gap-1">
                    {/* Кнопки статуса */}
                    {project.status === ProjectStatus.DRAFT && (
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        title="Начать"
                        onClick={() => setStatus(project.id, ProjectStatus.IN_PROGRESS)}
                      >
                        <Play className="w-3.5 h-3.5 text-blue-500" />
                      </Button>
                    )}
                    {project.status === ProjectStatus.IN_PROGRESS && (
                      <>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Приостановить"
                          onClick={() => setStatus(project.id, ProjectStatus.PAUSED)}
                        >
                          <Pause className="w-3.5 h-3.5 text-yellow-500" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Завершить"
                          onClick={() => setStatus(project.id, ProjectStatus.COMPLETED)}
                        >
                          <CheckCheck className="w-3.5 h-3.5 text-green-500" />
                        </Button>
                      </>
                    )}
                    {project.status === ProjectStatus.PAUSED && (
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        title="Продолжить"
                        onClick={() => setStatus(project.id, ProjectStatus.IN_PROGRESS)}
                      >
                        <Play className="w-3.5 h-3.5 text-blue-500" />
                      </Button>
                    )}

                    {/* Задачи */}
                    <ManageTasksSheet
                      project={project}
                      trigger={
                        <Button size="icon-sm" variant="ghost" title="Задачи">
                          <ListChecks className="w-3.5 h-3.5" />
                        </Button>
                      }
                    />

                    {/* Редактировать */}
                    <EditProjectSheet
                      project={project}
                      trigger={
                        <Button size="icon-sm" variant="ghost" title="Редактировать">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter>
        <div className="flex justify-between items-center flex-wrap w-full">
          <Text size="sm" color="mutedForeground">
            Всего: {data?.meta.total || 0}
          </Text>
          <PagePagination
            className="w-max"
            totalCount={data?.meta.total || 0}
            pageSize={data?.meta.limit || PAGE_LIMIT}
            currentPage={data?.meta.page || 1}
          />
        </div>
      </CardFooter>
    </Card>
  );
};
