import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { format } from "date-fns";
import { Pencil, Search } from "lucide-react";
import { serviceApi, serviceQueries } from "@/entities/service";
import { EditServiceSheet } from "@/features/edit-service";
import { RemoveServiceButton } from "@/features/remove-service";
import { Card, CardContent, CardFooter } from "@/shared/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { PagePagination } from "@/shared/ui/page-pagination";
import { PAGE_LIMIT } from "@/shared/constants/pagination.constants";

export const ServicesTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSearch = searchParams.get("search") || "";

  const [localSearch, setLocalSearch] = useState(currentSearch);
  const [debouncedSearch] = useDebounce(localSearch, 700);

  useEffect(() => {
    setLocalSearch(currentSearch);
  }, [currentSearch]);

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
  }, [debouncedSearch]);

  const { data, isLoading } = useQuery({
    queryKey: serviceQueries.listKeys({
      page: currentPage,
      limit: PAGE_LIMIT,
      search: currentSearch || undefined,
    }),
    queryFn: () =>
      serviceApi.getList({
        page: currentPage,
        limit: PAGE_LIMIT,
        search: currentSearch || undefined,
      }),
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(price);

  return (
    <Card className="gap-0 py-0 overflow-hidden">
      <div className="px-4 py-3 border-b">
        <InputGroup>
          <InputGroupAddon>
            <Search className="w-4 h-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Поиск по названию или описанию..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </InputGroup>
      </div>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">ID</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead className="w-36">Цена</TableHead>
              <TableHead className="w-32">Срок</TableHead>
              <TableHead className="w-24">Статус</TableHead>
              <TableHead className="w-36">Создана</TableHead>
              <TableHead className="w-24 text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  Загрузка...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !data?.items.length && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  Услуги не найдены
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="text-muted-foreground">{service.id}</TableCell>
                <TableCell>
                  <p className="font-medium text-sm">{service.name}</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm line-clamp-2 max-w-80 text-muted-foreground">
                    {service.description}
                  </p>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-sm">{formatPrice(service.price)}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{service.duration}</span>
                </TableCell>
                <TableCell>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      service.isPublished
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {service.isPublished ? "Опубликована" : "Скрыта"}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(service.createdAt), "dd.MM.yyyy")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1.5">
                    <EditServiceSheet
                      service={service}
                      trigger={
                        <Button variant="outline" size="icon">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      }
                    />
                    <RemoveServiceButton service={service} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
  );
};
