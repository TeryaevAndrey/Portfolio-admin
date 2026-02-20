import { UserRole } from "@/entities/user/model/types";
import { Card, CardContent, CardFooter } from "@/shared/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/ui/input-group";
import { PagePagination } from "@/shared/ui/page-pagination";
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
import { Text } from "@/shared/ui/text";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState, type HTMLAttributes } from "react";
import { userQueries } from "@/entities/user";
import { format } from "date-fns";
import { PAGE_LIMIT } from "@/shared/constants/pagination.constants";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";

interface Props extends HTMLAttributes<HTMLDivElement> {}

export const UsersTable = ({ className }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSearch = searchParams.get("search") || "";
  const currentRole = searchParams.get("role") || "";

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

          if (!newParams.hasOwnProperty("page")) {
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
    userQueries.list({
      search: currentSearch,
      role:
        currentRole === "" || currentRole === "ALL"
          ? undefined
          : (currentRole as UserRole | undefined),
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
              placeholder="Поиск..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            <InputGroupAddon align="inline-end">
              <Search />
            </InputGroupAddon>
          </InputGroup>

          <div className="flex items-center gap-4 flex-wrap">
            <Select
              value={currentRole || "ALL"}
              onValueChange={(val) =>
                updateFilters({ role: val === "ALL" ? "" : val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Все роли" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ALL">Все роли</SelectItem>
                  <SelectItem value={UserRole.admin}>Admin</SelectItem>
                  <SelectItem value={UserRole.user}>Пользователь</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Дата создания</TableHead>
              <TableHead>Последнее обновление</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {format(new Date(user.createdAt), "dd.MM.yyyy")}
                </TableCell>
                <TableCell>
                  {format(new Date(user.updatedAt), "dd.MM.yyyy")}
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
