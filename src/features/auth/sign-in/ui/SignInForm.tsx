import { Controller, useForm } from "react-hook-form";
import { formSchema, type FormSchema } from "../model/form-schema";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { useSignIn } from "../model/useSignIn";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";

export const SignInForm = () => {
  const { mutate, isPending } = useSignIn();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: FormSchema) => {
    mutate({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <form id="sign-in-form" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-6">
        <FieldGroup>
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Email</FieldLabel>
                <Input type="email" placeholder="Введите Email" aria-invalid={fieldState.invalid} {...field} />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="password"
            render={({ field }) => (
              <Field>
                <FieldLabel>Пароль</FieldLabel>
                <Input
                  type="password"
                  placeholder="Введите пароль"
                  {...field}
                />
              </Field>
            )}
          />
        </FieldGroup>
      </div>

      <Button className="w-full mt-6" type="submit" form="sign-in-form" disabled={isPending}>
        {isPending ? "Вход..." : "Войти"}
      </Button>
    </form>
  );
};
