import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { BlobProvider, PDFDownloadLink } from "@react-pdf/renderer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";
import { Save, Download, FileText, RefreshCw } from "lucide-react";
import { ContractPDFDocument, type ContractPDFData } from "../lib/ContractPDFDocument";
import type { Contract } from "@/entities/contract";

const SELLER_STORAGE_KEY = "pdf_company_info";
const CURRENCIES = ["RUB", "USD", "EUR", "CNY"];

const loadSellerFromStorage = (): Partial<ContractPDFData> => {
  try {
    const raw = localStorage.getItem(SELLER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const buildInitialData = (contract: Contract): ContractPDFData => {
  const saved = loadSellerFromStorage();
  return {
    contractNumber: contract.id?.toString() || "",
    contractDate: new Date().toLocaleDateString("ru-RU"),
    city: "г. Москва",
    // Исполнитель (из localStorage или пустые)
    sellerName: saved.sellerName ?? "",
    sellerAddress: saved.sellerAddress ?? "",
    sellerINN: saved.sellerINN ?? "",
    sellerOGRN: saved.sellerOGRN ?? "",
    sellerRepresentative: saved.sellerRepresentative ?? "",
    sellerPosition: saved.sellerPosition ?? "Генеральный директор",
    sellerBank: saved.sellerBank ?? "",
    sellerAccount: saved.sellerAccount ?? "",
    sellerBIK: saved.sellerBIK ?? "",
    sellerCorrAccount: saved.sellerCorrAccount ?? "",
    // Заказчик (из contract.client)
    clientName: contract.client?.fullName ?? "",
    clientAddress: "",
    clientINN: "",
    clientRepresentative: "",
    clientPosition: "Генеральный директор",
    // Условия
    subject: contract.description ?? "",
    amount: contract.amount?.toString() ?? "",
    currency: contract.currency ?? "RUB",
    paymentTerms: "",
    startDate: contract.signedAt
      ? new Date(contract.signedAt).toLocaleDateString("ru-RU")
      : new Date().toLocaleDateString("ru-RU"),
    endDate: contract.expiresAt
      ? new Date(contract.expiresAt).toLocaleDateString("ru-RU")
      : "",
    additionalTerms: "",
  };
};

// ---------------------------------------------------------------------------

interface Props {
  contract: Contract;
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

export const ContractPDFBuilderModal = ({ contract, open, onOpenChange }: Props) => {
  const initialData = buildInitialData(contract);
  const form = useForm<ContractPDFData>({ defaultValues: initialData });
  const { register, watch, setValue, getValues, reset } = form;

  // Переинициализируем форму при смене договора
  useEffect(() => {
    reset(buildInitialData(contract));
  }, [contract.id]);

  // Debounced preview
  const [previewData, setPreviewData] = useState<ContractPDFData>(initialData);
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
    const sellerInfo = {
      sellerName: v.sellerName,
      sellerAddress: v.sellerAddress,
      sellerINN: v.sellerINN,
      sellerOGRN: v.sellerOGRN,
      sellerRepresentative: v.sellerRepresentative,
      sellerPosition: v.sellerPosition,
      sellerBank: v.sellerBank,
      sellerAccount: v.sellerAccount,
      sellerBIK: v.sellerBIK,
      sellerCorrAccount: v.sellerCorrAccount,
    };
    localStorage.setItem(SELLER_STORAGE_KEY, JSON.stringify(sellerInfo));
  };

  const refreshPreview = () => setPreviewData({ ...getValues() });

  const pdfDocument = <ContractPDFDocument data={previewData} />;
  const fileName = `Договор_${previewData.contractNumber || "б_н"}_${previewData.contractDate?.replace(/\./g, "-") || ""}.pdf`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[96vw] h-[92vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-5 pt-4 pb-3 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Конструктор договора — {contract.title}
          </DialogTitle>
        </DialogHeader>

        {/* Body: form + preview */}
        <div className="flex flex-1 overflow-hidden">
          {/* ── LEFT: form ── */}
          <div className="w-[430px] shrink-0 border-r overflow-y-auto">
            <div className="p-4 space-y-3">
              {/* Реквизиты договора */}
              <SectionHeading title="Реквизиты договора" />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <FLabel>Номер договора</FLabel>
                  <Input {...register("contractNumber")} placeholder="№ 001/2024" />
                </div>
                <div className="space-y-1">
                  <FLabel>Дата</FLabel>
                  <Input {...register("contractDate")} placeholder="01.01.2024" />
                </div>
              </div>
              <div className="space-y-1">
                <FLabel>Город</FLabel>
                <Input {...register("city")} placeholder="г. Москва" />
              </div>

              {/* Исполнитель */}
              <SectionHeading title="Исполнитель (ваша компания)" />
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
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <FLabel>Должность подписанта</FLabel>
                  <Input {...register("sellerPosition")} placeholder="Генеральный директор" />
                </div>
                <div className="space-y-1">
                  <FLabel>ФИО подписанта</FLabel>
                  <Input {...register("sellerRepresentative")} placeholder="Иванов И.И." />
                </div>
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

              {/* Заказчик */}
              <SectionHeading title="Заказчик" />
              <div className="space-y-1">
                <FLabel>Наименование</FLabel>
                <Input {...register("clientName")} placeholder="ООО «Заказчик»" />
              </div>
              <div className="space-y-1">
                <FLabel>Адрес</FLabel>
                <Input {...register("clientAddress")} placeholder="г. Москва, ул. Клиентская, д. 5" />
              </div>
              <div className="space-y-1">
                <FLabel>ИНН</FLabel>
                <Input {...register("clientINN")} placeholder="9876543210" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <FLabel>Должность подписанта</FLabel>
                  <Input {...register("clientPosition")} placeholder="Генеральный директор" />
                </div>
                <div className="space-y-1">
                  <FLabel>ФИО подписанта</FLabel>
                  <Input {...register("clientRepresentative")} placeholder="Петров П.П." />
                </div>
              </div>

              {/* Условия */}
              <SectionHeading title="Условия договора" />
              <div className="space-y-1">
                <FLabel>Предмет договора</FLabel>
                <Textarea
                  {...register("subject")}
                  rows={3}
                  placeholder="Исполнитель обязуется оказать услуги по разработке..."
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1 col-span-2">
                  <FLabel>Сумма</FLabel>
                  <Input {...register("amount")} placeholder="150 000" type="text" />
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
              <div className="space-y-1">
                <FLabel>Порядок оплаты</FLabel>
                <Textarea
                  {...register("paymentTerms")}
                  rows={2}
                  placeholder="Оплата производится в течение 5 рабочих дней..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <FLabel>Дата начала</FLabel>
                  <Input {...register("startDate")} placeholder="01.01.2024" />
                </div>
                <div className="space-y-1">
                  <FLabel>Дата окончания</FLabel>
                  <Input {...register("endDate")} placeholder="31.12.2024" />
                </div>
              </div>
              <div className="space-y-1">
                <FLabel>Дополнительные условия</FLabel>
                <Textarea
                  {...register("additionalTerms")}
                  rows={3}
                  placeholder="Дополнительные соглашения, условия конфиденциальности и т.д."
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
                      title="Предпросмотр договора"
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
