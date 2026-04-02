import { Card, CardContent, CardFooter } from "@/shared/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/ui/input-group";
import { PagePagination } from "@/shared/ui/page-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Text } from "@/shared/ui/text";
import { Pencil, Search } from "lucide-react";
import { useCallback, useEffect, useState, type HTMLAttributes } from "react";
import { clientQueries } from "@/entities/client";
import { format } from "date-fns";
import { PAGE_LIMIT } from "@/shared/constants/pagination.constants";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { EditClientModal } from "@/features/edit-client";
import { Button } from "@/shared/ui/button";

interface Props extends HTMLAttributes<HTMLDivElement> {}

export const ClientsTable = ({ className }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSearch = searchParams.get("search") || "";

  const [localSearch, setLocalSearch] = useState(currentSearch);
  const [debouncedSearchValue] = useDebounce(localSearch, 1000);

  useEffect(() => {
    setLocalSearch(currentSearch);
  }, [currentSearch]);

  const updateFilters = useCallback(
    (newParams: Record<string, string | number | undefined | null>) => {
      setSearchParams(
        (prev) => {
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
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (debouncedSearchValue !== currentSearch) {
      updateFilters({ search: debouncedSearchValue });
    }
  }, [debouncedSearchValue, currentSearch, updateFilters]);

  const { data } = useQuery(
    clientQueries.list({
      search: currentSearch || undefined,
      page: currentPage,
      limit: PAGE_LIMIT,
    }),
  );

  return (
    <Card className={cn(className)}>
      <CardContent>
        <div className="mb-4 flex justify-between items-center gap-4 flex-wrap">
          <InputGroup className="lg:max-w-3xs">
            <InputGroupInput
              placeholder="Поиск по ФИО, email, телефону..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            <InputGroupAddon align="inline-end">
              <Search />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>ФИО</TableHead>
              <TableHead>Telegram</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Откуда пришел</TableHead>
              <TableHead>Дата добавления</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.id}</TableCell>
                <TableCell>{client.fullName}</TableCell>
                <TableCell>{client.telegram || "—"}</TableCell>
                <TableCell>{client.phone || "—"}</TableCell>
                <TableCell>{client.email || "—"}</TableCell>
                <TableCell>{client.source || "—"}</TableCell>
                <TableCell>
                  {format(new Date(client.createdAt), "dd.MM.yyyy")}
                </TableCell>
                <TableCell>
                  <EditClientModal
                    client={client}
                    trigger={
                      <Button variant="ghost" size="icon">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="flex justify-between items-center flex-wrap w-full mx-0">
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
