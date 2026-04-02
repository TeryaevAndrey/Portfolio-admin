import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { serviceApi, serviceQueries, type Service } from "@/entities/service";
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

const schema = z.object({
  name: z.string().min(1, "Введите название услуги"),
  description: z.string().min(1, "Введите описание"),
  price: z.number().min(0),
  duration: z.string().min(1, "Введите срок"),
  isPublished: z.boolean(),
});

type FormSchema = z.infer<typeof schema>;

interface Props {
  service: Service;
  trigger: React.ReactNode;
}

export const EditServiceSheet = ({ service, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: service.name,
      description: service.description,
      price: Number(service.price),
      duration: service.duration,
      isPublished: service.isPublished,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormSchema) => serviceApi.update(service.id, data),
    onSuccess: () => {
      toast.success("Услуга обновлена!");
      queryClient.invalidateQueries({ queryKey: serviceQueries.listKeys() });
      setOpen(false);
    },
    onError: (error: AxiosError) => {
      const data = error.response?.data as { message?: string };
      toast.error(data?.message || "Ошибка при обновлении");
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Редактирование услуги</SheetTitle>
        </SheetHeader>
        <form
          onSubmit={form.handleSubmit((d) => mutate(d))}
          className="flex flex-col gap-4 mt-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label>Название *</Label>
            <Input {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Описание *</Label>
            <Textarea {...form.register("description")} rows={5} />
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
              />
              {form.formState.errors.price && (
                <p className="text-xs text-destructive">{form.formState.errors.price.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <Label>Срок выполнения *</Label>
              <Input {...form.register("duration")} />
              {form.formState.errors.duration && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.duration.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="editIsPublished"
              {...form.register("isPublished")}
              className="w-4 h-4"
            />
            <Label htmlFor="editIsPublished" className="cursor-pointer">
              Опубликовано
            </Label>
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
