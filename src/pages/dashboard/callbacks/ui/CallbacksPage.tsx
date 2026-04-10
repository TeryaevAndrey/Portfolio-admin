import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { callbackApi, callbackQueries } from "@/entities/callback";
import { CallbacksList } from "@/widgets/callbacks-list";
import { Search, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export const CallbacksPage = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [onlyUnread, setOnlyUnread] = useState(false);

  const { data: unreadData } = useQuery({
    queryKey: callbackQueries.unreadCountKeys(),
    queryFn: callbackApi.getUnreadCount,
    refetchInterval: 30_000,
  });

  const unreadCount = unreadData?.count ?? 0;

  const handleSearch = (value: string) => {
    setSearch(value);
    clearTimeout((handleSearch as any)._timer);
    (handleSearch as any)._timer = setTimeout(
      () => setDebouncedSearch(value),
      400
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Дашборд</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Заявки</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Заявки</h1>
            {unreadCount > 0 && (
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Входящие заявки с формы обратной связи
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={onlyUnread ? "default" : "outline"}
            size="sm"
            onClick={() => setOnlyUnread((v) => !v)}
            className={cn("gap-1.5")}
          >
            <Inbox className="w-4 h-4" />
            Непрочитанные
            {unreadCount > 0 && (
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  onlyUnread
                    ? "bg-white/20 text-white"
                    : "bg-blue-500 text-white"
                )}
              >
                {unreadCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-8"
          placeholder="Поиск по имени, email..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* List */}
      <CallbacksList
        params={{
          search: debouncedSearch || undefined,
          onlyUnread: onlyUnread || undefined,
          limit: 50,
        }}
      />
    </div>
  );
};
