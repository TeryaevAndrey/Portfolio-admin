import {
  useDashboardSummary,
  useEarningsByMonth,
  useAvailableYears,
  useCallbacksByDay,
  useLeadsFunnel,
  useLeadSources,
  useProjectsByStatus,
  useTopClientsByEarnings,
} from "@/entities/stats";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useState } from "react";
import {
  Briefcase,
  Users,
  Wallet,
  TrendingUp,
  Inbox,
  UserRoundSearch,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
  "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек",
];

const fmt = (n: number) =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(n);

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#94a3b8",
  IN_PROGRESS: "#3b82f6",
  PAUSED: "#f59e0b",
  COMPLETED: "#22c55e",
  CANCELLED: "#ef4444",
};

const LEAD_COLORS = ["#3b82f6", "#f59e0b", "#22c55e", "#ef4444"];

const SOURCE_COLORS = [
  "#6366f1", "#3b82f6", "#22c55e", "#f59e0b",
  "#ec4899", "#14b8a6", "#a855f7", "#94a3b8",
];

// ── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent?: "default" | "green" | "blue" | "amber" | "red";
  trend?: "up" | "down" | "neutral";
}

const ACCENT_STYLES = {
  default: "bg-card",
  green: "bg-green-50 dark:bg-green-950/30",
  blue: "bg-blue-50 dark:bg-blue-950/30",
  amber: "bg-amber-50 dark:bg-amber-950/30",
  red: "bg-red-50 dark:bg-red-950/30",
};

const ICON_STYLES = {
  default: "bg-secondary text-secondary-foreground",
  green: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

const KpiCard = ({
  title,
  value,
  sub,
  icon,
  accent = "default",
  trend,
}: KpiCardProps) => (
  <div className={cn("rounded-xl border p-4 flex flex-col gap-3", ACCENT_STYLES[accent])}>
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground font-medium">{title}</span>
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", ICON_STYLES[accent])}>
        {icon}
      </div>
    </div>
    <div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      {sub && (
        <div className={cn(
          "flex items-center gap-1 text-xs mt-0.5",
          trend === "up" ? "text-green-600 dark:text-green-400" :
          trend === "down" ? "text-red-500" :
          "text-muted-foreground"
        )}>
          {trend === "up" && <ArrowUpRight className="w-3 h-3" />}
          {trend === "down" && <ArrowDownRight className="w-3 h-3" />}
          {sub}
        </div>
      )}
    </div>
  </div>
);

// ── Section wrapper ───────────────────────────────────────────────────────────

const Section = ({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) => (
  <div className={cn("rounded-xl border bg-card p-5 flex flex-col gap-4", className)}>
    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    {children}
  </div>
);

// ── Custom tooltip ────────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" && p.value > 1000 ? fmt(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────

export const HomePage = () => {
  const [selectedYear, setSelectedYear] = useState<number | undefined>();

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: earnings } = useEarningsByMonth(selectedYear);
  const { data: years } = useAvailableYears();
  const { data: callbackDays } = useCallbacksByDay(30);
  const { data: leadsFunnel } = useLeadsFunnel();
  const { data: leadSources } = useLeadSources();
  const { data: projectsByStatus } = useProjectsByStatus();
  const { data: topClients } = useTopClientsByEarnings(5);

  const earningsChartData = (earnings ?? []).map((e) => ({
    name: `${MONTH_NAMES[e.month - 1]} ${e.year !== new Date().getFullYear() ? e.year : ""}`.trim(),
    "Стоимость": e.totalCost,
    "Оплачено": e.paidAmount,
    Проектов: e.projectCount,
  }));

  const callbacksChartData = (callbackDays ?? []).map((c) => ({
    name: format(new Date(c.date + "T00:00:00"), "d MMM", { locale: ru }),
    Заявки: c.count,
  }));

  const conversionRate = summary && summary.totalLeads > 0
    ? Math.round((summary.convertedLeads / summary.totalLeads) * 100)
    : 0;

  const pieData = (projectsByStatus ?? []).filter((p) => p.count > 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Дашборд</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {format(new Date(), "EEEE, d MMMM yyyy", { locale: ru })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard
          title="Заработано"
          value={summaryLoading ? "..." : fmt(summary?.totalEarned ?? 0)}
          sub={`Оплачено ${fmt(summary?.totalPaid ?? 0)}`}
          icon={<Wallet className="w-4 h-4" />}
          accent="green"
          trend="up"
        />
        <KpiCard
          title="Проекты"
          value={summary?.totalProjects ?? 0}
          sub={`${summary?.completedProjects ?? 0} завершено`}
          icon={<Briefcase className="w-4 h-4" />}
          accent="blue"
        />
        <KpiCard
          title="Клиенты"
          value={summary?.activeClients ?? 0}
          sub="уникальных"
          icon={<Users className="w-4 h-4" />}
        />
        <KpiCard
          title="Лиды"
          value={summary?.totalLeads ?? 0}
          sub={`${summary?.newLeads ?? 0} новых`}
          icon={<UserRoundSearch className="w-4 h-4" />}
          accent="amber"
        />
        <KpiCard
          title="Заявки"
          value={summary?.totalCallbacks ?? 0}
          sub={`${summary?.unreadCallbacks ?? 0} непрочитанных`}
          icon={<Inbox className="w-4 h-4" />}
          accent={summary?.unreadCallbacks ? "red" : "default"}
          trend={summary?.unreadCallbacks ? "down" : undefined}
        />
        <KpiCard
          title="Конверсия"
          value={`${conversionRate}%`}
          sub="лиды → проекты"
          icon={<TrendingUp className="w-4 h-4" />}
          accent={conversionRate >= 20 ? "green" : "default"}
          trend={conversionRate >= 20 ? "up" : "neutral"}
        />
      </div>

      {/* Charts row 1: Earnings + Callbacks trend */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Earnings bar chart */}
        <Section title="Доход по месяцам" className="xl:col-span-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedYear(undefined)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition-colors",
                !selectedYear ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-muted"
              )}
            >
              Все годы
            </button>
            {(years ?? []).map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full border transition-colors",
                  selectedYear === y ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-muted"
                )}
              >
                {y}
              </button>
            ))}
          </div>
          {earningsChartData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Нет данных</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={earningsChartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Стоимость" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Оплачено" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>

        {/* Callbacks trend */}
        <Section title="Заявки за 30 дней">
          {(callbacksChartData.length === 0 || callbacksChartData.every(d => d.Заявки === 0)) ? (
            <p className="text-sm text-muted-foreground text-center py-8">Заявок пока нет</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={callbacksChartData}>
                <defs>
                  <linearGradient id="callbackGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={6} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Заявки"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#callbackGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Section>
      </div>

      {/* Charts row 2: Leads funnel + Project statuses + Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Leads funnel */}
        <Section title="Воронка лидов">
          <div className="flex flex-col gap-3">
            {(leadsFunnel ?? []).map((item, i) => {
              const total = (leadsFunnel ?? []).reduce((s, l) => s + l.count, 0);
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div key={item.status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: LEAD_COLORS[i % LEAD_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {(leadsFunnel ?? []).every(l => l.count === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">Лидов пока нет</p>
            )}
          </div>
        </Section>

        {/* Projects by status pie */}
        <Section title="Проекты по статусам">
          {pieData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Нет данных</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} проектов`]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Section>

        {/* Lead sources */}
        <Section title="Источники лидов">
          {(leadSources ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Нет данных</p>
          ) : (
            <div className="flex flex-col gap-3">
              {(leadSources ?? []).map((item, i) => {
                const total = (leadSources ?? []).reduce((s, l) => s + l.count, 0);
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={item.source}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{item.source}</span>
                      <span className="font-semibold">{item.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: SOURCE_COLORS[i % SOURCE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </div>

      {/* Top clients */}
      {(topClients ?? []).length > 0 && (
        <Section title="Топ клиентов по доходу">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2 text-muted-foreground font-medium text-xs">Клиент</th>
                  <th className="text-right pb-2 text-muted-foreground font-medium text-xs">Проектов</th>
                  <th className="text-right pb-2 text-muted-foreground font-medium text-xs">Стоимость</th>
                  <th className="text-right pb-2 text-muted-foreground font-medium text-xs">Оплачено</th>
                </tr>
              </thead>
              <tbody>
                {(topClients ?? []).map((c, i) => (
                  <tr key={c.clientId} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="font-medium">{c.clientName}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right text-muted-foreground">{c.projectCount}</td>
                    <td className="py-2.5 text-right">{fmt(c.totalCost)}</td>
                    <td className="py-2.5 text-right text-green-600 dark:text-green-400">{fmt(c.totalPaid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </div>
  );
};