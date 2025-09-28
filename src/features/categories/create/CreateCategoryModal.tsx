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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCategorySchema, type CreateCategoryValues } from "./schema";
import { useCreateCategory } from "@/entities/category/api";
import { toFormData } from "@/entities/catalog/api";
import { toast } from "sonner";
import { useState } from "react";
import RemoteSelect from "@/shared/ui/remote/RemoteSelect";

export default function CreateCategoryModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createMutation = useCreateCategory();
  const [submitting, setSubmitting] = useState(false);
  const [selectedDept, setSelectedDept] = useState<any | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { is_active: true, department_id: undefined },
  });

  const watchedDeptId = watch("department_id");

  const onSubmit = handleSubmit(async (values: any) => {
    try {
      setSubmitting(true);
      const fd = toFormData({
        ...values,
        image: (values as any).image?.[0] ?? undefined,
      });
      await createMutation.mutateAsync(fd);
      toast.success("تم إضافة الصنف بنجاح");
      // Reset form + remote select state
      reset();
      setSelectedDept(null);
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
        <span className="text-lg font-semibold rtl:text-right">إضافة صنف</span>
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          {/* <h3 className="text-lg font-semibold rtl:text-right">إضافة صنف</h3> */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label value="اسم الصنف" />
              <TextInput
                placeholder="مثال: شرقي"
                {...register("name")}
                color={errors.name ? "failure" : undefined}
              />
            </div>
            <div>
              <Label value="القسم" />
              <RemoteSelect
                path="/departments"
                value={selectedDept}
                onChange={(val) => {
                  setSelectedDept(val);
                  if (val) {
                    setValue("department_id", (val as any).id as number, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  } else {
                    setValue("department_id", undefined as any, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }
                }}
                getOptionValue={(d: any) => d.id}
                getOptionLabel={(d: any) => d.name}
                placeholder="اختر القسم"
                pageSize={100}
              />
              {errors.department_id && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.department_id.message as any}
                </p>
              )}
            </div>
            <div>
              <Label value="وصف الصنف" />
              <Textarea rows={3} {...register("description")} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_active"
                {...register("is_active")}
                defaultChecked
              />
              <Label htmlFor="is_active">نشط</Label>
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
