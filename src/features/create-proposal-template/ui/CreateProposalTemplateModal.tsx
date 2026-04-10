import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { proposalTemplateApi, proposalTemplateQueries } from "@/entities/proposal-template";
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
  title: z.string().min(1, "Введите название шаблона"),
  content: z.string().min(1, "Введите текст шаблона"),
});

type FormSchema = z.infer<typeof schema>;

export const CreateProposalTemplateModal = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", content: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: proposalTemplateApi.create,
    onSuccess: () => {
      toast.success("Шаблон создан!");
      queryClient.invalidateQueries({
        queryKey: proposalTemplateQueries.listKeys(),
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: AxiosError) => {
      const data = error.response?.data as { message?: string };
      toast.error(data?.message || "Ошибка при создании");
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
        <Button variant="accent">Добавить шаблон</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новый шаблон отклика</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((d) => mutate(d))}
          className="flex flex-col gap-4 mt-2"
        >
          <div className="flex flex-col gap-1.5">
            <Label>Название *</Label>
            <Input
              {...form.register("title")}
              placeholder="Стандартный отклик на лендинг"
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Текст шаблона *</Label>
            <Textarea
              {...form.register("content")}
              placeholder="Добрый день! Готов взяться за ваш проект..."
              rows={10}
            />
            {form.formState.errors.content && (
              <p className="text-xs text-destructive">
                {form.formState.errors.content.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Создаём..." : "Создать шаблон"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
