import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { leadApi, leadQueries, LeadStatus, LEAD_STATUS_LABELS } from "@/entities/lead";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Plus } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Введите имя"),
  contact: z.string().min(1, "Введите контакт"),
  source: z.string().optional(),
  project: z.string().optional(),
  status: z.nativeEnum(LeadStatus),
  note: z.string().optional(),
});

type FormSchema = z.infer<typeof schema>;

export const CreateLeadModal = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      contact: "",
      source: "",
      project: "",
      status: LeadStatus.NEW,
      note: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormSchema) =>
      leadApi.create({
        name: data.name,
        contact: data.contact,
        source: data.source || null,
        project: data.project || null,
        status: data.status,
        note: data.note || null,
      }),
    onSuccess: () => {
      toast.success("Лид добавлен!");
      queryClient.invalidateQueries({ queryKey: leadQueries.listKeys() });
      setOpen(false);
      form.reset();
    },
    onError: (error: AxiosError) => {
      const d = error.response?.data as { message?: string };
      toast.error(d?.message || "Ошибка при создании");
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-1" />
          Добавить лид
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Новый лид</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((d) => mutate(d))}
          className="flex flex-col gap-4 mt-2"
        >
          <div className="flex flex-col gap-1.5">
            <Label>Имя *</Label>
            <Input placeholder="Иван Петров" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Контакт *</Label>
            <Input placeholder="+7 900 123 45 67 или @username" {...form.register("contact")} />
            {form.formState.errors.contact && (
              <p className="text-xs text-red-500">{form.formState.errors.contact.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Источник</Label>
            <Input placeholder="Telegram, Upwork, Сайт..." {...form.register("source")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Проект</Label>
            <Input placeholder="Лендинг, интернет-магазин..." {...form.register("project")} />
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
            {isPending ? "Сохранение..." : "Создать"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
