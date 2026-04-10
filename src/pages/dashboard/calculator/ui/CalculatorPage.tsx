import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Check,
  ClipboardCopy,
  FolderOpen,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  calcResult,
  COMPLEXITY_OPTIONS,
  DEFAULT_EXTRA_SERVICES,
  DEFAULT_FORM,
  DEFAULT_PROJECT_TYPE_NORMS,
  DEFAULT_RATE,
  URGENCY_OPTIONS,
  type CalculatorForm,
  type Draft,
  type ExtraServiceDef,
  type ProjectTypeNorm,
  type RateSettings,
} from "../model/types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/shared/ui/breadcrumb";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { Separator } from "@/shared/ui/separator";
import { cn } from "@/lib/utils";

// ── Утилиты форматирования ───────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);

// ── Редактор норм часов ──────────────────────────────────────────────────────

const NormsEditor = ({
  norms,
  services,
  onNormsChange,
  onServicesChange,
}: {
  norms: ProjectTypeNorm[];
  services: ExtraServiceDef[];
  onNormsChange: (n: ProjectTypeNorm[]) => void;
  onServicesChange: (s: ExtraServiceDef[]) => void;
}) => {
  const [localNorms, setLocalNorms] = useState(norms);
  const [localServices, setLocalServices] = useState(services);

  const save = () => {
    onNormsChange(localNorms);
    onServicesChange(localServices);
    toast.success("Нормы сохранены");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Settings2 className="w-4 h-4" />
          Нормы часов
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Базовые нормы часов</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 mt-2">
          {/* Типы проектов */}
          <div>
            <p className="text-sm font-semibold mb-3">Типы проектов (часов на разработку)</p>
            <div className="flex flex-col gap-2">
              {localNorms.map((n, i) => (
                <div key={n.id} className="flex items-center gap-3">
                  <span className="text-sm flex-1 text-muted-foreground">{n.label}</span>
                  <Input
                    type="number"
                    min={1}
                    className="w-24 text-center"
                    value={n.baseHours}
                    onChange={(e) => {
                      const upd = [...localNorms];
                      upd[i] = { ...upd[i], baseHours: Math.max(1, Number(e.target.value)) };
                      setLocalNorms(upd);
                    }}
                  />
                  <span className="text-xs text-muted-foreground w-6">ч</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Доп. услуги */}
          <div>
            <p className="text-sm font-semibold mb-3">Дополнительные услуги (часов)</p>
            <div className="flex flex-col gap-2">
              {localServices.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-sm flex-1 text-muted-foreground">{s.label}</span>
                  <Input
                    type="number"
                    min={1}
                    className="w-24 text-center"
                    value={s.hours}
                    onChange={(e) => {
                      const upd = [...localServices];
                      upd[i] = { ...upd[i], hours: Math.max(1, Number(e.target.value)) };
                      setLocalServices(upd);
                    }}
                  />
                  <span className="text-xs text-muted-foreground w-6">ч</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={save} className="flex-1">
              Сохранить нормы
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setLocalNorms(DEFAULT_PROJECT_TYPE_NORMS);
                setLocalServices(DEFAULT_EXTRA_SERVICES);
              }}
            >
              Сброс
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Черновики ────────────────────────────────────────────────────────────────

const DraftsSheet = ({
  drafts,
  onLoad,
  onDelete,
}: {
  drafts: Draft[];
  onLoad: (d: Draft) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <FolderOpen className="w-4 h-4" />
          Черновики
          {drafts.length > 0 && (
            <span className="ml-0.5 text-xs bg-primary text-primary-foreground rounded-full px-1.5">
              {drafts.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Сохранённые черновики</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-3 mt-4">
          {drafts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Черновиков нет
            </p>
          )}
          {[...drafts].reverse().map((d) => (
            <Card key={d.id} className="py-0 gap-0">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(d.savedAt), "d MMM yyyy, HH:mm", { locale: ru })}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => onLoad(d)}
                  >
                    Загрузить
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(d.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ── Итог ────────────────────────────────────────────────────────────────────

const ResultPanel = ({
  form,
  rate,
  norms,
  services,
  onSaveDraft,
}: {
  form: CalculatorForm;
  rate: RateSettings;
  norms: ProjectTypeNorm[];
  services: ExtraServiceDef[];
  onSaveDraft: () => void;
}) => {
  const [copied, setCopied] = useState(false);
  const result = calcResult(form, rate, norms, services);

  const copyText = () => {
    const lines = [
      `Расчёт стоимости проекта`,
      form.clientNote ? `Клиент / заметка: ${form.clientNote}` : "",
      ``,
      ...result.lines.map(
        (l) => `${l.label}: ${l.hours} ч × ${fmt(rate.hourlyRate)} = ${fmt(l.amount)}`
      ),
      ``,
      `Итого до коэффициентов: ${fmt(result.subtotal)}`,
      result.urgencyMultiplier !== 1
        ? `Коэффициент срочности ×${result.urgencyMultiplier}: ${fmt(result.afterUrgency)}`
        : "",
      rate.taxPercent > 0 ? `Налог/комиссия (${rate.taxPercent}%): ${fmt(result.tax)}` : "",
      ``,
      `ИТОГО: ${fmt(result.total)}`,
      `Диапазон: ${fmt(result.totalMin)} — ${fmt(result.totalMax)}`,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      toast.success("Расчёт скопирован в буфер обмена");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="py-0 gap-0 overflow-hidden">
        {/* Шапка */}
        <div className="px-5 py-4 border-b bg-muted/40">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Детализация
          </p>
        </div>

        <CardContent className="p-0">
          {/* Строки */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-xs">
                <th className="text-left px-5 py-2.5 font-medium">Статья</th>
                <th className="text-right px-3 py-2.5 font-medium">Часы</th>
                <th className="text-right px-5 py-2.5 font-medium">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {result.lines.map((l, i) => (
                <tr
                  key={i}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-5 py-3 font-medium">{l.label}</td>
                  <td className="px-3 py-3 text-right text-muted-foreground tabular-nums">
                    {l.hours} ч
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{fmt(l.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>

        {/* Итоги */}
        <div className="border-t bg-muted/20 px-5 py-4 flex flex-col gap-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Итого (часы × ставка)</span>
            <span className="tabular-nums">{fmt(result.subtotal)}</span>
          </div>
          {result.urgencyMultiplier !== 1 && (
            <div className="flex justify-between text-sm text-amber-600 dark:text-amber-400">
              <span>Срочность ×{result.urgencyMultiplier}</span>
              <span className="tabular-nums">{fmt(result.afterUrgency)}</span>
            </div>
          )}
          {rate.taxPercent > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                Налог / комиссия ({rate.taxPercent}%)
              </span>
              <span className="tabular-nums">+{fmt(result.tax)}</span>
            </div>
          )}
          <Separator className="my-1" />
          <div className="flex justify-between text-base font-bold">
            <span>Итого</span>
            <span className="tabular-nums text-primary">{fmt(result.total)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Диапазон (±10%)</span>
            <span className="tabular-nums">
              {fmt(result.totalMin)} — {fmt(result.totalMax)}
            </span>
          </div>
        </div>
      </Card>

      {/* Итоговая карточка */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={copyText}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <ClipboardCopy className="w-4 h-4" />
          )}
          {copied ? "Скопировано!" : "Копировать"}
        </Button>
        <Button className="flex-1 gap-2" onClick={onSaveDraft}>
          <Save className="w-4 h-4" />
          Сохранить черновик
        </Button>
      </div>
    </div>
  );
};

// ── Главная страница ─────────────────────────────────────────────────────────

export const CalculatorPage = () => {
  const [rate, setRate] = useLocalStorage<RateSettings>(
    "calc:rate",
    DEFAULT_RATE
  );
  const [norms, setNorms] = useLocalStorage<ProjectTypeNorm[]>(
    "calc:norms",
    DEFAULT_PROJECT_TYPE_NORMS
  );
  const [services, setServices] = useLocalStorage<ExtraServiceDef[]>(
    "calc:services",
    DEFAULT_EXTRA_SERVICES
  );
  const [form, setForm] = useLocalStorage<CalculatorForm>(
    "calc:form",
    DEFAULT_FORM
  );
  const [drafts, setDrafts] = useLocalStorage<Draft[]>("calc:drafts", []);
  const [draftNameInput, setDraftNameInput] = useState("");
  const [savingDraft, setSavingDraft] = useState(false);

  const patchForm = (patch: Partial<CalculatorForm>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const resetForm = () => setForm(DEFAULT_FORM);

  const saveDraft = () => {
    const name =
      draftNameInput.trim() ||
      form.clientNote.trim() ||
      `Черновик от ${format(new Date(), "d MMM HH:mm", { locale: ru })}`;

    const draft: Draft = {
      id: crypto.randomUUID(),
      name,
      savedAt: new Date().toISOString(),
      form: { ...form },
      rateSettings: { ...rate },
    };
    setDrafts((prev) => [...prev, draft]);
    setDraftNameInput("");
    setSavingDraft(false);
    toast.success(`Черновик «${name}» сохранён`);
  };

  const loadDraft = (d: Draft) => {
    setForm(d.form);
    setRate(d.rateSettings);
    toast.success(`Черновик «${d.name}» загружен`);
  };

  const deleteDraft = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    toast.info("Черновик удалён");
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Шапка */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Калькулятор</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold">Калькулятор стоимости проекта</h1>
          <p className="text-sm text-muted-foreground">
            Автоматический расчёт с детализацией по статьям
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <NormsEditor
            norms={norms}
            services={services}
            onNormsChange={setNorms}
            onServicesChange={setServices}
          />
          <DraftsSheet
            drafts={drafts}
            onLoad={loadDraft}
            onDelete={deleteDraft}
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={resetForm}
          >
            <RotateCcw className="w-4 h-4" />
            Сбросить
          </Button>
        </div>
      </div>

      {/* Основной layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 items-start">
        {/* ── Левая панель: форма ────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Ставка */}
          <Card className="py-0 gap-0">
            <div className="px-5 py-3 border-b bg-muted/40">
              <p className="text-sm font-semibold">Параметры ставки</p>
            </div>
            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Часовая ставка (₽/ч)</Label>
                <Input
                  type="number"
                  min={100}
                  step={100}
                  value={rate.hourlyRate}
                  onChange={(e) =>
                    setRate((r) => ({
                      ...r,
                      hourlyRate: Math.max(100, Number(e.target.value)),
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Налог / комиссия (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={99}
                  step={0.5}
                  value={rate.taxPercent}
                  onChange={(e) =>
                    setRate((r) => ({
                      ...r,
                      taxPercent: Math.max(0, Math.min(99, Number(e.target.value))),
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Параметры проекта */}
          <Card className="py-0 gap-0">
            <div className="px-5 py-3 border-b bg-muted/40">
              <p className="text-sm font-semibold">Параметры проекта</p>
            </div>
            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Тип проекта */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>Тип проекта</Label>
                <Select
                  value={form.projectTypeId}
                  onValueChange={(v) => patchForm({ projectTypeId: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {norms.map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        {n.label}
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({n.baseHours} ч)
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Страниц */}
              <div className="flex flex-col gap-1.5">
                <Label>Количество страниц / экранов</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={form.pages}
                  onChange={(e) =>
                    patchForm({ pages: Math.max(1, Number(e.target.value)) })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Каждая стр. добавляет ×0.3 к базовым часам
                </p>
              </div>

              {/* Сложность */}
              <div className="flex flex-col gap-1.5">
                <Label>Сложность</Label>
                <Select
                  value={String(form.complexity)}
                  onValueChange={(v) => patchForm({ complexity: Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPLEXITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={String(o.value)}>
                        {o.label}{" "}
                        <span className="text-xs text-muted-foreground ml-1">
                          ×{o.value}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Срочность */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>Срочность</Label>
                <div className="flex flex-wrap gap-2">
                  {URGENCY_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => patchForm({ urgency: o.value })}
                      className={cn(
                        "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                        form.urgency === o.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:bg-muted border-border text-muted-foreground"
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Доп. услуги */}
          <Card className="py-0 gap-0">
            <div className="px-5 py-3 border-b bg-muted/40">
              <p className="text-sm font-semibold">Дополнительные услуги</p>
            </div>
            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((svc) => {
                const selected = form.selectedServices.includes(svc.id);
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => {
                      const next = selected
                        ? form.selectedServices.filter((id) => id !== svc.id)
                        : [...form.selectedServices, svc.id];
                      patchForm({ selectedServices: next });
                    }}
                    className={cn(
                      "flex items-center justify-between gap-2 px-4 py-3 rounded-lg border text-sm text-left transition-colors",
                      selected
                        ? "bg-primary/10 border-primary/50 text-foreground"
                        : "hover:bg-muted border-border text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0",
                          selected
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/40"
                        )}
                      >
                        {selected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                      </div>
                      <span className={cn(selected && "font-medium")}>{svc.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {svc.hours} ч
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Заметка */}
          <Card className="py-0 gap-0">
            <div className="px-5 py-3 border-b bg-muted/40">
              <p className="text-sm font-semibold">Заметка / Клиент</p>
            </div>
            <CardContent className="p-5">
              <Input
                placeholder="Например: Иван Петров, e-commerce для одежды"
                value={form.clientNote}
                onChange={(e) => patchForm({ clientNote: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Используется как название черновика при сохранении
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Правая панель: итог ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <ResultPanel
            form={form}
            rate={rate}
            norms={norms}
            services={services}
            onSaveDraft={() => setSavingDraft(true)}
          />

          {/* Диалог имени черновика */}
          {savingDraft && (
            <Card className="py-0 gap-0 border-primary/40">
              <CardContent className="p-4 flex flex-col gap-3">
                <p className="text-sm font-semibold">Название черновика</p>
                <Input
                  autoFocus
                  placeholder={
                    form.clientNote.trim() ||
                    `Черновик от ${format(new Date(), "d MMM HH:mm", { locale: ru })}`
                  }
                  value={draftNameInput}
                  onChange={(e) => setDraftNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveDraft();
                    if (e.key === "Escape") setSavingDraft(false);
                  }}
                />
                <div className="flex gap-2">
                  <Button className="flex-1 gap-1.5" onClick={saveDraft}>
                    <Save className="w-4 h-4" />
                    Сохранить
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSavingDraft(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Сводка по часам */}
          {(() => {
            const r = calcResult(form, rate, norms, services);
            const totalHours = r.lines.reduce((s, l) => s + l.hours, 0);
            const workDays = Math.ceil(totalHours / 8);
            return (
              <Card className="py-0 gap-0">
                <CardContent className="p-4 grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center py-2 border rounded-lg">
                    <span className="text-2xl font-bold tabular-nums">
                      {totalHours}
                    </span>
                    <span className="text-xs text-muted-foreground">часов</span>
                  </div>
                  <div className="flex flex-col items-center py-2 border rounded-lg">
                    <span className="text-2xl font-bold tabular-nums">
                      {workDays}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      рабочих дней
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
