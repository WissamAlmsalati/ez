import { z } from "zod";

export const unitPriceSchema = z.object({
  unit_id: z.coerce.number().refine((v) => !Number.isNaN(v), "الوحدة مطلوبة"),
  price: z.coerce.number().min(0, "السعر غير صالح"),
  is_default: z.boolean().default(false),
  min_qty: z.coerce.number().min(0, "أقل كمية غير صالحة"),
  step_qty: z.coerce.number().min(0, "خطوة الكمية غير صالحة"),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  description: z.string().optional(),
  type_id: z.coerce.number().refine((v) => !Number.isNaN(v), "النوع مطلوب"),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  image: z.any().optional(),
  prices: z
    .array(unitPriceSchema)
    .min(1, "يلزم سعر واحد على الأقل")
    .refine(
      (arr) => arr.filter((p) => p.is_default).length === 1,
      "يجب اختيار سعر افتراضي واحد فقط"
    )
    .refine((arr) => {
      const ids = arr.map((p) => p.unit_id);
      return new Set(ids).size === ids.length;
    }, "لا يجوز تكرار نفس الوحدة أكثر من مرة"),
});

export type CreateProductValues = z.input<typeof createProductSchema>;
