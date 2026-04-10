import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useEarningsByMonth,
  useAvailableYears,
  useTopClientsByEarnings,
  useTopClientsByExpensiveOrder,
} from "@/entities/stats";
import { projectQueries, ProjectStatus, PROJECT_STATUS_LABELS } from "@/entities/project";
import type { Project } from "@/entities/project";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Banknote,
  Percent,
  Receipt,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  UserX,
} from "lucide-react";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────

type EnrichedProject = Project & { debt: number; profit: number };

// ── Helpers ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
  "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек",
];

const fmt = (n: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);

const fmtShort = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ₽`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K ₽`;
  return `${n} ₽`;
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
  [ProjectStatus.DRAFT]: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  [ProjectStatus.IN_PROGRESS]: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  [ProjectStatus.PAUSED]: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  [ProjectStatus.COMPLETED]: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  [ProjectStatus.CANCELLED]: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

// ── KPI Card ───────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  variant?: "default" | "green" | "blue" | "amber" | "red" | "purple";
}

const CARD_STYLES = {
  default: { card: "", icon: "bg-secondary text-secondary-foreground" },
  green: { card: "bg-green-50 dark:bg-green-950/30", icon: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" },
  blue: { card: "bg-blue-50 dark:bg-blue-950/30", icon: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
  amber: { card: "bg-amber-50 dark:bg-amber-950/30", icon: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  red: { card: "bg-red-50 dark:bg-red-950/30", icon: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" },
  purple: { card: "bg-purple-50 dark:bg-purple-950/30", icon: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400" },
};

const KpiCard = ({ title, value, sub, icon, variant = "default" }: KpiCardProps) => {
  const styles = CARD_STYLES[variant];
  return (
    <div className={cn("rounded-xl border p-4 flex flex-col gap-3", styles.card)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">{title}</span>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", styles.icon)}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </div>
    </div>
  );
};

// ── Section ────────────────────────────────────────────────────────────────

const Section = ({
  title,
  children,
  className,
  action,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) => (
  <div className={cn("rounded-xl border bg-card p-5 flex flex-col gap-4", className)}>
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

// ── Tooltip ────────────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

// ── Sort helpers ───────────────────────────────────────────────────────────

type SortField = "totalCost" | "paidAmount" | "debt" | "expenses" | "profit";
type SortDir = "asc" | "desc";

const SortIcon = ({ field, sort }: { field: SortField; sort: { f: SortField; d: SortDir } }) => {
  if (sort.f !== field) return <ChevronsUpDown className="w-3 h-3 opacity-40" />;
  return sort.d === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
};

// ── FinancePage ────────────────────────────────────────────────────────────

export const FinancePage = () => {
  const [year, setYear] = useState<number | undefined>();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "ALL">("ALL");
  const [sort, setSort] = useState<{ f: SortField; d: SortDir }>({ f: "totalCost", d: "desc" });

  // Data
  const { data: allProjects } = useQuery(projectQueries.list({ limit: 1000 }));
  const { data: earnings } = useEarningsByMonth(year);
  const { data: years } = useAvailableYears();
  const { data: topClients } = useTopClientsByEarnings(8);
  const { data: topExpensive } = useTopClientsByExpensiveOrder(5);

  const projects = allProjects?.items ?? [];

  // KPI totals
  const totals = useMemo(() => {
    let totalCost = 0;
    let totalPaid = 0;
    let totalExpenses = 0;
    let debtCount = 0;
    for (const p of projects) {
      const cost = Number(p.totalCost) || 0;
      const paid = Number(p.paidAmount) || 0;
      const exp = Number(p.expenses) || 0;
      totalCost += cost;
      totalPaid += paid;
      totalExpenses += exp;
      if (paid < cost) debtCount++;
    }
    const debt = totalCost - totalPaid;
    const netProfit = totalPaid - totalExpenses;
    const margin = totalPaid > 0 ? Math.round((netProfit / totalPaid) * 100) : 0;
    return { totalCost, totalPaid, totalExpenses, debt, netProfit, margin, debtCount };
  }, [projects]);

  // Chart data
  const chartData = (earnings ?? []).map((e) => ({
    name: `${MONTH_NAMES[e.month - 1]}${year ? "" : ` '${String(e.year).slice(2)}`}`,
    "Стоимость": Number(e.totalCost) || 0,
    "Оплачено": Number(e.paidAmount) || 0,
  }));

  // Debtors: group projects with debt > 0 by client
  const debtors = useMemo(() => {
    const map = new Map<string, { clientName: string; totalDebt: number; totalCost: number; totalPaid: number; projectCount: number }>();
    for (const p of projects) {
      const cost = Number(p.totalCost) || 0;
      const paid = Number(p.paidAmount) || 0;
      const debt = cost - paid;
      if (debt <= 0) continue;
      const key = p.client?.fullName ?? p.title;
      const existing = map.get(key);
      if (existing) {
        existing.totalDebt += debt;
        existing.totalCost += cost;
        existing.totalPaid += paid;
        existing.projectCount += 1;
      } else {
        map.set(key, { clientName: key, totalDebt: debt, totalCost: cost, totalPaid: paid, projectCount: 1 });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.totalDebt - a.totalDebt);
  }, [projects]);

  // Filtered + sorted projects table
  const tableProjects = useMemo((): EnrichedProject[] => {
    const q = search.toLowerCase();
    return projects
      .filter((p: Project) => {
        const matchSearch =
          !q ||
          p.title.toLowerCase().includes(q) ||
          (p.client?.fullName ?? "").toLowerCase().includes(q);
        const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .map((p: Project): EnrichedProject => ({
        ...p,
        debt: (Number(p.totalCost) || 0) - (Number(p.paidAmount) || 0),
        profit: (Number(p.paidAmount) || 0) - (Number(p.expenses) || 0),
      }))
      .sort((a: EnrichedProject, b: EnrichedProject) => {
        const av = Number(a[sort.f]) || 0;
        const bv = Number(b[sort.f]) || 0;
        return sort.d === "asc" ? av - bv : bv - av;
      });
  }, [projects, search, statusFilter, sort]);

  const toggleSort = (f: SortField) => {
    setSort((prev) =>
      prev.f === f ? { f, d: prev.d === "desc" ? "asc" : "desc" } : { f, d: "desc" }
    );
  };

  const ThSort = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {label}
      <SortIcon field={field} sort={sort} />
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Финансы</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Финансовая сводка по всем проектам
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard
          title="Сумма контрактов"
          value={fmtShort(totals.totalCost)}
          sub={`${projects.length} проектов`}
          icon={<Wallet className="w-4 h-4" />}
          variant="blue"
        />
        <KpiCard
          title="Оплачено"
          value={fmtShort(totals.totalPaid)}
          sub={totals.totalCost > 0 ? `${Math.round((totals.totalPaid / totals.totalCost) * 100)}% от суммы` : undefined}
          icon={<Banknote className="w-4 h-4" />}
          variant="green"
        />
        <KpiCard
          title="Задолженность"
          value={fmtShort(totals.debt)}
          sub={`${totals.debtCount} проектов`}
          icon={<AlertTriangle className="w-4 h-4" />}
          variant={totals.debt > 0 ? "amber" : "default"}
        />
        <KpiCard
          title="Расходы"
          value={fmtShort(totals.totalExpenses)}
          sub={totals.totalPaid > 0 ? `${Math.round((totals.totalExpenses / totals.totalPaid) * 100)}% от оплат` : undefined}
          icon={<Receipt className="w-4 h-4" />}
          variant="red"
        />
        <KpiCard
          title="Чистая прибыль"
          value={fmtShort(totals.netProfit)}
          sub="оплачено − расходы"
          icon={totals.netProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          variant={totals.netProfit >= 0 ? "green" : "red"}
        />
        <KpiCard
          title="Маржа"
          value={`${totals.margin}%`}
          sub="прибыль / оплачено"
          icon={<Percent className="w-4 h-4" />}
          variant={totals.margin >= 40 ? "green" : totals.margin >= 20 ? "amber" : "red"}
        />
      </div>

      {/* Earnings chart */}
      <Section
        title="Динамика доходов"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setYear(undefined)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition-colors",
                !year
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "hover:bg-muted"
              )}
            >
              Все годы
            </button>
            {(years ?? []).map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full border transition-colors",
                  year === y
                    ? "bg-primary text-primary-foreground border-transparent"
                    : "hover:bg-muted"
                )}
              >
                {y}
              </button>
            ))}
          </div>
        }
      >
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">Нет данных</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => fmtShort(v).replace(" ₽", "").trim()}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Стоимость" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Оплачено" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* Top clients + Top expensive */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Top clients by earnings */}
        <Section title="Топ клиентов по доходу">
          {(topClients ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Нет данных</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2 text-muted-foreground font-medium text-xs">#</th>
                    <th className="text-left pb-2 text-muted-foreground font-medium text-xs">Клиент</th>
                    <th className="text-right pb-2 text-muted-foreground font-medium text-xs">Проектов</th>
                    <th className="text-right pb-2 text-muted-foreground font-medium text-xs">Стоимость</th>
                    <th className="text-right pb-2 text-muted-foreground font-medium text-xs">Оплачено</th>
                  </tr>
                </thead>
                <tbody>
                  {(topClients ?? []).map((c, i) => (
                    <tr key={c.clientId} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="py-2.5 pr-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 font-medium">{c.clientName}</td>
                      <td className="py-2.5 text-right text-muted-foreground">{c.projectCount}</td>
                      <td className="py-2.5 text-right">{fmt(Number(c.totalCost))}</td>
                      <td className="py-2.5 text-right text-green-600 dark:text-green-400 font-medium">{fmt(Number(c.totalPaid))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* Top by expensive order */}
        <Section title="Самые дорогие проекты">
          {(topExpensive ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Нет данных</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2 text-muted-foreground font-medium text-xs">#</th>
                    <th className="text-left pb-2 text-muted-foreground font-medium text-xs">Проект</th>
                    <th className="text-left pb-2 text-muted-foreground font-medium text-xs">Клиент</th>
                    <th className="text-right pb-2 text-muted-foreground font-medium text-xs">Стоимость</th>
                  </tr>
                </thead>
                <tbody>
                  {(topExpensive ?? []).map((e, i) => (
                    <tr key={e.clientId + e.projectTitle} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="py-2.5 pr-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-2.5 pr-2 font-medium max-w-35 truncate">{e.projectTitle}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground text-xs">{e.clientName}</td>
                      <td className="py-2.5 text-right font-medium">{fmt(Number(e.maxCost))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>

      {/* Debtors */}
      {debtors.length > 0 && (
        <Section
          title={`Кто не доплатил (${debtors.length})`}
          action={
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <UserX className="w-3.5 h-3.5" />
              <span>Итого: {fmt(debtors.reduce((s, d) => s + d.totalDebt, 0))}</span>
            </div>
          }
        >
          <div className="flex flex-col gap-3">
            {debtors.map((d) => {
              const pct = d.totalCost > 0 ? Math.round((d.totalPaid / d.totalCost) * 100) : 0;
              return (
                <div key={d.clientName}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{d.clientName}</span>
                      {d.projectCount > 1 && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {d.projectCount} проекта
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground">оплачено {fmt(d.totalPaid)}</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        долг {fmt(d.totalDebt)}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                    <div
                      className="absolute inset-y-0 bg-amber-400/60"
                      style={{ left: `${pct}%`, right: 0 }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                    <span>{pct}% оплачено</span>
                    <span>из {fmt(d.totalCost)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Projects financial table */}
      <Section title="Финансы по проектам">
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-50">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию или клиенту..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ProjectStatus | "ALL")}>
            <SelectTrigger className="w-45 h-9 text-sm">
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Все статусы</SelectItem>
              {Object.values(ProjectStatus).map((s) => (
                <SelectItem key={s} value={s}>
                  {PROJECT_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground ml-auto">
            {tableProjects.length} проектов
          </span>
        </div>

        {tableProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Ничего не найдено</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2 text-muted-foreground font-medium text-xs">Проект</th>
                  <th className="text-left pb-2 text-muted-foreground font-medium text-xs">Клиент</th>
                  <th className="text-left pb-2 text-muted-foreground font-medium text-xs">Статус</th>
                  <th className="text-right pb-2 text-muted-foreground font-medium text-xs cursor-pointer">
                    <ThSort field="totalCost" label="Стоимость" />
                  </th>
                  <th className="text-right pb-2 text-muted-foreground font-medium text-xs cursor-pointer">
                    <ThSort field="paidAmount" label="Оплачено" />
                  </th>
                  <th className="text-right pb-2 text-muted-foreground font-medium text-xs cursor-pointer">
                    <ThSort field="debt" label="Долг" />
                  </th>
                  <th className="text-right pb-2 text-muted-foreground font-medium text-xs cursor-pointer">
                    <ThSort field="expenses" label="Расходы" />
                  </th>
                  <th className="text-right pb-2 text-muted-foreground font-medium text-xs cursor-pointer">
                    <ThSort field="profit" label="Прибыль" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableProjects.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 pr-3 font-medium max-w-45 truncate">{p.title}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground text-xs max-w-30 truncate">
                      {p.client?.fullName ?? "—"}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", STATUS_COLORS[p.status as ProjectStatus])}>
                        {PROJECT_STATUS_LABELS[p.status as ProjectStatus]}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">{p.totalCost != null ? fmt(Number(p.totalCost)) : "—"}</td>
                    <td className="py-2.5 text-right text-green-600 dark:text-green-400">
                      {p.paidAmount != null ? fmt(Number(p.paidAmount)) : "—"}
                    </td>
                    <td className={cn("py-2.5 text-right", p.debt > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")}>
                      {p.debt > 0 ? fmt(p.debt) : "—"}
                    </td>
                    <td className="py-2.5 text-right text-red-500">
                      {p.expenses != null && Number(p.expenses) > 0 ? fmt(Number(p.expenses)) : "—"}
                    </td>
                    <td className={cn("py-2.5 text-right font-medium", p.profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500")}>
                      {p.totalCost != null ? fmt(p.profit) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Footer totals */}
              <tfoot>
                <tr className="border-t-2 bg-muted/30">
                  <td className="pt-2.5 pb-2 font-semibold text-xs" colSpan={3}>Итого</td>
                  <td className="pt-2.5 pb-2 text-right font-semibold text-xs">
                    {fmt(tableProjects.reduce((s: number, p: EnrichedProject) => s + (Number(p.totalCost) || 0), 0))}
                  </td>
                  <td className="pt-2.5 pb-2 text-right font-semibold text-xs text-green-600 dark:text-green-400">
                    {fmt(tableProjects.reduce((s: number, p: EnrichedProject) => s + (Number(p.paidAmount) || 0), 0))}
                  </td>
                  <td className="pt-2.5 pb-2 text-right font-semibold text-xs text-amber-600 dark:text-amber-400">
                    {fmt(tableProjects.reduce((s: number, p: EnrichedProject) => s + p.debt, 0))}
                  </td>
                  <td className="pt-2.5 pb-2 text-right font-semibold text-xs text-red-500">
                    {fmt(tableProjects.reduce((s: number, p: EnrichedProject) => s + (Number(p.expenses) || 0), 0))}
                  </td>
                  <td className="pt-2.5 pb-2 text-right font-semibold text-xs text-green-600 dark:text-green-400">
                    {fmt(tableProjects.reduce((s: number, p: EnrichedProject) => s + p.profit, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
};
