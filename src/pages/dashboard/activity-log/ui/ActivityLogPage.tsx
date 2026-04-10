import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  activityLogApi,
  activityLogQueries,
  type ActivityAction,
} from "@/entities/activity-log";
import { PageBreadCrumbs } from "@/shared/ui/page-breadcrumbs";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/ui/input-group";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Card, CardContent, CardFooter } from "@/shared/ui/card";
import { PagePagination } from "@/shared/ui/page-pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  ClipboardList,
  FileText,
  Users,
  MessageSquare,
  BriefcaseBusiness,
  BookOpen,
  UserRound,
  Receipt,
} from "lucide-react";

const PAGE_LIMIT = 50;

// ── Helpers ────────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<ActivityAction, string> = {
  CREATED: "Создание",
  UPDATED: "Обновление",
  DELETED: "Удаление",
};

const ACTION_CLASSES: Record<ActivityAction, string> = {
  CREATED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  UPDATED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  DELETED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const ACTION_ICON_CLASSES: Record<ActivityAction, string> = {
  CREATED: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",
  UPDATED: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
  DELETED: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
};

const ActionIcon = ({ action }: { action: ActivityAction }) => {
  const map = { CREATED: Plus, UPDATED: Pencil, DELETED: Trash2 };
  const Icon = map[action];
  return (
    <div className={cn("flex items-center justify-center w-8 h-8 rounded-full shrink-0", ACTION_ICON_CLASSES[action])}>
      <Icon className="w-3.5 h-3.5" />
    </div>
  );
};

const ENTITY_ICONS: Record<string, React.ElementType> = {
  Client: Users,
  Contract: FileText,
  Invoice: Receipt,
  Lead: UserRound,
  Review: MessageSquare,
  Post: BookOpen,
  Case: BriefcaseBusiness,
};

const EntityIcon = ({ entityType }: { entityType: string }) => {
  const Icon = ENTITY_ICONS[entityType] ?? ClipboardList;
  return <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
};

const ENTITY_TYPE_LABELS: Record<string, string> = {
  Client: "Клиент",
  Contract: "Договор",
  Invoice: "Счёт",
  Lead: "Лид",
  Review: "Отзыв",
  Post: "Пост",
  Case: "Кейс",
};

const ENTITY_TYPES = Object.keys(ENTITY_TYPE_LABELS);

// ── Component ──────────────────────────────────────────────────────────────

export const ActivityLogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSearch = searchParams.get("search") || "";
  const currentEntityType = searchParams.get("entityType") || "";
  const currentAction = (searchParams.get("action") as ActivityAction | "") || "";

  const [localSearch, setLocalSearch] = useState(currentSearch);
  const [debouncedSearch] = useDebounce(localSearch, 600);

  useEffect(() => { setLocalSearch(currentSearch); }, [currentSearch]);

  const updateFilters = useCallback(
    (newParams: Record<string, string | number | undefined | null>) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        Object.entries(newParams).forEach(([key, value]) => {
          if (value === null || value === undefined || value === "") {
            params.delete(key);
          } else {
            params.set(key, String(value));
          }
        });
        if (!Object.prototype.hasOwnProperty.call(newParams, "page")) {
          params.set("page", "1");
        }
        return params;
      });
    },
    [setSearchParams]
  );

  useEffect(() => {
    updateFilters({ search: debouncedSearch || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { data, isLoading, refetch } = useQuery({
    ...activityLogQueries.list({
      page: currentPage,
      limit: PAGE_LIMIT,
      search: currentSearch || undefined,
      entityType: currentEntityType || undefined,
      action: (currentAction as ActivityAction) || undefined,
    }),
  });

  const clearMutation = useMutation({
    mutationFn: () => activityLogApi.clear(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityLogQueries.allKeys() });
    },
  });

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 lg:gap-6">
        <PageBreadCrumbs
          items={[
            { label: "Admin Panel" },
            { label: "Журнал действий", href: "/dashboard/activity-log" },
          ]}
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-9"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Обновить
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2 h-9">
                <Trash2 className="w-3.5 h-3.5" />
                Очистить журнал
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Очистить журнал действий?</AlertDialogTitle>
                <AlertDialogDescription>
                  Все записи будут удалены безвозвратно. Это действие нельзя отменить.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => clearMutation.mutate()}
                >
                  Очистить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="gap-0 py-0 overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-52">
            <InputGroup>
              <InputGroupAddon>
                <Search className="w-4 h-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Поиск по описанию..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </InputGroup>
          </div>

          {/* Entity type filter */}
          <Select
            value={currentEntityType || "_all"}
            onValueChange={(v) => updateFilters({ entityType: v === "_all" ? null : v })}
          >
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="Все типы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Все типы</SelectItem>
              {ENTITY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {ENTITY_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Action filter */}
          <Select
            value={currentAction || "_all"}
            onValueChange={(v) => updateFilters({ action: v === "_all" ? null : v })}
          >
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="Все действия" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Все действия</SelectItem>
              {(Object.keys(ACTION_LABELS) as ActivityAction[]).map((a) => (
                <SelectItem key={a} value={a}>
                  {ACTION_LABELS[a]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <CardContent className="p-0">
          {/* Loading */}
          {isLoading && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Загрузка...
            </div>
          )}

          {/* Empty */}
          {!isLoading && !data?.items.length && (
            <div className="py-12 text-center text-muted-foreground">
              <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Журнал пуст</p>
            </div>
          )}

          {/* Timeline */}
          {!isLoading && !!data?.items.length && (
            <div className="divide-y">
              {data.items.map((log) => (
                <div key={log.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                  {/* Action icon */}
                  <ActionIcon action={log.action} />

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Entity type chip */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                        <EntityIcon entityType={log.entityType} />
                        <span>{ENTITY_TYPE_LABELS[log.entityType] ?? log.entityType}</span>
                      </div>
                      {/* Action badge */}
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                        ACTION_CLASSES[log.action]
                      )}>
                        {ACTION_LABELS[log.action]}
                      </span>
                      {/* Entity ID */}
                      {log.entityId ? (
                        <span className="text-xs text-muted-foreground">#{log.entityId}</span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-foreground leading-snug">
                      {log.description}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <div className="text-xs text-muted-foreground shrink-0 text-right">
                    <div>{format(new Date(log.createdAt), "dd MMM yyyy", { locale: ru })}</div>
                    <div className="mt-0.5">{format(new Date(log.createdAt), "HH:mm:ss")}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {data && data.meta.totalPages > 1 && (
          <CardFooter className="border-t py-3">
            <PagePagination
              totalCount={data.meta.total}
              pageSize={PAGE_LIMIT}
              currentPage={currentPage}
            />
          </CardFooter>
        )}
      </Card>

      {/* Stats row */}
      {data && (
        <p className="text-xs text-muted-foreground text-right">
          Всего записей: {data.meta.total}
        </p>
      )}
    </>
  );
};
