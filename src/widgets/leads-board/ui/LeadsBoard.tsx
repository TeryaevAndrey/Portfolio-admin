import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Copy, Check, Phone, Folder, Tag, Pen } from "lucide-react";
import { useState } from "react";
import {
  leadApi,
  leadQueries,
  LeadStatus,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
  type Lead,
  type GetLeadsParams,
} from "@/entities/lead";
import { EditLeadSheet } from "@/features/edit-lead";
import { RemoveLeadButton } from "@/features/remove-lead";
import { Button } from "@/shared/ui/button";
import { cn } from "@/lib/utils";

const COLUMN_ORDER: LeadStatus[] = [
  LeadStatus.NEW,
  LeadStatus.DISCUSSION,
  LeadStatus.NO_DEAL,
  LeadStatus.CONVERTED,
];

const COLUMN_COLORS: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: "border-t-blue-400",
  [LeadStatus.DISCUSSION]: "border-t-amber-400",
  [LeadStatus.NO_DEAL]: "border-t-red-400",
  [LeadStatus.CONVERTED]: "border-t-green-500",
};

interface LeadCardProps {
  lead: Lead;
}

const LeadCard = ({ lead }: LeadCardProps) => {
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: changeStatus } = useMutation({
    mutationFn: (status: LeadStatus) => leadApi.update(lead.id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: leadQueries.listKeys() }),
    onError: () => toast.error("Ошибка при смене статуса"),
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(lead.contact);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const currentIdx = COLUMN_ORDER.indexOf(lead.status);

  return (
    <div className="group bg-card border rounded-xl p-3.5 flex flex-col gap-2.5 shadow-sm hover:shadow-md transition-shadow">
      {/* Name */}
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-sm leading-tight">{lead.name}</p>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <EditLeadSheet
            lead={lead}
            trigger={
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <Pen className="w-3.5 h-3.5" />
              </Button>
            }
          />
          <RemoveLeadButton lead={lead} />
        </div>
      </div>

      {/* Contact */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Phone className="w-3 h-3 shrink-0" />
        <span className="truncate flex-1">{lead.contact}</span>
        <button
          onClick={handleCopy}
          className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
          title="Скопировать"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Source + Project */}
      <div className="flex flex-wrap gap-1.5">
        {lead.source && (
          <span className="flex items-center gap-1 text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
            <Tag className="w-2.5 h-2.5" />
            {lead.source}
          </span>
        )}
        {lead.project && (
          <span className="flex items-center gap-1 text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
            <Folder className="w-2.5 h-2.5" />
            {lead.project}
          </span>
        )}
      </div>

      {/* Note */}
      {lead.note && (
        <p className="text-xs text-muted-foreground line-clamp-2 border-t pt-2">{lead.note}</p>
      )}

      {/* Move buttons + date */}
      <div className="flex items-center justify-between mt-auto pt-1 border-t">
        <span className="text-[10px] text-muted-foreground">
          {format(new Date(lead.createdAt), "d MMM yyyy", { locale: ru })}
        </span>
        <div className="flex gap-1">
          {currentIdx > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => changeStatus(COLUMN_ORDER[currentIdx - 1])}
              title="Назад"
            >
              ←
            </Button>
          )}
          {currentIdx < COLUMN_ORDER.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => changeStatus(COLUMN_ORDER[currentIdx + 1])}
              title="Вперёд"
            >
              →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

interface Props {
  params?: GetLeadsParams;
}

export const LeadsBoard = ({ params }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: leadQueries.listKeys({ ...params, limit: 200 }),
    queryFn: () => leadApi.getList({ ...params, limit: 200 }),
  });

  const leads = data?.items ?? [];

  const byStatus = (status: LeadStatus) => leads.filter((l) => l.status === status);

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground py-20 text-sm">Загрузка...</div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {COLUMN_ORDER.map((status) => {
        const items = byStatus(status);
        return (
          <div
            key={status}
            className={cn(
              "flex flex-col gap-3 bg-muted/40 rounded-xl border border-t-4 p-3",
              COLUMN_COLORS[status],
            )}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-0.5">
              <span className="text-sm font-semibold">{LEAD_STATUS_LABELS[status]}</span>
              <span className="text-xs bg-background border rounded-full px-2 py-0.5 font-mono">
                {items.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 min-h-[80px]">
              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Пусто</p>
              ) : (
                items.map((lead) => <LeadCard key={lead.id} lead={lead} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
