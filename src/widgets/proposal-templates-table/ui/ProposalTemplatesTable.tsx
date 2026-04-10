import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { format } from "date-fns";
import { Check, ClipboardCopy, Pencil, Search } from "lucide-react";
import { proposalTemplateApi, proposalTemplateQueries } from "@/entities/proposal-template";
import { EditProposalTemplateSheet } from "@/features/edit-proposal-template";
import { RemoveProposalTemplateButton } from "@/features/remove-proposal-template";
import { Card, CardContent, CardFooter } from "@/shared/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/ui/input-group";
import { Button } from "@/shared/ui/button";
import { PagePagination } from "@/shared/ui/page-pagination";
import { PAGE_LIMIT } from "@/shared/constants/pagination.constants";
import { toast } from "sonner";

export const ProposalTemplatesTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [copiedId, setCopiedId] = useState<number | null>(null);

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
    queryKey: proposalTemplateQueries.listKeys({
      page: currentPage,
      limit: PAGE_LIMIT,
      search: currentSearch || undefined,
    }),
    queryFn: () =>
      proposalTemplateApi.getList({
        page: currentPage,
        limit: PAGE_LIMIT,
        search: currentSearch || undefined,
      }),
  });

  const handleCopy = async (id: number, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      toast.success("Шаблон скопирован в буфер обмена");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-0 py-0 overflow-hidden">
        <div className="px-4 py-3">
          <InputGroup>
            <InputGroupAddon>
              <Search className="w-4 h-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Поиск по названию или тексту..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </InputGroup>
        </div>
      </Card>

      {isLoading && (
        <p className="text-center py-16 text-muted-foreground">Загрузка...</p>
      )}

      {!isLoading && !data?.items.length && (
        <p className="text-center py-16 text-muted-foreground">
          Шаблоны не найдены
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data?.items.map((template) => (
          <Card key={template.id} className="flex flex-col gap-0 py-0 overflow-hidden">
            <CardContent className="flex flex-col gap-3 p-4 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-base leading-tight">
                  {template.title}
                </h3>
                <span className="text-xs text-muted-foreground shrink-0">
                  #{template.id}
                </span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap flex-1">
                {template.content}
              </p>
            </CardContent>
            <CardFooter className="border-t px-4 py-3 flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {format(new Date(template.createdAt), "dd.MM.yyyy")}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  title="Копировать текст"
                  onClick={() => handleCopy(template.id, template.content)}
                >
                  {copiedId === template.id ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <ClipboardCopy className="w-4 h-4" />
                  )}
                </Button>
                <EditProposalTemplateSheet
                  template={template}
                  trigger={
                    <Button variant="outline" size="icon" title="Редактировать">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  }
                />
                <RemoveProposalTemplateButton template={template} />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {data && data.meta.totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <PagePagination
            currentPage={currentPage}
            totalPages={data.meta.totalPages}
            onPageChange={(page) => updateFilters({ page })}
          />
        </div>
      )}
    </div>
  );
};
