import { z } from "zod";

// شكل الخيار القادم من الريموت (يمكن تعديله لاحقاً لإضافة خصائص أخرى)
export const optionShape = z.object({
  id: z.number(),
  name: z.string(),
});

// القيم داخل الفورم (نحتفظ بالأجسام كاملة بدلاً من الأرقام)
export const createTypeFormSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  description: z.string().optional(),
  category: optionShape
    .nullable()
    .refine((v) => !!v, { message: "الصنف مطلوب" }),
  is_active: z.boolean().default(true),
  image: z.any().optional(), // FileList أو undefined
});

export type CreateTypeFormValues = z.input<typeof createTypeFormSchema>;

// لا نستخدم transform هنا لتسهيل التكامل مع react-hook-form، نستخرج المعرفات وقت الإرسال
// يمكن لاحقاً إضافة createTypeSubmitSchema = createTypeFormSchema.transform(...)
export type CreateTypeSubmitValues = {
  name: string;
  description?: string;
  category_id: number | undefined;
  is_active: boolean;
  image?: any;
};

// للتوافق مع الشفرة القديمة التي قد تستورد createTypeSchema / CreateTypeValues
// نبقي export بالاسم السابق ولكن نشير إلى الشكل الجديد (لمن لا يزال يستخدم الاسم)
export const createTypeSchema = createTypeFormSchema;
export type CreateTypeValues = CreateTypeFormValues;
