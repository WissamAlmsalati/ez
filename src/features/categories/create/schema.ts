import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  description: z.string().optional(),
  sort_order: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    z.coerce.number().optional()
  ),
  department_id: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    z.coerce.number().optional()
  ),
  is_active: z.boolean().default(true),
  image: z.any().optional(),
});

// Explicit form values type to avoid resolver generic mismatch with preprocess unknowns
export interface CreateCategoryValues {
  name: string;
  description?: string;
  sort_order?: number;
  department_id?: number;
  is_active: boolean;
  image?: any;
}
