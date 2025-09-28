import { z } from "zod";
import { createCategorySchema } from "@/features/categories/create/schema";

// جعل كل الحقول اختيارية للتحديث (عدا الاسم يمكن أن يكون غير مطلوب إذا لم يُعدل)
export const updateCategorySchema = createCategorySchema
  .partial({
    name: true,
  })
  .extend({
    id: z.coerce.number(),
  });

export type UpdateCategoryValues = z.input<typeof updateCategorySchema>;
