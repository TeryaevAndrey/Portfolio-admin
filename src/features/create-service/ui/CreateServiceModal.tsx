import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { serviceApi, serviceQueries } from "@/entities/service";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";

const schema = z.object({
  name: z.string().min(1, "Введите название услуги"),
  description: z.string().min(1, "Введите описание"),
  price: z.number().min(0, "Цена не может быть отрицательной"),
  duration: z.string().min(1, "Введите срок выполнения"),
  isPublished: z.boolean(),
});

type FormSchema = z.infer<typeof schema>;

export const CreateServiceModal = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: { price: 0, isPublished: true },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: serviceApi.create,
    onSuccess: () => {
      toast.success("Услуга создана!");
      queryClient.invalidateQueries({ queryKey: serviceQueries.listKeys() });
      setOpen(false);
      form.reset({ price: 0, isPublished: true });
    },
    onError: (error: AxiosError) => {
      const data = error.response?.data as { message?: string };
      toast.error(data?.message || "Ошибка при создании");
    },
  });

  const onSubmit = (data: FormSchema) => {
    mutate(data);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) form.reset({ price: 0, isPublished: true });
      }}
    >
      <DialogTrigger asChild>
        <Button variant="accent">Добавить услугу</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новая услуга</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label>Название *</Label>
            <Input {...form.register("name")} placeholder="Разработка лендинга" />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Описание *</Label>
            <Textarea
              {...form.register("description")}
              placeholder="Создание одностраничного сайта под ключ..."
              rows={4}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <Label>Цена (₽) *</Label>
              <Input
                type="number"
                min={0}
                step={100}
                {...form.register("price", { valueAsNumber: true })}
                placeholder="50000"
              />
              {form.formState.errors.price && (
                <p className="text-xs text-destructive">{form.formState.errors.price.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <Label>Срок выполнения *</Label>
              <Input
                {...form.register("duration")}
                placeholder="3–7 дней"
              />
              {form.formState.errors.duration && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.duration.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPublished" {...form.register("isPublished")} className="w-4 h-4" />
            <Label htmlFor="isPublished" className="cursor-pointer">Опубликовать</Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" variant="accent" disabled={isPending}>
              {isPending ? "Создаём..." : "Создать услугу"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
