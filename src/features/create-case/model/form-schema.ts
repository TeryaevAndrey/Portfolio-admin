import z from "zod";

export const formSchema = z.object({
  images: z.array(z.file()),
  title: z.string().min(1, { message: "Поле обязательно для заполнения" }),
  description: z.string(),
  link: z.string(),
});

export type FormSchema = z.infer<typeof formSchema>;
