"use client";
import {
  Modal,
  Button,
  Label,
  TextInput,
  Textarea,
  Checkbox,
  FileInput,
  Spinner,
} from "flowbite-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateAdvertisement } from "@/entities/advertisement/api";
import { toast } from "sonner";
import { useState } from "react";

const schema = z.object({
  title: z.string().min(2, "العنوان مطلوب"),
  description: z.string().optional(),
  starts_at: z.string().min(1, "تاريخ البداية مطلوب"),
  ends_at: z.string().min(1, "تاريخ النهاية مطلوب"),
  is_active: z.boolean(),
  image: z.any().optional(),
});

export type CreateAdvertisementValues = z.infer<typeof schema>;

export default function CreateAdvertisementModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createMutation = useCreateAdvertisement();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAdvertisementValues>({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("title", values.title);
      fd.append("starts_at", values.starts_at);
      fd.append("ends_at", values.ends_at);
      if (values.description) fd.append("description", values.description);
      fd.append("is_active", values.is_active ? "1" : "0");
      const imgFile = (values as any).image?.[0];
      if (imgFile) fd.append("image", imgFile);
      await createMutation.mutateAsync(fd);
      toast.success("تم إنشاء الإعلان بنجاح");
      reset({ is_active: true });
      onClose();
    } catch (e: any) {
      toast.error(e?.body?.message || "فشل إنشاء الإعلان");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Modal show={open} size="lg" onClose={onClose} popup>
      <Modal.Header />
      <Modal.Body>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold rtl:text-right">إضافة إعلان</h3>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 col-span-2">
                <Label value="عنوان الإعلان" />
                <TextInput {...register("title")} />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.title.message as any}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label value="الوصف" />
              <Textarea rows={3} {...register("description")} />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description.message as any}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label value="تاريخ البدء" />
                <TextInput type="date" {...register("starts_at")} />
                {errors.starts_at && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.starts_at.message as any}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Label value="تاريخ الانتهاء" />
                <TextInput type="date" {...register("ends_at")} />
                {errors.ends_at && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.ends_at.message as any}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label value="صورة الإعلان" />
              <FileInput accept="image/*" {...register("image")} />
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_active_ad"
                  {...register("is_active")}
                  defaultChecked
                />
                <Label htmlFor="is_active_ad">نشط</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button color="gray" type="button" onClick={onClose}>
                إلغاء
              </Button>
              <Button type="submit" disabled={submitting} color="primary">
                {submitting ? <Spinner size="sm" /> : "تأكيد"}
              </Button>
            </div>
          </form>
        </div>
      </Modal.Body>
    </Modal>
  );
}
