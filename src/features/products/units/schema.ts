import { z } from "zod";

export const productUnitSchema = z.object({
  unit_id: z.number({ invalid_type_error: "اختر وحدة" }).positive("مطلوب"),
  unit_size: z
    .number({ invalid_type_error: "أدخل الحجم" })
    .positive("يجب أن يكون أكبر من صفر"),
  price: z
    .number({ invalid_type_error: "أدخل السعر" })
    .nonnegative("لا يمكن أن يكون سالباً"),
  is_active: z.boolean().optional(),
});

export type ProductUnitFormValues = z.infer<typeof productUnitSchema>;
