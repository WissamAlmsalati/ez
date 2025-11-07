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
// Removed department selection per request

export default function CreateCategoryModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createMutation = useCreateCategory();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { is_active: true },
  });

  const onSubmit = handleSubmit(async (values: any) => {
    try {
      setSubmitting(true);
      const fd = toFormData({
        ...values,
        image: (values as any).image?.[0] ?? undefined,
      });
      await createMutation.mutateAsync(fd);
      toast.success("تم إضافة القسم بنجاح");
      // Reset form + remote select state
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
        <span className="text-lg font-semibold rtl:text-right">إضافة قسم</span>
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          {/* <h3 className="text-lg font-semibold rtl:text-right">إضافة صنف</h3> */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label value="اسم القسم" />
              <TextInput
                {...register("name")}
                color={errors.name ? "failure" : undefined}
              />
            </div>
            <div>
              <Label value="وصف القسم" />
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
