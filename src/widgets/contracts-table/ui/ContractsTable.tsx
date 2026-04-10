import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { format } from "date-fns";
import { Pencil, Search, FileText, ExternalLink, FileDown } from "lucide-react";
import { contractApi, contractQueries, type Contract, type ContractStatus } from "@/entities/contract";
import { ContractPDFBuilderModal } from "@/features/contract-pdf-builder";
import { CreateContractModal } from "@/features/create-contract";
import { EditContractSheet } from "@/features/edit-contract";
import { RemoveContractButton } from "@/features/remove-contract";
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
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<ContractStatus, string> = {
  draft: "Черновик",
  sent: "Отправлен",
  signed: "Подписан",
  cancelled: "Отменён",
};

const STATUS_CLASSES: Record<ContractStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  signed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export const ContractsTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSearch = searchParams.get("search") || "";

  const [localSearch, setLocalSearch] = useState(currentSearch);
  const [pdfContract, setPdfContract] = useState<Contract | null>(null);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { data, isLoading } = useQuery({
    queryKey: [
      ...contractQueries.listKeys(),
      { page: currentPage, limit: PAGE_LIMIT, search: currentSearch || undefined },
    ],
    queryFn: () =>
      contractApi.getList({
        page: currentPage,
        limit: PAGE_LIMIT,
        search: currentSearch || undefined,
      }),
  });

  const formatAmount = (amount: number | null, currency: string | null) => {
    if (amount == null) return "—";
    return `${Number(amount).toLocaleString("ru-RU")} ${currency ?? "RUB"}`;
  };

  return (
    <>
    <Card className="gap-0 py-0 overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <InputGroup>
            <InputGroupAddon>
              <Search className="w-4 h-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Поиск по названию..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </InputGroup>
        </div>
        <CreateContractModal />
      </div>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">ID</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead className="w-28">Статус</TableHead>
              <TableHead className="w-36">Сумма</TableHead>
              <TableHead className="w-28">Подписан</TableHead>
              <TableHead className="w-28">Истекает</TableHead>
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
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Договоры не найдены
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell className="text-muted-foreground">{contract.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium max-w-56 truncate">{contract.title}</span>
                    {contract.fileUrl && (
                      <a
                        href={contract.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  {contract.description && (
                    <p className="text-xs text-muted-foreground truncate max-w-56 mt-0.5">
                      {contract.description}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {contract.client ? (
                    <span>{contract.client.fullName}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      STATUS_CLASSES[contract.status]
                    )}
                  >
                    {STATUS_LABELS[contract.status]}
                  </span>
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {formatAmount(contract.amount, contract.currency)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {contract.signedAt
                    ? format(new Date(contract.signedAt), "dd.MM.yyyy")
                    : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {contract.expiresAt
                    ? format(new Date(contract.expiresAt), "dd.MM.yyyy")
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Сформировать PDF"
                      onClick={() => setPdfContract(contract)}
                    >
                      <FileDown className="w-4 h-4" />
                    </Button>
                    <EditContractSheet
                      contract={contract}
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      }
                    />
                    <RemoveContractButton contract={contract} />
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

    {pdfContract && (
      <ContractPDFBuilderModal
        contract={pdfContract}
        open={!!pdfContract}
        onOpenChange={(v) => { if (!v) setPdfContract(null); }}
      />
    )}
    </>
  );
};
