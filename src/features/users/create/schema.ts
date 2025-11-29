import { z } from "zod";

export const createUserSchema = z
  .object({
    name: z.string().min(1, "الاسم مطلوب"),
    // البريد الإلكتروني اختياري للزبون، وإجباري للموظف (يتم التحقق لاحقاً)
    email: z.union([z.literal(""), z.string().email("بريد غير صالح")]),
    password: z.string().min(8, "كلمة المرور مطلوبة على الأقل 8 حروف"),
    // رقم الهاتف إجباري للزبون والموظف بصيغة محددة
    phone: z
      .string()
      .regex(/^09\d{8}$/, "رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام"),
    role: z.enum(["employee", "customer"]),
    category_id: z.number().optional().nullable(),
    is_active: z.boolean().optional(),
  })
  .superRefine((val, ctx) => {
    // إذا كان الموظف: البريد الإلكتروني مطلوب
    if (val.role === "employee" && val.email === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "البريد الإلكتروني مطلوب للموظف",
        path: ["email"],
      });
    }
  })
  .refine(
    (val) => {
      if (val.role === "employee") return !!(val as any).category_id;
      return true;
    },
    { path: ["category_id"], message: "التصنيف مطلوب للموظف" }
  );

export type CreateUserValues = z.infer<typeof createUserSchema>;
