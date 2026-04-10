import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { invoiceApi, invoiceQueries, type Invoice } from "@/entities/invoice";
import { clientQueries } from "@/entities/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

const schema = z.object({
  number: z.string().min(1, "Введите номер"),
  clientId: z.string().optional(),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
  amount: z.string().min(1, "Введите сумму"),
  currency: z.string().optional(),
  issuedAt: z.string().optional(),
  dueAt: z.string().optional(),
  paidAt: z.string().optional(),
  description: z.string().optional(),
  fileUrl: z.string().optional(),
});

type FormSchema = z.infer<typeof schema>;

interface Props {
  invoice: Invoice;
  trigger: React.ReactNode;
}

export const EditInvoiceSheet = ({ invoice, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      number: invoice.number,
      clientId: invoice.clientId ? String(invoice.clientId) : undefined,
      status: invoice.status,
      amount: String(invoice.amount),
      currency: invoice.currency ?? "RUB",
      issuedAt: invoice.issuedAt ?? "",
      dueAt: invoice.dueAt ?? "",
      paidAt: invoice.paidAt ?? "",
      description: invoice.description ?? "",
      fileUrl: invoice.fileUrl ?? "",
    },
  });

  const { data: clientsData } = useQuery({
    ...clientQueries.list({ limit: 100 }),
    enabled: open,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormSchema) =>
      invoiceApi.update(invoice.id, {
        number: data.number,
        clientId: data.clientId ? Number(data.clientId) : undefined,
        status: data.status,
        amount: Number(data.amount),
        currency: data.currency || "RUB",
        issuedAt: data.issuedAt || undefined,
        dueAt: data.dueAt || undefined,
        paidAt: data.paidAt || undefined,
        description: data.description || undefined,
        fileUrl: data.fileUrl || undefined,
      }),
    onSuccess: () => {
      toast.success("Инвойс обновлён!");
      queryClient.invalidateQueries({ queryKey: invoiceQueries.listKeys() });
      setOpen(false);
    },
    onError: (error: AxiosError) => {
      const d = error.response?.data as { message?: string };
      toast.error(d?.message || "Ошибка при обновлении");
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Редактирование инвойса</SheetTitle>
        </SheetHeader>
        <form
          onSubmit={form.handleSubmit((d) => mutate(d))}
          className="flex flex-col gap-4 mt-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label>Номер *</Label>
            <Input {...form.register("number")} />
            {form.formState.errors.number && (
              <p className="text-xs text-destructive">{form.formState.errors.number.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Клиент</Label>
            <Select
              value={form.watch("clientId") ?? ""}
              onValueChange={(v) => form.setValue("clientId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите клиента" />
              </SelectTrigger>
              <SelectContent>
                {clientsData?.items.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Статус</Label>
            <Select
              value={form.watch("status") ?? "draft"}
              onValueChange={(v) => form.setValue("status", v as FormSchema["status"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Черновик</SelectItem>
                <SelectItem value="sent">Отправлен</SelectItem>
                <SelectItem value="paid">Оплачен</SelectItem>
                <SelectItem value="overdue">Просрочен</SelectItem>
                <SelectItem value="cancelled">Отменён</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Сумма *</Label>
              <Input type="number" {...form.register("amount")} />
              {form.formState.errors.amount && (
                <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Валюта</Label>
              <Input {...form.register("currency")} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Дата выставления</Label>
              <Input type="date" {...form.register("issuedAt")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Срок оплаты</Label>
              <Input type="date" {...form.register("dueAt")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Дата оплаты</Label>
              <Input type="date" {...form.register("paidAt")} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Описание</Label>
            <Textarea {...form.register("description")} rows={3} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Ссылка на файл</Label>
            <Input {...form.register("fileUrl")} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" variant="accent" disabled={isPending}>
              {isPending ? "Сохраняем..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
