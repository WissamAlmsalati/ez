import { z } from "zod";

export const createUserSchema = z
  .object({
    name: z.string().min(1, "الاسم مطلوب"),
    email: z.string().min(1, "البريد الإلكتروني مطلوب").email("بريد غير صالح"),
    password: z.string().min(6, "كلمة المرور مطلوبة على الأقل 6 محارف"),
    phone: z.string().optional().or(z.literal("")),
    role: z.enum(["employee", "customer"]),
    department_id: z.number().optional().nullable(),
    is_active: z.boolean().optional(),
  })
  .refine(
    (val) => {
      if (val.role === "employee") return !!val.department_id;
      return true;
    },
    { path: ["department_id"], message: "القسم مطلوب للموظف" }
  );

export type CreateUserValues = z.infer<typeof createUserSchema>;
