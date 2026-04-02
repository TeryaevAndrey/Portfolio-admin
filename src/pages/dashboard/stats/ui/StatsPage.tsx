import { useState } from "react";
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
  Legend,
} from "recharts";
import {
  useSummary,
  useEarningsByMonth,
  useAvailableYears,
  useTopClientsByEarnings,
  useTopClientsByExpensiveOrder,
} from "@/entities/stats";
import { PageBreadCrumbs } from "@/shared/ui/page-breadcrumbs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  TrendingUp,
  Wallet,
  FolderKanban,
  CircleCheckBig,
  Users,
} from "lucide-react";

const MONTHS_RU = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
];

const fmt = (n: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);

// ─── Summary Card ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
}

const SummaryCard = ({ title, value, icon, sub }: SummaryCardProps) => (
  <Card className="py-4">
    <CardHeader className="pb-0">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </div>
    </CardHeader>
    <CardContent className="pt-1">
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </CardContent>
  </Card>
);

// ─── Tooltips ─────────────────────────────────────────────────────────────────

const MoneyTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const StatsPage = () => {
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    undefined
  );

  const { data: summary } = useSummary();
  const { data: years = [] } = useAvailableYears();
  const { data: earnings = [] } = useEarningsByMonth(selectedYear);
  const { data: topEarnings = [] } = useTopClientsByEarnings(10);
  const { data: topExpensive = [] } = useTopClientsByExpensiveOrder(10);

  // Нормализуем данные по месяцам для графика
  const earningsChartData = (() => {
    if (selectedYear) {
      // Показать все 12 месяцев выбранного года
      return Array.from({ length: 12 }, (_, i) => {
        const found = earnings.find((e) => e.month === i + 1);
        return {
          name: MONTHS_RU[i],
          Сумма: found?.totalCost ?? 0,
          Оплачено: found?.paidAmount ?? 0,
        };
      });
    }
    // Без фильтра — группируем по "год Мес"
    return earnings.map((e) => ({
      name: `${MONTHS_RU[e.month - 1]} ${e.year}`,
      Сумма: e.totalCost,
      Оплачено: e.paidAmount,
    }));
  })();

  const topEarningsData = topEarnings.map((c) => ({
    name:
      c.clientName.length > 16
        ? c.clientName.slice(0, 14) + "…"
        : c.clientName,
    fullName: c.clientName,
    Оплачено: c.totalPaid,
    "Стоимость заказов": c.totalCost,
    projectCount: c.projectCount,
  }));

  const topExpensiveData = topExpensive.map((c) => ({
    name:
      c.clientName.length > 16
        ? c.clientName.slice(0, 14) + "…"
        : c.clientName,
    fullName: c.clientName,
    "Макс. стоимость": c.maxCost,
    projectTitle: c.projectTitle,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <PageBreadCrumbs
          items={[
            { label: "Admin Panel" },
            { label: "Статистика", href: "/dashboard/stats" },
          ]}
        />
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <SummaryCard
          title="Всего заработано"
          value={summary ? fmt(summary.totalEarned) : "—"}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <SummaryCard
          title="Получено оплат"
          value={summary ? fmt(summary.totalPaid) : "—"}
          icon={<Wallet className="w-4 h-4" />}
          sub={
            summary
              ? `${Math.round((summary.totalPaid / (summary.totalEarned || 1)) * 100)}% от суммы`
              : undefined
          }
        />
        <SummaryCard
          title="Проектов"
          value={summary?.totalProjects ?? "—"}
          icon={<FolderKanban className="w-4 h-4" />}
        />
        <SummaryCard
          title="Завершено"
          value={summary?.completedProjects ?? "—"}
          icon={<CircleCheckBig className="w-4 h-4" />}
          sub={
            summary
              ? `${Math.round((summary.completedProjects / (summary.totalProjects || 1)) * 100)}% от всех`
              : undefined
          }
        />
        <SummaryCard
          title="Активных клиентов"
          value={summary?.activeClients ?? "—"}
          icon={<Users className="w-4 h-4" />}
        />
      </div>

      {/* ── Earnings chart ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle>Заработок по месяцам</CardTitle>
            <Select
              value={selectedYear?.toString() ?? "all"}
              onValueChange={(v) =>
                setSelectedYear(v === "all" ? undefined : Number(v))
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Все годы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все годы</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={earningsChartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradPaid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
              />
              <YAxis
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}к` : v
                }
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
              />
              <Tooltip content={<MoneyTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="Сумма"
                stroke="#6366f1"
                fill="url(#gradTotal)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Оплачено"
                stroke="#22c55e"
                fill="url(#gradPaid)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Client charts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Top by earnings */}
        <Card>
          <CardHeader>
            <CardTitle>Клиенты по суммарному доходу</CardTitle>
          </CardHeader>
          <CardContent>
            {topEarningsData.length === 0 ? (
              <p className="text-muted-foreground text-sm py-10 text-center">
                Нет данных
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  layout="vertical"
                  data={topEarningsData}
                  margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    className="stroke-border"
                  />
                  <XAxis
                    type="number"
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(0)}к` : v
                    }
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
                          <p className="font-semibold mb-1">{d.fullName}</p>
                          <p className="text-muted-foreground">
                            Заказов: {d.projectCount}
                          </p>
                          <p style={{ color: "#6366f1" }}>
                            Стоимость: {fmt(d["Стоимость заказов"])}
                          </p>
                          <p style={{ color: "#22c55e" }}>
                            Оплачено: {fmt(d.Оплачено)}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="Стоимость заказов"
                    fill="#6366f1"
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar
                    dataKey="Оплачено"
                    fill="#22c55e"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top by expensive */}
        <Card>
          <CardHeader>
            <CardTitle>Самые дорогостоящие заказы по клиентам</CardTitle>
          </CardHeader>
          <CardContent>
            {topExpensiveData.length === 0 ? (
              <p className="text-muted-foreground text-sm py-10 text-center">
                Нет данных
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  layout="vertical"
                  data={topExpensiveData}
                  margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    className="stroke-border"
                  />
                  <XAxis
                    type="number"
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(0)}к` : v
                    }
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3 text-sm max-w-56">
                          <p className="font-semibold mb-1">{d.fullName}</p>
                          <p className="text-muted-foreground text-xs mb-1 truncate">
                            Проект: {d.projectTitle}
                          </p>
                          <p style={{ color: "#f59e0b" }}>
                            Макс. стоимость: {fmt(d["Макс. стоимость"])}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="Макс. стоимость"
                    fill="#f59e0b"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
