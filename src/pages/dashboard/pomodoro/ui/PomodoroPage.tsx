import { useCallback, useEffect, useRef, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/shared/ui/breadcrumb";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { cn } from "@/lib/utils";
import { Pause, Play, RotateCcw, Settings2, Volume2, VolumeX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";

// ── Типы ────────────────────────────────────────────────────────────────────

type Mode = "work" | "short" | "long";

interface Settings {
  work: number;
  short: number;
  long: number;
}

const DEFAULT_SETTINGS: Settings = { work: 25, short: 5, long: 15 };

const MODE_LABELS: Record<Mode, string> = {
  work: "Работа",
  short: "Короткий перерыв",
  long: "Длинный перерыв",
};

const MODE_COLORS: Record<Mode, { ring: string; bg: string; tab: string }> = {
  work: {
    ring: "#ef4444",
    bg: "from-red-500/10 to-transparent",
    tab: "bg-red-500 text-white",
  },
  short: {
    ring: "#22c55e",
    bg: "from-green-500/10 to-transparent",
    tab: "bg-green-500 text-white",
  },
  long: {
    ring: "#3b82f6",
    bg: "from-blue-500/10 to-transparent",
    tab: "bg-blue-500 text-white",
  },
};

// ── Звуковой сигнал через Web Audio API ─────────────────────────────────────

function playDing() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch {}
}

// ── Круговой прогресс ────────────────────────────────────────────────────────

const CircularProgress = ({
  progress,
  color,
  size = 260,
}: {
  progress: number;
  color: string;
  size?: number;
}) => {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} className="-rotate-90">
      {/* Фон */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-muted/30"
      />
      {/* Прогресс */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  );
};

// ── Настройки ────────────────────────────────────────────────────────────────

const SettingsDialog = ({
  settings,
  onChange,
}: {
  settings: Settings;
  onChange: (s: Settings) => void;
}) => {
  const [local, setLocal] = useState(settings);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Настройки таймера">
          <Settings2 className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Настройки таймера</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-2">
          {(["work", "short", "long"] as Mode[]).map((mode) => (
            <div key={mode} className="flex items-center justify-between gap-4">
              <Label className="shrink-0">{MODE_LABELS[mode]} (мин)</Label>
              <Input
                type="number"
                min={1}
                max={120}
                className="w-24 text-center"
                value={local[mode]}
                onChange={(e) =>
                  setLocal((prev) => ({
                    ...prev,
                    [mode]: Math.max(1, Math.min(120, Number(e.target.value))),
                  }))
                }
              />
            </div>
          ))}
          <Button
            className="w-full"
            onClick={() => onChange(local)}
          >
            Применить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Основной компонент ────────────────────────────────────────────────────────

export const PomodoroPage = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<Mode>("work");
  const [secondsLeft, setSecondsLeft] = useState(settings.work * 60);
  const [running, setRunning] = useState(false);
  const [muted, setMuted] = useState(false);
  const [completed, setCompleted] = useState(0); // завершённых помодоро

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSeconds = settings[mode] * 60;

  // При смене режима — сбросить таймер
  const switchMode = useCallback(
    (m: Mode) => {
      setRunning(false);
      setMode(m);
      setSecondsLeft(settings[m] * 60);
    },
    [settings]
  );

  // При изменении настроек — сбросить текущий таймер
  const applySettings = useCallback((s: Settings) => {
    setSettings(s);
    setRunning(false);
    setSecondsLeft(s[mode] * 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (!muted) playDing();
            if (mode === "work") setCompleted((c) => c + 1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, muted, mode]);

  const reset = () => {
    setRunning(false);
    setSecondsLeft(settings[mode] * 60);
  };

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 1;
  const colors = MODE_COLORS[mode];

  // Пересчёт завершённых циклов для отображения кружочков (4 помодоро = 1 цикл)
  const dotsTotal = 4;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Помодоро</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold">Помодоро таймер</h1>
          <p className="text-sm text-muted-foreground">
            25 мин работы → 5 мин перерыв → каждые 4 цикла длинный перерыв
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            title={muted ? "Включить звук" : "Выключить звук"}
            onClick={() => setMuted((v) => !v)}
          >
            {muted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
          <SettingsDialog settings={settings} onChange={applySettings} />
        </div>
      </div>

      <Card className="py-0 overflow-hidden">
        {/* Табы режимов */}
        <div className="flex border-b">
          {(["work", "short", "long"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors",
                mode === m
                  ? colors.tab
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>

        <CardContent className="flex flex-col items-center gap-8 py-10">
          {/* Круговой таймер */}
          <div
            className={cn(
              "relative flex items-center justify-center rounded-full bg-gradient-radial",
              colors.bg
            )}
          >
            <CircularProgress
              progress={progress}
              color={colors.ring}
              size={260}
            />
            <div className="absolute flex flex-col items-center select-none">
              <span className="text-6xl font-mono font-bold tabular-nums tracking-tight">
                {mins}:{secs}
              </span>
              <span className="text-sm text-muted-foreground mt-1">
                {MODE_LABELS[mode]}
              </span>
            </div>
          </div>

          {/* Управление */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11"
              title="Сбросить"
              onClick={reset}
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button
              className="h-14 w-36 text-base gap-2"
              style={{ backgroundColor: colors.ring }}
              onClick={() => setRunning((v) => !v)}
            >
              {running ? (
                <>
                  <Pause className="w-5 h-5" />
                  Пауза
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  {secondsLeft === totalSeconds ? "Старт" : "Продолжить"}
                </>
              )}
            </Button>
          </div>

          {/* Счётчик сессий */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Завершено помодоро сегодня: {completed}
            </p>
            <div className="flex gap-2">
              {Array.from({ length: dotsTotal }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-3 h-3 rounded-full border-2 transition-colors",
                    i < completed % dotsTotal || (completed > 0 && completed % dotsTotal === 0)
                      ? "bg-red-500 border-red-500"
                      : "border-muted-foreground/40"
                  )}
                />
              ))}
            </div>
            {completed > 0 && completed % dotsTotal === 0 && (
              <p className="text-xs text-blue-500 font-medium animate-pulse">
                🎉 Время для длинного перерыва!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Подсказка */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {(["work", "short", "long"] as Mode[]).map((m) => (
          <Card key={m} className="py-3">
            <p className="text-xs text-muted-foreground">{MODE_LABELS[m]}</p>
            <p className="text-2xl font-bold">{settings[m]}</p>
            <p className="text-xs text-muted-foreground">мин</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
