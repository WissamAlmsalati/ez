import { z } from "zod";

export const createUserSchema = z
  .object({
    name: z.string().min(1, "الاسم مطلوب"),
    email: z.string().min(1, "البريد الإلكتروني مطلوب").email("بريد غير صالح"),
    password: z.string().min(6, "كلمة المرور مطلوبة على الأقل 6 محارف"),
    phone: z
      .union([
        z.literal(""),
        z
          .string()
          .regex(
            /^09\d{8}$/,
            "رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام"
          ),
      ])
      .optional(),
    role: z.enum(["employee", "customer"]),
    category_id: z.number().optional().nullable(),
    is_active: z.boolean().optional(),
  })
  .refine(
    (val) => {
      if (val.role === "employee") return !!(val as any).category_id;
      return true;
    },
    { path: ["category_id"], message: "التصنيف مطلوب للموظف" }
  );

export type CreateUserValues = z.infer<typeof createUserSchema>;
