import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { reviewApi, reviewQueries } from "@/entities/review";
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
import { ImagePlus, X } from "lucide-react";

const schema = z.object({
  authorName: z.string().min(1, "Введите имя автора"),
  authorPosition: z.string().optional(),
  text: z.string().min(1, "Введите текст отзыва"),
  rating: z.number().min(1).max(5),
  isPublished: z.boolean(),
});

type FormSchema = z.infer<typeof schema>;

export const CreateReviewModal = () => {
  const [open, setOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 5, isPublished: true },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: reviewApi.create,
    onSuccess: () => {
      toast.success("Отзыв создан!");
      queryClient.invalidateQueries({ queryKey: reviewQueries.listKeys() });
      setOpen(false);
      handleReset();
    },
    onError: (error: AxiosError) => {
      const data = error.response?.data as { message?: string };
      toast.error(data?.message || "Ошибка при создании");
    },
  });

  const handleReset = () => {
    form.reset({ rating: 5, isPublished: true });
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: FormSchema) => {
    let avatarUrl: string | undefined;

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

    mutate({
      authorName: data.authorName,
      authorPosition: data.authorPosition || undefined,
      authorAvatar: avatarUrl,
      text: data.text,
      rating: data.rating,
      isPublished: data.isPublished,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) handleReset(); }}>
      <DialogTrigger asChild>
        <Button variant="accent">Добавить отзыв</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новый отзыв</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label>Имя автора *</Label>
            <Input {...form.register("authorName")} placeholder="Иван Петров" />
            {form.formState.errors.authorName && (
              <p className="text-xs text-destructive">{form.formState.errors.authorName.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Должность / компания</Label>
            <Input {...form.register("authorPosition")} placeholder="CEO, ООО «Ромашка»" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Аватар автора</Label>
            {avatarPreview ? (
              <div className="relative w-20 h-20">
                <img
                  src={avatarPreview}
                  alt="Превью"
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
            <Textarea {...form.register("text")} placeholder="Отличная работа..." rows={4} />
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
              {isUploading ? "Загружаем аватар..." : isPending ? "Создаём..." : "Создать отзыв"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
