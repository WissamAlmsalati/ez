"use client";
import {
  Modal,
  Button,
  Label,
  TextInput,
  Checkbox,
  FileInput,
  Spinner,
  Textarea,
} from "flowbite-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTypeSchema, type CreateTypeValues, optionShape } from "./schema";
import { useCreateType } from "@/entities/product-type/api";
import { toFormData } from "@/entities/catalog/api";
import { toast } from "sonner";
import { useState } from "react"; // still used only for submitting indicator
import RemoteSelect from "@/shared/ui/remote/RemoteSelect";
// نستخدم الشكل المبسط (id, name) المخزن في schema بدلاً من النوع الكامل Department/Category
type SimpleOption = { id: number; name: string };

export default function CreateTypeModal({
  open,
  onClose,
  categoryId,
}: {
  open: boolean;
  onClose: () => void;
  /**
   * Optional fixed category id. When provided:
   * - The category select is hidden.
   * - Validation does NOT require choosing a category (it's implicit).
   * - Submitted payload uses this id instead of form category field.
   */
  categoryId?: number;
}) {
  const createMutation = useCreateType();
  const [submitting, setSubmitting] = useState(false);
  // لم نعد نحتاج تخزين الحالة محلياً للاختيارات؛ يتم ذلك داخل react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<CreateTypeValues>({
    // إذا كان هناك categoryId ثابت نجعل الحقل اختيارياً (لن نظهر الحقل أصلاً)
    // ملاحظة: createTypeSchema.category يحتوي refine يجعل nullable/optional مباشرة غير متاحة
    // لذلك ننشئ نسخة مخففة بدون شرط الصنف عندما يكون categoryId موجود.
    resolver: zodResolver(
      categoryId
        ? createTypeSchema
            .omit({ category: true })
            .extend({ category: optionShape.nullable() }) // نفس التوقيع: موجود دائماً (قد يكون null)
        : createTypeSchema
    ),
    defaultValues: { is_active: true, category: null },
  });

  // The category select is independent now; no coupling logic.

  const onSubmit = handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      const fd = toFormData({
        name: values.name,
        description: values.description,
        category_id: categoryId ?? values.category?.id,
        is_active: values.is_active,
        image: (values as any).image?.[0] ?? undefined,
      });
      await createMutation.mutateAsync(fd);
      toast.success("تم إضافة المجموعة بنجاح");
      reset();
      onClose();
    } catch (e: any) {
      toast.error(e?.body?.message || "حدث خطأ أثناء الإضافة");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Modal show={open} size="md" onClose={onClose} popup>
      <Modal.Header className="p-4">
        <span className="text-lg font-semibold rtl:text-right">إضافة مجموعة</span>
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label value="اسم المجموعة" />
              <TextInput
                {...register("name")}
                color={errors.name ? "failure" : undefined}
              />
            </div>
            <div>
              <Label value="وصف المجموعة" />
              <Textarea rows={3} {...register("description")} />
            </div>
            {!categoryId && (
              <div>
                <Label value="القسم" />
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <RemoteSelect<SimpleOption>
                      path="/categories"
                      value={field.value}
                      onChange={(val) => field.onChange(val || null)}
                      getOptionValue={(c) => c.id as any}
                      getOptionLabel={(c) => c.name}
                      placeholder="اختر القسم"
                      pageSize={100}
                    />
                  )}
                />
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.category.message as any}
                  </p>
                )}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_active_type"
                {...register("is_active")}
                defaultChecked
              />
              <Label htmlFor="is_active_type">نشط</Label>
            </div>
            <div>
              <Label value="صورة" />
              <FileInput accept="image/*" {...register("image")} />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                color="gray"
                onClick={onClose}
                type="button"
                className="transition-colors duration-300"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                color={"primary"}
                className="transition-colors duration-300"
              >
                {submitting ? <Spinner size="sm" /> : "تأكيد"}
              </Button>
            </div>
          </form>
        </div>
      </Modal.Body>
    </Modal>
  );
}
