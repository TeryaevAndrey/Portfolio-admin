import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { contractApi, contractQueries, type Contract } from "@/entities/contract";
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
  title: z.string().min(1, "Введите название"),
  clientId: z.string().optional(),
  status: z.enum(["draft", "sent", "signed", "cancelled"]).optional(),
  signedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  amount: z.string().optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
  fileUrl: z.string().optional(),
});

type FormSchema = z.infer<typeof schema>;

interface Props {
  contract: Contract;
  trigger: React.ReactNode;
}

export const EditContractSheet = ({ contract, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: contract.title,
      clientId: contract.clientId ? String(contract.clientId) : undefined,
      status: contract.status,
      signedAt: contract.signedAt ?? "",
      expiresAt: contract.expiresAt ?? "",
      amount: contract.amount != null ? String(contract.amount) : "",
      currency: contract.currency ?? "RUB",
      description: contract.description ?? "",
      fileUrl: contract.fileUrl ?? "",
    },
  });

  const { data: clientsData } = useQuery({
    ...clientQueries.list({ limit: 100 }),
    enabled: open,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormSchema) =>
      contractApi.update(contract.id, {
        title: data.title,
        clientId: data.clientId ? Number(data.clientId) : undefined,
        status: data.status,
        signedAt: data.signedAt || undefined,
        expiresAt: data.expiresAt || undefined,
        amount: data.amount ? Number(data.amount) : undefined,
        currency: data.currency || "RUB",
        description: data.description || undefined,
        fileUrl: data.fileUrl || undefined,
      }),
    onSuccess: () => {
      toast.success("Договор обновлён!");
      queryClient.invalidateQueries({ queryKey: contractQueries.listKeys() });
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
          <SheetTitle>Редактирование договора</SheetTitle>
        </SheetHeader>
        <form
          onSubmit={form.handleSubmit((d) => mutate(d))}
          className="flex flex-col gap-4 mt-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label>Название *</Label>
            <Input {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
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
                <SelectItem value="signed">Подписан</SelectItem>
                <SelectItem value="cancelled">Отменён</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Дата подписания</Label>
              <Input type="date" {...form.register("signedAt")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Действует до</Label>
              <Input type="date" {...form.register("expiresAt")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Сумма</Label>
              <Input type="number" {...form.register("amount")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Валюта</Label>
              <Input {...form.register("currency")} />
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
