import z from "zod";

export const loginSchema = z.object({
  identifier: z.string().email("الرجاء إدخال بريد إلكتروني صالح."),
  password: z.string().min(8, "يجب أن تكون كلمة المرور 8 أحرف على الأقل."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;