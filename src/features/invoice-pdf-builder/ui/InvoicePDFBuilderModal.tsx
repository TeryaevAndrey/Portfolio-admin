import { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { BlobProvider, PDFDownloadLink } from "@react-pdf/renderer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";
import { Save, Download, Receipt, RefreshCw, Plus, Trash2 } from "lucide-react";
import { InvoicePDFDocument, type InvoicePDFData } from "../lib/InvoicePDFDocument";
import type { Invoice } from "@/entities/invoice";

const SELLER_STORAGE_KEY = "pdf_company_info";
const CURRENCIES = ["RUB", "USD", "EUR", "CNY"];
const VAT_RATES = [
  { label: "Без НДС", value: 0 },
  { label: "НДС 10%", value: 10 },
  { label: "НДС 20%", value: 20 },
];

const loadSellerFromStorage = (): Partial<InvoicePDFData> => {
  try {
    const raw = localStorage.getItem(SELLER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const buildInitialData = (invoice: Invoice): InvoicePDFData => {
  const saved = loadSellerFromStorage();
  const now = new Date().toLocaleDateString("ru-RU");
  return {
    invoiceNumber: invoice.number || invoice.id?.toString() || "",
    invoiceDate: invoice.issuedAt
      ? new Date(invoice.issuedAt).toLocaleDateString("ru-RU")
      : now,
    dueDate: invoice.dueAt
      ? new Date(invoice.dueAt).toLocaleDateString("ru-RU")
      : "",
    // Продавец (из localStorage)
    sellerName: (saved as Record<string, string>).sellerName ?? "",
    sellerAddress: (saved as Record<string, string>).sellerAddress ?? "",
    sellerINN: (saved as Record<string, string>).sellerINN ?? "",
    sellerOGRN: (saved as Record<string, string>).sellerOGRN ?? "",
    sellerRepresentative: (saved as Record<string, string>).sellerRepresentative ?? "",
    sellerBank: (saved as Record<string, string>).sellerBank ?? "",
    sellerAccount: (saved as Record<string, string>).sellerAccount ?? "",
    sellerBIK: (saved as Record<string, string>).sellerBIK ?? "",
    sellerCorrAccount: (saved as Record<string, string>).sellerCorrAccount ?? "",
    // Покупатель
    clientName: invoice.client?.fullName ?? "",
    clientAddress: "",
    clientINN: "",
    // Позиции
    items: [
      {
        description: invoice.description || "",
        qty: 1,
        unit: "шт.",
        unitPrice: invoice.amount ? Number(invoice.amount) : 0,
      },
    ],
    vatRate: 20,
    currency: invoice.currency ?? "RUB",
    notes: "",
  };
};

// ---------------------------------------------------------------------------

interface Props {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const FLabel = ({ children }: { children: React.ReactNode }) => (
  <Label className="text-xs text-muted-foreground">{children}</Label>
);

const SectionHeading = ({ title }: { title: string }) => (
  <div className="mb-2 mt-4">
    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
    <Separator className="mt-1" />
  </div>
);

export const InvoicePDFBuilderModal = ({ invoice, open, onOpenChange }: Props) => {
  const initialData = buildInitialData(invoice);
  const form = useForm<InvoicePDFData>({ defaultValues: initialData });
  const { register, watch, setValue, getValues, reset, control } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    reset(buildInitialData(invoice));
  }, [invoice.id]);

  // Debounced preview
  const [previewData, setPreviewData] = useState<InvoicePDFData>(initialData);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formValues = watch();

  useEffect(() => {
    clearTimeout(debounceRef.current ?? undefined);
    debounceRef.current = setTimeout(() => {
      setPreviewData(getValues());
    }, 700);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(formValues)]);

  const saveSellerInfo = () => {
    const v = getValues();
    const info = {
      sellerName: v.sellerName,
      sellerAddress: v.sellerAddress,
      sellerINN: v.sellerINN,
      sellerOGRN: v.sellerOGRN,
      sellerRepresentative: v.sellerRepresentative,
      sellerBank: v.sellerBank,
      sellerAccount: v.sellerAccount,
      sellerBIK: v.sellerBIK,
      sellerCorrAccount: v.sellerCorrAccount,
    };
    localStorage.setItem(SELLER_STORAGE_KEY, JSON.stringify(info));
  };

  const refreshPreview = () => setPreviewData({ ...getValues() });

  const pdfDocument = <InvoicePDFDocument data={previewData} />;
  const fileName = `Счёт_${previewData.invoiceNumber || "б_н"}_${previewData.invoiceDate?.replace(/\./g, "-") || ""}.pdf`;

  // Текущие позиции для расчёта суммы
  const items = watch("items") || [];
  const vatRate = watch("vatRate") ?? 20;
  const currency = watch("currency") || "RUB";
  const subtotal = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0);
  const vatAmount = vatRate > 0 ? subtotal * vatRate / 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[96vw] h-[92vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-5 pt-4 pb-3 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Конструктор счёта — {invoice.number || `# ${invoice.id}`}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* ── LEFT: form ── */}
          <div className="w-[440px] shrink-0 border-r overflow-y-auto">
            <div className="p-4 space-y-3">
              {/* Реквизиты счёта */}
              <SectionHeading title="Реквизиты счёта" />
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1 col-span-1">
                  <FLabel>Номер</FLabel>
                  <Input {...register("invoiceNumber")} placeholder="001" />
                </div>
                <div className="space-y-1">
                  <FLabel>Дата</FLabel>
                  <Input {...register("invoiceDate")} placeholder="01.01.2024" />
                </div>
                <div className="space-y-1">
                  <FLabel>Срок оплаты</FLabel>
                  <Input {...register("dueDate")} placeholder="15.01.2024" />
                </div>
              </div>

              {/* Продавец */}
              <SectionHeading title="Продавец (ваша компания)" />
              <div className="space-y-1">
                <FLabel>Наименование</FLabel>
                <Input {...register("sellerName")} placeholder={`ООО "Название"`} />
              </div>
              <div className="space-y-1">
                <FLabel>Адрес</FLabel>
                <Input {...register("sellerAddress")} placeholder="123456, г. Москва, ул. Примерная, д. 1" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <FLabel>ИНН</FLabel>
                  <Input {...register("sellerINN")} placeholder="1234567890" />
                </div>
                <div className="space-y-1">
                  <FLabel>ОГРН</FLabel>
                  <Input {...register("sellerOGRN")} placeholder="1234567890123" />
                </div>
              </div>
              <div className="space-y-1">
                <FLabel>ФИО подписанта</FLabel>
                <Input {...register("sellerRepresentative")} placeholder="Иванов И.И." />
              </div>
              <div className="space-y-1">
                <FLabel>Банк</FLabel>
                <Input {...register("sellerBank")} placeholder="ПАО Сбербанк" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1 col-span-2">
                  <FLabel>Расчётный счёт</FLabel>
                  <Input {...register("sellerAccount")} placeholder="40702810XXXXXXXXXX" />
                </div>
                <div className="space-y-1">
                  <FLabel>БИК</FLabel>
                  <Input {...register("sellerBIK")} placeholder="044525225" />
                </div>
              </div>
              <div className="space-y-1">
                <FLabel>Корр. счёт</FLabel>
                <Input {...register("sellerCorrAccount")} placeholder="30101810400000000225" />
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-2 text-xs"
                onClick={saveSellerInfo}
              >
                <Save className="h-3 w-3" />
                Сохранить реквизиты компании
              </Button>

              {/* Покупатель */}
              <SectionHeading title="Покупатель" />
              <div className="space-y-1">
                <FLabel>Наименование</FLabel>
                <Input {...register("clientName")} placeholder="ООО «Заказчик»" />
              </div>
              <div className="space-y-1">
                <FLabel>Адрес</FLabel>
                <Input {...register("clientAddress")} placeholder="г. Москва, ул. Купеческая, д. 10" />
              </div>
              <div className="space-y-1">
                <FLabel>ИНН</FLabel>
                <Input {...register("clientINN")} placeholder="9876543210" />
              </div>

              {/* Позиции */}
              <SectionHeading title="Позиции" />
              <div className="space-y-2">
                {fields.map((field, idx) => (
                  <div key={field.id} className="border rounded-md p-3 space-y-2 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Позиция {idx + 1}</span>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-destructive"
                          onClick={() => remove(idx)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-1">
                      <FLabel>Наименование</FLabel>
                      <Input
                        {...register(`items.${idx}.description`)}
                        placeholder="Разработка веб-приложения"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="space-y-1 col-span-1">
                        <FLabel>Кол-во</FLabel>
                        <Input
                          {...register(`items.${idx}.qty`, { valueAsNumber: true })}
                          type="number"
                          min={1}
                          placeholder="1"
                        />
                      </div>
                      <div className="space-y-1 col-span-1">
                        <FLabel>Ед. изм.</FLabel>
                        <Input {...register(`items.${idx}.unit`)} placeholder="шт." />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <FLabel>Цена за ед.</FLabel>
                        <Input
                          {...register(`items.${idx}.unitPrice`, { valueAsNumber: true })}
                          type="number"
                          min={0}
                          placeholder="10000"
                        />
                      </div>
                    </div>
                    <div className="text-right text-xs font-medium text-muted-foreground">
                      = {((Number(watch(`items.${idx}.qty`)) || 0) * (Number(watch(`items.${idx}.unitPrice`)) || 0)).toLocaleString("ru-RU")} {currency}
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => append({ description: "", qty: 1, unit: "шт.", unitPrice: 0 })}
                >
                  <Plus className="h-3 w-3" />
                  Добавить позицию
                </Button>
              </div>

              {/* Итоговые настройки */}
              <SectionHeading title="НДС и валюта" />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <FLabel>Ставка НДС</FLabel>
                  <Select
                    value={String(watch("vatRate") ?? 20)}
                    onValueChange={(v) => setValue("vatRate", Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VAT_RATES.map((r) => (
                        <SelectItem key={r.value} value={String(r.value)}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <FLabel>Валюта</FLabel>
                  <Select
                    value={watch("currency") || "RUB"}
                    onValueChange={(v) => setValue("currency", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Итого (live calc) */}
              <div className="border rounded-md p-3 bg-muted/20 space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Итого без НДС:</span>
                  <span className="font-medium">{subtotal.toLocaleString("ru-RU")} {currency}</span>
                </div>
                {vatRate > 0 && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>НДС {vatRate}%:</span>
                    <span className="font-medium">{vatAmount.toLocaleString("ru-RU")} {currency}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-sm font-semibold">
                  <span>Итого к оплате:</span>
                  <span>{(subtotal + vatAmount).toLocaleString("ru-RU")} {currency}</span>
                </div>
              </div>

              {/* Примечание */}
              <SectionHeading title="Примечание" />
              <div className="space-y-1">
                <Textarea
                  {...register("notes")}
                  rows={2}
                  placeholder="Дополнительная информация..."
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT: PDF preview ── */}
          <div className="flex-1 flex flex-col overflow-hidden bg-muted/30">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-background flex-shrink-0">
              <span className="text-sm text-muted-foreground">Предпросмотр (обновляется автоматически)</span>
              <Button size="sm" variant="ghost" className="gap-1.5 h-7" onClick={refreshPreview}>
                <RefreshCw className="h-3 w-3" />
                Обновить
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <BlobProvider document={pdfDocument}>
                {({ url, loading, error }) => {
                  if (loading) {
                    return (
                      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                        Генерация PDF...
                      </div>
                    );
                  }
                  if (error) {
                    return (
                      <div className="flex h-full items-center justify-center text-destructive text-sm">
                        Ошибка генерации PDF
                      </div>
                    );
                  }
                  return (
                    <iframe
                      src={url!}
                      className="w-full h-full border-0"
                      title="Предпросмотр счёта"
                    />
                  );
                }}
              </BlobProvider>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t bg-background flex-shrink-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
          <PDFDownloadLink document={pdfDocument} fileName={fileName}>
            {({ loading }) => (
              <Button disabled={loading} className="gap-2">
                <Download className="h-4 w-4" />
                {loading ? "Генерация..." : "Скачать PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </DialogContent>
    </Dialog>
  );
};
