import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { postApi, postQueries, type Post } from "@/entities/post";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { RichTextEditor } from "@/shared/ui/rich-text-editor";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";

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

interface Props {
  post: Post;
  trigger: React.ReactNode;
}

export const EditPostSheet = ({ post, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content,
      coverImage: post.coverImage ?? "",
      tagsRaw: post.tags ? post.tags.join(", ") : "",
      isPublished: post.isPublished,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormSchema) =>
      postApi.update(post.id, {
        title: data.title,
        slug: data.slug || undefined,
        excerpt: data.excerpt || undefined,
        content: data.content,
        coverImage: data.coverImage || undefined,
        tags: data.tagsRaw ? data.tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [],
        isPublished: data.isPublished,
      }),
    onSuccess: () => {
      toast.success("Статья обновлена!");
      queryClient.invalidateQueries({ queryKey: postQueries.listKeys() });
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
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Редактирование статьи</SheetTitle>
        </SheetHeader>
        <form
          onSubmit={form.handleSubmit((d) => mutate(d))}
          className="flex flex-col gap-4 mt-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label>Заголовок *</Label>
            <Input {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Slug</Label>
            <Input {...form.register("slug")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Краткое описание</Label>
            <Textarea {...form.register("excerpt")} rows={2} />
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
            <Input {...form.register("coverImage")} />
            {form.formState.errors.coverImage && (
              <p className="text-xs text-destructive">{form.formState.errors.coverImage.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Теги <span className="text-muted-foreground text-xs">(через запятую)</span></Label>
            <Input {...form.register("tagsRaw")} />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ep-isPublished"
              {...form.register("isPublished")}
              className="w-4 h-4"
            />
            <Label htmlFor="ep-isPublished" className="cursor-pointer">Опубликовано</Label>
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
