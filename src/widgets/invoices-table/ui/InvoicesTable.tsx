import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { format } from "date-fns";
import { Pencil, Search, Receipt, ExternalLink, FileDown } from "lucide-react";
import { invoiceApi, invoiceQueries, type Invoice, type InvoiceStatus } from "@/entities/invoice";
import { InvoicePDFBuilderModal } from "@/features/invoice-pdf-builder";
import { CreateInvoiceModal } from "@/features/create-invoice";
import { EditInvoiceSheet } from "@/features/edit-invoice";
import { RemoveInvoiceButton } from "@/features/remove-invoice";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { PagePagination } from "@/shared/ui/page-pagination";
import { PAGE_LIMIT } from "@/shared/constants/pagination.constants";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Черновик",
  sent: "Отправлен",
  paid: "Оплачен",
  overdue: "Просрочен",
  cancelled: "Отменён",
};

const STATUS_CLASSES: Record<InvoiceStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  overdue: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export const InvoicesTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSearch = searchParams.get("search") || "";
  const currentStatus = (searchParams.get("status") as InvoiceStatus | null) ?? undefined;

  const [localSearch, setLocalSearch] = useState(currentSearch);
  const [pdfInvoice, setPdfInvoice] = useState<Invoice | null>(null);
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
      ...invoiceQueries.listKeys(),
      { page: currentPage, limit: PAGE_LIMIT, search: currentSearch || undefined, status: currentStatus },
    ],
    queryFn: () =>
      invoiceApi.getList({
        page: currentPage,
        limit: PAGE_LIMIT,
        search: currentSearch || undefined,
        status: currentStatus,
      }),
  });

  const formatAmount = (amount: number, currency: string) => {
    return `${Number(amount).toLocaleString("ru-RU")} ${currency}`;
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
              placeholder="Поиск по номеру или описанию..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </InputGroup>
        </div>
        <Select
          value={currentStatus ?? "all"}
          onValueChange={(v) =>
            updateFilters({ status: v === "all" ? null : v, page: "1" })
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="draft">Черновик</SelectItem>
            <SelectItem value="sent">Отправлен</SelectItem>
            <SelectItem value="paid">Оплачен</SelectItem>
            <SelectItem value="overdue">Просрочен</SelectItem>
            <SelectItem value="cancelled">Отменён</SelectItem>
          </SelectContent>
        </Select>
        <CreateInvoiceModal />
      </div>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">ID</TableHead>
              <TableHead>Номер</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead className="w-28">Статус</TableHead>
              <TableHead className="w-36">Сумма</TableHead>
              <TableHead className="w-28">Выставлен</TableHead>
              <TableHead className="w-28">Срок</TableHead>
              <TableHead className="w-28">Оплачен</TableHead>
              <TableHead className="w-24 text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                  Загрузка...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !data?.items.length && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                  <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Инвойсы не найдены
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="text-muted-foreground">{invoice.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium font-mono text-sm">{invoice.number}</span>
                    {invoice.fileUrl && (
                      <a
                        href={invoice.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  {invoice.description && (
                    <p className="text-xs text-muted-foreground truncate max-w-48 mt-0.5">
                      {invoice.description}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {invoice.client ? (
                    <span>{invoice.client.fullName}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      STATUS_CLASSES[invoice.status]
                    )}
                  >
                    {STATUS_LABELS[invoice.status]}
                  </span>
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {formatAmount(invoice.amount, invoice.currency)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {invoice.issuedAt
                    ? format(new Date(invoice.issuedAt), "dd.MM.yyyy")
                    : "—"}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-sm",
                    invoice.status === "overdue"
                      ? "text-orange-600 font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  {invoice.dueAt
                    ? format(new Date(invoice.dueAt), "dd.MM.yyyy")
                    : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {invoice.paidAt
                    ? format(new Date(invoice.paidAt), "dd.MM.yyyy")
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Сформировать PDF"
                      onClick={() => setPdfInvoice(invoice)}
                    >
                      <FileDown className="w-4 h-4" />
                    </Button>
                    <EditInvoiceSheet
                      invoice={invoice}
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      }
                    />
                    <RemoveInvoiceButton invoice={invoice} />
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

    {pdfInvoice && (
      <InvoicePDFBuilderModal
        invoice={pdfInvoice}
        open={!!pdfInvoice}
        onOpenChange={(v) => { if (!v) setPdfInvoice(null); }}
      />
    )}
    </>
  );
};
