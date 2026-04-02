import { Controller, useForm } from "react-hook-form";
import { formSchema, type FormSchema } from "../model/form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { useCreateClient } from "../model/useCreateClient";

interface Props {
  onSuccess?: () => void;
}

export const CreateClientForm = ({ onSuccess }: Props) => {
  const { mutate, isPending } = useCreateClient();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      telegram: "",
      phone: "",
      email: "",
      source: "",
    },
  });

  const onSubmit = (data: FormSchema) => {
    mutate(
      {
        fullName: data.fullName,
        telegram: data.telegram || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        source: data.source || undefined,
      },
      {
        onSuccess: () => {
          form.reset();
          onSuccess?.();
        },
      },
    );
  };

  return (
    <form id="create-client-form" onSubmit={form.handleSubmit(onSubmit)}>
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
          {isPending ? "Добавление..." : "Добавить клиента"}
        </Button>
      </FieldGroup>
    </form>
  );
};
