import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { useUpdateClient } from "../model/useUpdateClient";
import type { Client } from "@/entities/client";

const formSchema = z.object({
  fullName: z.string().min(1, { message: "Поле обязательно для заполнения" }),
  telegram: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: "Некорректный email" }).optional().or(z.literal("")),
  source: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

interface Props {
  client: Client;
  onSuccess?: () => void;
}

export const EditClientForm = ({ client, onSuccess }: Props) => {
  const { mutate, isPending } = useUpdateClient();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: client.fullName,
      telegram: client.telegram ?? "",
      phone: client.phone ?? "",
      email: client.email ?? "",
      source: client.source ?? "",
    },
  });

  const onSubmit = (data: FormSchema) => {
    mutate(
      {
        id: client.id,
        data: {
          fullName: data.fullName,
          telegram: data.telegram || undefined,
          phone: data.phone || undefined,
          email: data.email || undefined,
          source: data.source || undefined,
        },
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      },
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="fullName"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>ФИО *</FieldLabel>
              <Input placeholder="Иванов Иван Иванович" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="telegram"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Telegram</FieldLabel>
              <Input placeholder="@username" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="phone"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Телефон</FieldLabel>
              <Input placeholder="+79001234567" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Email</FieldLabel>
              <Input type="email" placeholder="ivan@example.com" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="source"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Откуда пришел</FieldLabel>
              <Input placeholder="kwork, upwork, instagram..." {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button
          type="submit"
          variant="accent"
          disabled={isPending}
          className="w-full"
        >
          {isPending ? "Сохранение..." : "Сохранить изменения"}
        </Button>
      </FieldGroup>
    </form>
  );
};
