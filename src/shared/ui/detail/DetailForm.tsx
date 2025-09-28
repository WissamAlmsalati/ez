"use client";
import React from "react";
import { UseMutationResult } from "@tanstack/react-query";
import { Button } from "flowbite-react";
import { toast } from "sonner";

export interface DetailFormProps<TData, TValues> {
  initial: TData;
  onSubmit: (values: FormData | TValues) => Promise<any>;
  fields: React.ReactNode; // عناصر الحقول
  footer?: React.ReactNode; // أزرار إضافية
  className?: string;
  buildFormData?: (form: HTMLFormElement, initial: TData) => FormData | TValues;
  mutation?: UseMutationResult<any, any, any>; // لإظهار حالة التحميل
  title?: string;
  errors?: Record<string, string[]> | undefined; // أخطاء قادمة من الباك
}

// مكوّن فورم مرن لإعادة الاستخدام في صفحات التفاصيل
export function DetailForm<TData, TValues = any>({
  initial,
  onSubmit,
  fields,
  footer,
  className,
  buildFormData,
  mutation,
  title,
  errors,
}: DetailFormProps<TData, TValues>) {
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    let payload: any;
    if (buildFormData) {
      payload = buildFormData(formEl, initial);
    } else {
      payload = new FormData(formEl);
    }
    try {
      setSubmitting(true);
      await onSubmit(payload);
      toast.success("تم الحفظ");
    } catch (err: any) {
      toast.error(err?.body?.message || err.message || "فشل الحفظ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className || "space-y-4"}>
      {title && <h3 className="font-semibold text-base">{title}</h3>}
      <div className="space-y-4">{fields}</div>
      {errors && (
        <div className="space-y-1 text-sm text-red-600">
          {Object.entries(errors).map(([k, v]) => (
            <div key={k}>{v.join("، ")}</div>
          ))}
        </div>
      )}
      <div className="pt-4 flex gap-3 flex-wrap">
        <Button type="submit" isProcessing={mutation?.isPending || submitting}>
          حفظ التغييرات
        </Button>
        {footer}
      </div>
    </form>
  );
}
