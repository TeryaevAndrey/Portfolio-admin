import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useQuery } from "@tanstack/react-query";
import { sphereQueries } from "@/entities/sphere";
import { clientQueries } from "@/entities/client";
import { ProjectStatus, PROJECT_STATUS_LABELS, type Project } from "@/entities/project";

const formSchema = z.object({
  title: z.string().min(1, { message: "Поле обязательно" }),
  description: z.string().optional(),
  sphereId: z.string().optional(),
  clientId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  deadline: z.string().optional(),
  totalCost: z.string().optional(),
  paidAmount: z.string().optional(),
  expenses: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
});

export type ProjectFormSchema = z.infer<typeof formSchema>;

interface Props {
  defaultValues?: Partial<ProjectFormSchema>;
  onSubmit: (data: ProjectFormSchema) => void;
  isPending?: boolean;
  submitLabel?: string;
}

export const ProjectForm = ({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel = "Сохранить",
}: Props) => {
  const form = useForm<ProjectFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      sphereId: "",
      clientId: "",
      startDate: "",
      endDate: "",
      deadline: "",
      totalCost: "",
      paidAmount: "",
      expenses: "",
      status: ProjectStatus.DRAFT,
      ...defaultValues,
    },
  });

  const { data: spheres } = useQuery(sphereQueries.list());
  const { data: clients } = useQuery(clientQueries.list({ limit: 100 }));

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        {/* Название */}
        <Controller
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Название *</FieldLabel>
              <Input placeholder="Корпоративный сайт" {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Описание */}
        <Controller
          control={form.control}
          name="description"
          render={({ field }) => (
            <Field>
              <FieldLabel>Описание</FieldLabel>
              <Textarea placeholder="Краткое описание проекта" {...field} />
            </Field>
          )}
        />

        {/* Сфера + Клиент */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            control={form.control}
            name="sphereId"
            render={({ field }) => (
              <Field>
                <FieldLabel>Сфера</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите сферу" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="none">— Не указана —</SelectItem>
                      {spheres?.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <Field>
                <FieldLabel>Клиент</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите клиента" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="none">— Не указан —</SelectItem>
                      {clients?.items.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.fullName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </div>

        {/* Статус */}
        <Controller
          control={form.control}
          name="status"
          render={({ field }) => (
            <Field>
              <FieldLabel>Статус</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.values(ProjectStatus).map((s) => (
                      <SelectItem key={s} value={s}>
                        {PROJECT_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        {/* Даты */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Controller
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <Field>
                <FieldLabel>Начало работ</FieldLabel>
                <Input type="date" {...field} />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <Field>
                <FieldLabel>Срок сдачи</FieldLabel>
                <Input type="date" {...field} />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <Field>
                <FieldLabel>Дата завершения</FieldLabel>
                <Input type="date" {...field} />
              </Field>
            )}
          />
        </div>

        {/* Финансы */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Controller
            control={form.control}
            name="totalCost"
            render={({ field }) => (
              <Field>
                <FieldLabel>Полная стоимость</FieldLabel>
                <Input type="number" placeholder="150000" {...field} />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="paidAmount"
            render={({ field }) => (
              <Field>
                <FieldLabel>Оплачено</FieldLabel>
                <Input type="number" placeholder="75000" {...field} />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="expenses"
            render={({ field }) => (
              <Field>
                <FieldLabel>Расходы</FieldLabel>
                <Input type="number" placeholder="12000" {...field} />
              </Field>
            )}
          />
        </div>

        <Button type="submit" variant="accent" disabled={isPending} className="w-full">
          {isPending ? "Сохранение..." : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
};

/** Конвертирует строки формы в числа для отправки на API */
export function projectFormToParams(data: ProjectFormSchema) {
  return {
    title: data.title,
    description: data.description || undefined,
    sphereId: data.sphereId && data.sphereId !== "none" ? Number(data.sphereId) : undefined,
    clientId: data.clientId && data.clientId !== "none" ? Number(data.clientId) : undefined,
    startDate: data.startDate || undefined,
    endDate: data.endDate || undefined,
    deadline: data.deadline || undefined,
    totalCost: data.totalCost ? Number(data.totalCost) : undefined,
    paidAmount: data.paidAmount ? Number(data.paidAmount) : undefined,
    expenses: data.expenses ? Number(data.expenses) : undefined,
    status: data.status,
  };
}

/** Конвертирует project в defaultValues формы */
export function projectToFormDefaults(project: Project): ProjectFormSchema {
  return {
    title: project.title,
    description: project.description ?? "",
    sphereId: project.sphereId ? String(project.sphereId) : "",
    clientId: project.clientId ? String(project.clientId) : "",
    startDate: project.startDate ?? "",
    endDate: project.endDate ?? "",
    deadline: project.deadline ?? "",
    totalCost: project.totalCost ? String(project.totalCost) : "",
    paidAmount: project.paidAmount ? String(project.paidAmount) : "",
    expenses: project.expenses ? String(project.expenses) : "",
    status: project.status,
  };
}
