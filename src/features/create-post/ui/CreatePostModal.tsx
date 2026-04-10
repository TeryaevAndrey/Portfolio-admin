import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { postApi, postQueries } from "@/entities/post";
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
import { RichTextEditor } from "@/shared/ui/rich-text-editor";
import { Label } from "@/shared/ui/label";

const schema = z.object({
  title: z.string().min(1, "Введите заголовок"),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Введите содержимое"),
  coverImage: z.string().url("Введите корректный URL").optional().or(z.literal("")),
  tagsRaw: z.string().optional(),
  isPublished: z.boolean(),
});

type FormSchema = z.infer<typeof schema>;

const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

export const CreatePostModal = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: { isPublished: false },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormSchema) =>
      postApi.create({
        title: data.title,
        slug: data.slug || undefined,
        excerpt: data.excerpt || undefined,
        content: data.content,
        coverImage: data.coverImage || undefined,
        tags: data.tagsRaw ? data.tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
        isPublished: data.isPublished,
      }),
    onSuccess: () => {
      toast.success("Статья создана!");
      queryClient.invalidateQueries({ queryKey: postQueries.listKeys() });
      setOpen(false);
      form.reset({ isPublished: false });
    },
    onError: (error: AxiosError) => {
      const d = error.response?.data as { message?: string };
      toast.error(d?.message || "Ошибка при создании");
    },
  });

  const watchTitle = form.watch("title");

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) form.reset({ isPublished: false });
      }}
    >
      <DialogTrigger asChild>
        <Button variant="accent">Написать статью</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новая статья</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((d) => mutate(d))}
          className="flex flex-col gap-4 mt-2"
        >
          <div className="flex flex-col gap-1.5">
            <Label>Заголовок *</Label>
            <Input {...form.register("title")} placeholder="Моя первая статья" />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>
              Slug{" "}
              <span className="text-muted-foreground text-xs">(оставьте пустым — заполнится автоматически)</span>
            </Label>
            <Input
              {...form.register("slug")}
              placeholder={slugify(watchTitle || "moya-pervaya-statya")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Краткое описание</Label>
            <Textarea {...form.register("excerpt")} placeholder="Пару предложений о статье..." rows={2} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Содержимое *</Label>
            <Controller
              control={form.control}
              name="content"
              render={({ field }) => (
                <RichTextEditor
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="Текст статьи..."
                />
              )}
            />
            {form.formState.errors.content && (
              <p className="text-xs text-destructive">{form.formState.errors.content.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>URL обложки</Label>
            <Input {...form.register("coverImage")} placeholder="https://example.com/image.jpg" />
            {form.formState.errors.coverImage && (
              <p className="text-xs text-destructive">{form.formState.errors.coverImage.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Теги <span className="text-muted-foreground text-xs">(через запятую)</span></Label>
            <Input {...form.register("tagsRaw")} placeholder="react, typescript, webdev" />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="cp-isPublished" {...form.register("isPublished")} className="w-4 h-4" />
            <Label htmlFor="cp-isPublished" className="cursor-pointer">Опубликовать сразу</Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" variant="accent" disabled={isPending}>
              {isPending ? "Создаём..." : "Создать статью"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
