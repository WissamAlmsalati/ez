import { z } from "zod";
import { createTypeFormSchema } from "@/features/types/create/schema";

export const updateTypeSchema = createTypeFormSchema
  .partial({
    name: true,
    category: true,
  })
  .extend({ id: z.coerce.number() });

export type UpdateTypeValues = z.input<typeof updateTypeSchema>;
