import { z } from "zod";
import {
  createProductSchema,
  unitPriceSchema,
} from "@/features/products/create/schema";

export const updateProductSchema = createProductSchema
  .partial({
    name: true,
    description: true,
    type_id: true,
    is_active: true,
    is_featured: true,
    image: true,
    prices: true,
  })
  .extend({
    id: z.coerce.number(),
    prices: unitPriceSchema.array().optional(),
  });

export type UpdateProductValues = z.input<typeof updateProductSchema>;
