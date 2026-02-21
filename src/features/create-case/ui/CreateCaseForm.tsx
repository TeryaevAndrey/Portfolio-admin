import { Controller, useForm } from "react-hook-form";
import { formSchema, type FormSchema } from "../model/form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { FileUpload } from "@/shared/ui/file-upload";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { useCreateCase } from "../model/useCreateCase";
import { toast } from "sonner";

export const CreateCaseForm = () => {
  const { mutate, isPending } = useCreateCase();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      images: [],
      title: "",
      description: "",
      link: "",
    },
  });

  const onSubmit = (data: FormSchema) => {
    if (data.images.length === 0)
      return toast.warning("Добавьте минимум 1 изображение");

    mutate(data);
  };

  return (
    <form id="create-case-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="images"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Медиа</FieldLabel>
              <div className="border border-dashed bg-background border-muted rounded-xl">
                <FileUpload onChange={(files) => field.onChange(files)} />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </div>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Название</FieldLabel>
              <Input placeholder="Введите название" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Описание</FieldLabel>
              <Textarea placeholder="Введите описание" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="link"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Ссылка демо</FieldLabel>
              <Input placeholder="Введите ссылку" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        className="w-full mt-6"
        type="submit"
        form="create-case-form"
        disabled={isPending}
      >
        {!isPending ? "Сохранить" : "Загрузка..."}
      </Button>
    </form>
  );
};
