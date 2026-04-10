import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosInstance } from "@/shared/api/base";
import { projectQueries } from "@/entities/project";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Upload } from "lucide-react";

const importProjects = async (
  file: File
): Promise<{ imported: number; skipped: number }> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post<{ imported: number; skipped: number }>(
    "/projects/import",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

export const ImportProjectsModal = () => {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: importProjects,
    onSuccess: ({ imported, skipped }) => {
      toast.success(`Импортировано ${imported} проектов, пропущено ${skipped}`);
      queryClient.invalidateQueries({ queryKey: projectQueries.listKeys() });
      setOpen(false);
      setSelectedFile(null);
    },
    onError: () => {
      toast.error("Ошибка при импорте. Проверьте формат файла.");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleSubmit = () => {
    if (!selectedFile) return;
    mutate(selectedFile);
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Импорт Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Импорт проектов из Excel</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <p className="text-sm text-muted-foreground">
            Загрузите файл Excel (.xlsx, .xls). Ожидаемые колонки:{" "}
            <span className="font-medium text-foreground">Название</span> (клиент),{" "}
            <span className="font-medium text-foreground">Сфера, Описание, Начало, Итого, Оплатили, Комиссия, Осталось, Завершение, Связь, Статус</span>.
            Клиент будет создан автоматически. Синие/голубые строки пропускаются. Зелёный цвет строки или статус = «Выполнено».
          </p>

          <div
            className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/60 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-muted-foreground" />
            {selectedFile ? (
              <span className="text-sm font-medium text-foreground">
                {selectedFile.name}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                Нажмите для выбора файла
              </span>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Отмена
            </Button>
            <Button
              variant="accent"
              disabled={!selectedFile || isPending}
              onClick={handleSubmit}
            >
              {isPending ? "Импортируем..." : "Импортировать"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
