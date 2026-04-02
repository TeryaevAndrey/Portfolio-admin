import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { format } from "date-fns";
import { Pencil, Search, Star } from "lucide-react";
import { reviewApi, reviewQueries } from "@/entities/review";
import { EditReviewSheet } from "@/features/edit-review";
import { RemoveReviewButton } from "@/features/remove-review";
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

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
      />
    ))}
  </div>
);

export const ReviewsTable = () => {
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
    queryKey: reviewQueries.listKeys({
      page: currentPage,
      limit: PAGE_LIMIT,
      search: currentSearch || undefined,
    }),
    queryFn: () =>
      reviewApi.getList({
        page: currentPage,
        limit: PAGE_LIMIT,
        search: currentSearch || undefined,
      }),
  });

  return (
    <Card className="gap-0 py-0 overflow-hidden">
      <div className="px-4 py-3 border-b">
        <InputGroup>
          <InputGroupAddon>
            <Search className="w-4 h-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Поиск по имени или тексту..."
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
              <TableHead>Автор</TableHead>
              <TableHead>Текст</TableHead>
              <TableHead className="w-28">Рейтинг</TableHead>
              <TableHead className="w-24">Статус</TableHead>
              <TableHead className="w-36">Создан</TableHead>
              <TableHead className="w-24 text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Загрузка...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !data?.items.length && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Отзывы не найдены
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="text-muted-foreground">{review.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {review.authorAvatar && (
                      <img
                        src={review.authorAvatar}
                        alt={review.authorName}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    )}
                    <div>
                      <p className="font-medium text-sm">{review.authorName}</p>
                      {review.authorPosition && (
                        <p className="text-xs text-muted-foreground">{review.authorPosition}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm line-clamp-2 max-w-80">{review.text}</p>
                </TableCell>
                <TableCell>
                  <StarRating rating={review.rating} />
                </TableCell>
                <TableCell>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      review.isPublished
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {review.isPublished ? "Опубликован" : "Скрыт"}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(review.createdAt), "dd.MM.yyyy")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1.5">
                    <EditReviewSheet
                      review={review}
                      trigger={
                        <Button variant="outline" size="icon">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      }
                    />
                    <RemoveReviewButton review={review} />
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
