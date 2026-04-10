import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import {
  leadApi,
  leadQueries,
  LeadStatus,
  LEAD_STATUS_LABELS,
  type Lead,
} from "@/entities/lead";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

const schema = z.object({
  name: z.string().min(1, "Введите имя"),
  contact: z.string().min(1, "Введите контакт"),
  source: z.string().optional(),
  project: z.string().optional(),
  status: z.nativeEnum(LeadStatus),
  note: z.string().optional(),
});

type FormSchema = z.infer<typeof schema>;

interface Props {
  lead: Lead;
  trigger: React.ReactNode;
}

export const EditLeadSheet = ({ lead, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: lead.name,
      contact: lead.contact,
      source: lead.source ?? "",
      project: lead.project ?? "",
      status: lead.status,
      note: lead.note ?? "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormSchema) =>
      leadApi.update(lead.id, {
        name: data.name,
        contact: data.contact,
        source: data.source || null,
        project: data.project || null,
        status: data.status,
        note: data.note || null,
      }),
    onSuccess: () => {
      toast.success("Лид обновлён!");
      queryClient.invalidateQueries({ queryKey: leadQueries.listKeys() });
      setOpen(false);
    },
    onError: (error: AxiosError) => {
      const d = error.response?.data as { message?: string };
      toast.error(d?.message || "Ошибка при обновлении");
    },
  });

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) {
          form.reset({
            name: lead.name,
            contact: lead.contact,
            source: lead.source ?? "",
            project: lead.project ?? "",
            status: lead.status,
            note: lead.note ?? "",
          });
        }
      }}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Редактировать лид</SheetTitle>
        </SheetHeader>
        <form
          onSubmit={form.handleSubmit((d) => mutate(d))}
          className="flex flex-col gap-4 mt-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label>Имя *</Label>
            <Input {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Контакт *</Label>
            <Input {...form.register("contact")} />
            {form.formState.errors.contact && (
              <p className="text-xs text-red-500">{form.formState.errors.contact.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Источник</Label>
            <Input placeholder="Telegram, Upwork..." {...form.register("source")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Проект</Label>
            <Input placeholder="Лендинг, магазин..." {...form.register("project")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Статус</Label>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(LeadStatus).map((s) => (
                      <SelectItem key={s} value={s}>
                        {LEAD_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Заметка</Label>
            <Textarea
              placeholder="Дополнительная информация..."
              rows={3}
              {...form.register("note")}
            />
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Сохранение..." : "Сохранить"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};
