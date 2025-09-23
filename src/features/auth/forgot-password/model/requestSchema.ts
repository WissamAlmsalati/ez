import { z } from "zod";

export const requestResetSchema = z.object({
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("صيغة البريد الإلكتروني غير صحيحة"),
});

export type RequestResetFormValues = z.infer<typeof requestResetSchema>;
