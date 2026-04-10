import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { format } from "date-fns";
import { Pencil, Search, BookOpen } from "lucide-react";
import { postApi, postQueries } from "@/entities/post";
import { CreatePostModal } from "@/features/create-post";
import { EditPostSheet } from "@/features/edit-post";
import { RemovePostButton } from "@/features/remove-post";
import { Card, CardContent, CardFooter } from "@/shared/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/ui/input-group";
import { Button } from "@/shared/ui/button";
import { PagePagination } from "@/shared/ui/page-pagination";
import { PAGE_LIMIT } from "@/shared/constants/pagination.constants";
import { cn } from "@/lib/utils";

export const PostsTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSearch = searchParams.get("search") || "";
  const currentOnlyPublished = searchParams.get("onlyPublished") === "true";

  const [localSearch, setLocalSearch] = useState(currentSearch);
  const [debouncedSearch] = useDebounce(localSearch, 700);

  useEffect(() => {
    setLocalSearch(currentSearch);
  }, [currentSearch]);

  const updateFilters = useCallback(
    (newParams: Record<string, string | number | boolean | undefined | null>) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        Object.entries(newParams).forEach(([key, value]) => {
          if (value === null || value === undefined || value === "" || value === false) {
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

  const { data, isLoading } = useQuery({
    queryKey: [
      ...postQueries.listKeys(),
      {
        page: currentPage,
        limit: PAGE_LIMIT,
        search: currentSearch || undefined,
        onlyPublished: currentOnlyPublished || undefined,
      },
    ],
    queryFn: () =>
      postApi.getList({
        page: currentPage,
        limit: PAGE_LIMIT,
        search: currentSearch || undefined,
        onlyPublished: currentOnlyPublished || undefined,
      }),
  });

  return (
    <Card className="gap-0 py-0 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <InputGroup>
            <InputGroupAddon>
              <Search className="w-4 h-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Поиск по заголовку..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </InputGroup>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            className="w-4 h-4"
            checked={currentOnlyPublished}
            onChange={(e) =>
              updateFilters({ onlyPublished: e.target.checked || null })
            }
          />
          Только опубликованные
        </label>
        <CreatePostModal />
      </div>

      {/* Cards grid */}
      <CardContent className="p-4">
        {isLoading && (
          <div className="text-center py-16 text-muted-foreground">
            Загрузка...
          </div>
        )}
        {!isLoading && !data?.items.length && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <BookOpen className="w-10 h-10 opacity-30" />
            <p>Статьи не найдены</p>
          </div>
        )}
        {data?.items && data.items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.items.map((post) => (
              <div
                key={post.id}
                className="border rounded-lg overflow-hidden flex flex-col bg-card"
              >
                {/* Cover image */}
                {post.coverImage && (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-40 object-cover"
                  />
                )}

                {/* Body */}
                <div className="flex-1 p-4 flex flex-col gap-2">
                  {/* Title + status */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1">
                      {post.title}
                    </h3>
                    <span
                      className={cn(
                        "shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
                        post.isPublished
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {post.isPublished ? "Опубликовано" : "Черновик"}
                    </span>
                  </div>

                  {/* Slug */}
                  {post.slug && (
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      /{post.slug}
                    </p>
                  )}

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {post.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 4 && (
                        <span className="text-xs text-muted-foreground">
                          +{post.tags.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Date */}
                  <p className="text-xs text-muted-foreground mt-auto pt-2">
                    {format(new Date(post.createdAt), "dd.MM.yyyy")}
                  </p>
                </div>

                {/* Footer actions */}
                <div className="border-t px-3 py-2 flex justify-end gap-1">
                  <EditPostSheet
                    post={post}
                    trigger={
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    }
                  />
                  <RemovePostButton post={post} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Pagination */}
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
