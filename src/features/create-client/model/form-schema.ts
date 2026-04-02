import z from "zod";

export const formSchema = z.object({
  fullName: z.string().min(1, { message: "Поле обязательно для заполнения" }),
  telegram: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: "Некорректный email" }).optional().or(z.literal("")),
  source: z.string().optional(),
});

export type FormSchema = z.infer<typeof formSchema>;
