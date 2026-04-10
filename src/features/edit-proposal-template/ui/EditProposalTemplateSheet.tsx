import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import {
  proposalTemplateApi,
  proposalTemplateQueries,
  type ProposalTemplate,
} from "@/entities/proposal-template";
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
  title: z.string().min(1, "Введите название шаблона"),
  content: z.string().min(1, "Введите текст шаблона"),
});

type FormSchema = z.infer<typeof schema>;

interface Props {
  template: ProposalTemplate;
  trigger: React.ReactNode;
}

export const EditProposalTemplateSheet = ({ template, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: template.title,
      content: template.content,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormSchema) =>
      proposalTemplateApi.update(template.id, data),
    onSuccess: () => {
      toast.success("Шаблон обновлён!");
      queryClient.invalidateQueries({
        queryKey: proposalTemplateQueries.listKeys(),
      });
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
          <SheetTitle>Редактирование шаблона</SheetTitle>
        </SheetHeader>
        <form
          onSubmit={form.handleSubmit((d) => mutate(d))}
          className="flex flex-col gap-4 mt-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label>Название *</Label>
            <Input {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Текст шаблона *</Label>
            <Textarea {...form.register("content")} rows={14} />
            {form.formState.errors.content && (
              <p className="text-xs text-destructive">
                {form.formState.errors.content.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Сохраняем..." : "Сохранить изменения"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};
