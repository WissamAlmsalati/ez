import { z } from "zod";

export const resetConfirmSchema = z
  .object({
    otp: z.string().length(6, "رمز التحقق يجب أن يكون 6 أحرف"),
    newPassword: z.string().min(8, "كلمة المرور يجب أن لا تقل عن 8 أحرف"),
    newPasswordConfirmation: z.string(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: "تأكيد كلمة المرور غير مطابق",
    path: ["newPasswordConfirmation"],
  });

export type ResetConfirmFormValues = z.infer<typeof resetConfirmSchema>;
