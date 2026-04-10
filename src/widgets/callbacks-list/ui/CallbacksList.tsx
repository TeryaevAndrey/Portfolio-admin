import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Mail, MailOpen, MessageSquare, Phone, Tag, Eye } from "lucide-react";
import {
  callbackApi,
  callbackQueries,
  type Callback,
  type GetCallbacksParams,
} from "@/entities/callback";
import { RemoveCallbackButton } from "@/features/remove-callback";
import { Button } from "@/shared/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { cn } from "@/lib/utils";

// ── Detail Sheet ─────────────────────────────────────────────────────────────

interface DetailSheetProps {
  callback: Callback | null;
  onClose: () => void;
}

const DetailSheet = ({ callback, onClose }: DetailSheetProps) => {
  if (!callback) return null;

  return (
    <Sheet open={!!callback} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MailOpen className="w-4 h-4 text-primary" />
            Заявка от {callback.name}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-5 flex flex-col gap-4">
          <InfoRow label="Имя" value={callback.name} />
          <InfoRow label="Email">
            <a
              href={`mailto:${callback.email}`}
              className="text-primary hover:underline"
            >
              {callback.email}
            </a>
          </InfoRow>
          {callback.telegram && (
            <InfoRow label="Telegram">
              <a
                href={
                  callback.telegram.startsWith("@")
                    ? `https://t.me/${callback.telegram.slice(1)}`
                    : `https://t.me/${callback.telegram}`
                }
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                {callback.telegram}
              </a>
            </InfoRow>
          )}
          {callback.service && (
            <InfoRow label="Услуга" value={callback.service} />
          )}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Описание
            </span>
            <p className="text-sm bg-muted/50 rounded-lg p-3 whitespace-pre-line leading-relaxed">
              {callback.description}
            </p>
          </div>
          <InfoRow
            label="Получена"
            value={format(new Date(callback.createdAt), "d MMMM yyyy, HH:mm", {
              locale: ru,
            })}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

const InfoRow = ({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
      {label}
    </span>
    {children ?? <span className="text-sm">{value}</span>}
  </div>
);

// ── Row ──────────────────────────────────────────────────────────────────────

interface RowProps {
  item: Callback;
  onOpen: (item: Callback) => void;
}

const CallbackRow = ({ item, onOpen }: RowProps) => {
  const queryClient = useQueryClient();

  const { mutate: markRead } = useMutation({
    mutationFn: () => callbackApi.markAsRead(item.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: callbackQueries.listKeys() });
      queryClient.invalidateQueries({
        queryKey: callbackQueries.unreadCountKeys(),
      });
    },
  });

  const handleOpen = () => {
    if (!item.isRead) markRead();
    onOpen(item);
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-3 px-4 py-3.5 border-b last:border-b-0 hover:bg-muted/40 transition-colors cursor-pointer",
        !item.isRead && "bg-blue-50/50 dark:bg-blue-950/20"
      )}
      onClick={handleOpen}
    >
      {/* Unread dot */}
      <div className="mt-1 shrink-0">
        {item.isRead ? (
          <MailOpen className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Mail className="w-4 h-4 text-blue-500" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-sm font-medium", !item.isRead && "font-semibold")}>
            {item.name}
          </span>
          {!item.isRead && (
            <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-medium">
              Новая
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="w-3 h-3" />
            {item.email}
          </span>
          {item.telegram && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="w-3 h-3" />
              {item.telegram}
            </span>
          )}
          {item.service && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Tag className="w-3 h-3" />
              {item.service}
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
          {item.description}
        </p>
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className="text-[11px] text-muted-foreground">
          {format(new Date(item.createdAt), "d MMM, HH:mm", { locale: ru })}
        </span>
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleOpen}
            title="Открыть"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <RemoveCallbackButton callback={item} />
        </div>
      </div>
    </div>
  );
};

// ── Main widget ──────────────────────────────────────────────────────────────

interface Props {
  params?: GetCallbacksParams;
}

export const CallbacksList = ({ params }: Props) => {
  const [selected, setSelected] = useState<Callback | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: callbackQueries.listKeys(params),
    queryFn: () => callbackApi.getList(params),
  });

  const items = data?.items ?? [];

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground py-20 text-sm">
        Загрузка...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-20 text-sm">
        Заявок нет
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border overflow-hidden">
        {items.map((item) => (
          <CallbackRow key={item.id} item={item} onOpen={setSelected} />
        ))}
      </div>

      <DetailSheet callback={selected} onClose={() => setSelected(null)} />
    </>
  );
};
