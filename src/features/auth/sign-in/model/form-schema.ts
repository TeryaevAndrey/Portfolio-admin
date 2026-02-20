import z from "zod";

export const formSchema = z.object({
  email: z.email({message: "Введите корректный email"}),
  password: z.string(),
});

export type FormSchema = z.infer<typeof formSchema>;
