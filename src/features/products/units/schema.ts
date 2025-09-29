import { z } from "zod";

export const productUnitSchema = z.object({
  unit_id: z.number().positive("مطلوب"),
  unit_size: z
    .number()
    .positive("يجب أن يكون أكبر من صفر"),
  price: z
    .number()
    .nonnegative("لا يمكن أن يكون سالباً"),
  is_active: z.boolean().optional(),
});

export type ProductUnitFormValues = z.infer<typeof productUnitSchema>;
