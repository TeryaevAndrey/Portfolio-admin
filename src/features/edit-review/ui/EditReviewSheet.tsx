import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { reviewApi, reviewQueries, type Review } from "@/entities/review";
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
import { ImagePlus, X } from "lucide-react";

const schema = z.object({
  authorName: z.string().min(1, "Введите имя автора"),
  authorPosition: z.string().optional(),
  text: z.string().min(1, "Введите текст отзыва"),
  rating: z.number().min(1).max(5),
  isPublished: z.boolean(),
});

type FormSchema = z.infer<typeof schema>;

interface Props {
  review: Review;
  trigger: React.ReactNode;
}

export const EditReviewSheet = ({ review, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      authorName: review.authorName,
      authorPosition: review.authorPosition ?? "",
      text: review.text,
      rating: review.rating,
      isPublished: review.isPublished,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (params: { data: FormSchema; avatarUrl?: string | null }) =>
      reviewApi.update(review.id, {
        authorName: params.data.authorName,
        authorPosition: params.data.authorPosition || undefined,
        authorAvatar: params.avatarUrl === null ? undefined : (params.avatarUrl ?? undefined),
        text: params.data.text,
        rating: params.data.rating,
        isPublished: params.data.isPublished,
      }),
    onSuccess: () => {
      toast.success("Отзыв обновлён!");
      queryClient.invalidateQueries({ queryKey: reviewQueries.listKeys() });
      setOpen(false);
    },
    onError: (error: AxiosError) => {
      const data = error.response?.data as { message?: string };
      toast.error(data?.message || "Ошибка при обновлении");
    },
  });

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    setAvatarFile(file);
    setRemoveAvatar(false);
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const currentAvatarSrc = avatarPreview ?? (!removeAvatar ? review.authorAvatar : null);

  const onSubmit = async (data: FormSchema) => {
    let avatarUrl: string | null | undefined = removeAvatar ? null : undefined;

    if (avatarFile) {
      setIsUploading(true);
      try {
        const res = await reviewApi.uploadAvatar(avatarFile);
        const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://localhost:3000";
        avatarUrl = `${baseUrl}${res.url}`;
      } catch {
        toast.error("Ошибка загрузки аватара");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    mutate({ data, avatarUrl });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Редактирование отзыва</SheetTitle>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-1.5">
            <Label>Имя автора *</Label>
            <Input {...form.register("authorName")} />
            {form.formState.errors.authorName && (
              <p className="text-xs text-destructive">{form.formState.errors.authorName.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Должность / компания</Label>
            <Input {...form.register("authorPosition")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Аватар автора</Label>
            {currentAvatarSrc ? (
              <div className="relative w-20 h-20">
                <img
                  src={currentAvatarSrc}
                  alt="Аватар"
                  className="w-20 h-20 rounded-full object-cover border"
                />
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-sm text-muted-foreground border border-dashed rounded-md px-3 py-2 hover:bg-muted/50 transition-colors w-fit"
              >
                <ImagePlus className="w-4 h-4" />
                Выбрать изображение
              </button>
            )}
            {currentAvatarSrc && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                <ImagePlus className="w-3 h-3" />
                Заменить
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Текст отзыва *</Label>
            <Textarea {...form.register("text")} rows={5} />
            {form.formState.errors.text && (
              <p className="text-xs text-destructive">{form.formState.errors.text.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <Label>Рейтинг (1–5)</Label>
              <Input
                type="number"
                min={1}
                max={5}
                {...form.register("rating", { valueAsNumber: true })}
              />
            </div>
            <div className="flex flex-col gap-1.5 justify-end">
              <Label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...form.register("isPublished")} className="w-4 h-4" />
                Опубликован
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" variant="accent" disabled={isPending || isUploading}>
              {isUploading ? "Загружаем аватар..." : isPending ? "Сохраняем..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
