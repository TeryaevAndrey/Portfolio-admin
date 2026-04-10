// ── Типы данных ─────────────────────────────────────────────────────────────

export interface RateSettings {
  hourlyRate: number; // ₽/ч
  taxPercent: number; // % (например, 6 для самозанятого)
}

export interface ProjectTypeNorm {
  id: string;
  label: string;
  baseHours: number; // базовые часы на разработку
}

export interface ExtraServiceDef {
  id: string;
  label: string;
  hours: number; // базовые часы на услугу
}

export interface CalculatorForm {
  projectTypeId: string;
  pages: number;
  complexity: number; // множитель: 1.0 | 1.4 | 2.0
  urgency: number; // множитель: 1.0 | 1.3 | 1.6
  selectedServices: string[];
  clientNote: string; // заметка / имя клиента (для черновика)
}

export interface Draft {
  id: string;
  name: string;
  savedAt: string;
  form: CalculatorForm;
  rateSettings: RateSettings;
}

export interface LineItem {
  label: string;
  hours: number;
  amount: number;
}

export interface CalcResult {
  lines: LineItem[];
  subtotal: number;
  afterUrgency: number;
  tax: number;
  total: number;
  totalMin: number; // −10%
  totalMax: number; // +10%
  urgencyMultiplier: number;
}

// ── Константы ────────────────────────────────────────────────────────────────

export const DEFAULT_RATE: RateSettings = {
  hourlyRate: 2000,
  taxPercent: 6,
};

export const DEFAULT_PROJECT_TYPE_NORMS: ProjectTypeNorm[] = [
  { id: "landing", label: "Лендинг", baseHours: 20 },
  { id: "corporate", label: "Корпоративный сайт", baseHours: 60 },
  { id: "ecommerce", label: "Интернет-магазин", baseHours: 120 },
  { id: "mobile", label: "Мобильное приложение", baseHours: 200 },
  { id: "tgbot", label: "Telegram-бот", baseHours: 40 },
  { id: "backend", label: "API / Бэкенд", baseHours: 80 },
  { id: "other", label: "Прочее", baseHours: 30 },
];

export const DEFAULT_EXTRA_SERVICES: ExtraServiceDef[] = [
  { id: "design", label: "Дизайн (UI/UX)", hours: 16 },
  { id: "adaptive", label: "Адаптивность", hours: 8 },
  { id: "seo", label: "SEO-оптимизация", hours: 6 },
  { id: "integrations", label: "Интеграции с API", hours: 12 },
  { id: "tests", label: "Тестирование", hours: 10 },
  { id: "cms", label: "CMS / Панель управления", hours: 20 },
  { id: "deploy", label: "Деплой + DevOps", hours: 8 },
  { id: "support", label: "Поддержка (1 мес.)", hours: 16 },
];

export const COMPLEXITY_OPTIONS = [
  { label: "Простая", value: 1.0 },
  { label: "Средняя", value: 1.4 },
  { label: "Сложная", value: 2.0 },
];

export const URGENCY_OPTIONS = [
  { label: "Обычная", value: 1.0 },
  { label: "Срочная ×1.3", value: 1.3 },
  { label: "Очень срочная ×1.6", value: 1.6 },
];

export const DEFAULT_FORM: CalculatorForm = {
  projectTypeId: "landing",
  pages: 1,
  complexity: 1.0,
  urgency: 1.0,
  selectedServices: [],
  clientNote: "",
};

// ── Расчёт ───────────────────────────────────────────────────────────────────

export function pagesMultiplier(pages: number): number {
  if (pages <= 1) return 1;
  return 1 + (pages - 1) * 0.3;
}

export function calcResult(
  form: CalculatorForm,
  rate: RateSettings,
  norms: ProjectTypeNorm[],
  services: ExtraServiceDef[]
): CalcResult {
  const norm = norms.find((n) => n.id === form.projectTypeId);
  const baseDevHours = norm?.baseHours ?? 0;
  const pagesMult = pagesMultiplier(form.pages);
  const devHours = Math.round(baseDevHours * pagesMult * form.complexity);

  const lines: LineItem[] = [
    {
      label: norm?.label ?? "Разработка",
      hours: devHours,
      amount: devHours * rate.hourlyRate,
    },
  ];

  for (const svcId of form.selectedServices) {
    const svc = services.find((s) => s.id === svcId);
    if (!svc) continue;
    const h = Math.round(svc.hours * form.complexity);
    lines.push({
      label: svc.label,
      hours: h,
      amount: h * rate.hourlyRate,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);
  const afterUrgency = Math.round(subtotal * form.urgency);
  const tax = Math.round((afterUrgency * rate.taxPercent) / 100);
  const total = afterUrgency + tax;

  return {
    lines,
    subtotal,
    afterUrgency,
    tax,
    total,
    totalMin: Math.round(total * 0.9),
    totalMax: Math.round(total * 1.1),
    urgencyMultiplier: form.urgency,
  };
}
