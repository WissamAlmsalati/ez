"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Label, TextInput } from "flowbite-react";
import { CardBox } from "@/shared/ui/cards";
import { useUpdateUser } from "@/entities/user/api";
import { toast } from "sonner";
import { Icon } from "@iconify/react";

const schema = z
  .object({
    newPassword: z.string().min(8, "يجب أن تكون كلمة المرور 8 أحرف على الأقل"),
    newPasswordConfirmation: z.string(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    path: ["newPasswordConfirmation"],
    message: "كلمتا المرور غير متطابقتين",
  });

type FormVals = z.infer<typeof schema>;

export default function ChangePasswordForm({
  userId,
}: {
  userId: number | string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);
  const updateUser = useUpdateUser(userId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormVals>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormVals) => {
    setIsSubmitting(true);
    try {
      // Laravel-style fields
      await updateUser.mutateAsync({
        password: values.newPassword as any,
        password_confirmation: values.newPasswordConfirmation as any,
      } as any);
      toast.success("تم تحديث كلمة المرور بنجاح");
      reset();
    } catch (e: any) {
      const message =
        e?.body?.message ||
        e?.response?.data?.message ||
        "فشل تحديث كلمة المرور";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CardBox className="p-6">
      <div className="mb-4">
        <h3 className="font-semibold">تغيير كلمة المرور</h3>
        <p className="text-xs text-darklink mt-1">
          قم بتحديث كلمة مرورك من هنا.
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-4 md:grid-cols-2"
      >
        <div className="space-y-2 md:col-span-1">
          <Label htmlFor="newPassword" value="كلمة المرور الجديدة" />
          <div className="relative">
            <TextInput
              id="newPassword"
              type={show2 ? "text" : "password"}
              {...register("newPassword")}
              color={errors.newPassword ? "failure" : undefined}
              aria-invalid={!!errors.newPassword}
              disabled={isSubmitting}
              helperText={
                errors.newPassword ? (
                  <span className="text-xs">{errors.newPassword.message}</span>
                ) : undefined
              }
            />
            <button
              type="button"
              onClick={() => setShow2((s) => !s)}
              className="absolute inset-y-0 left-0 flex items-center px-3 text-darklink hover:text-primary disabled:opacity-50"
              aria-label={show2 ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              disabled={isSubmitting}
            >
              <Icon
                icon={show2 ? "tabler:eye-off" : "tabler:eye"}
                height={20}
              />
            </button>
          </div>
        </div>

        <div className="space-y-2 md:col-span-1">
          <Label htmlFor="newPasswordConfirmation" value="تأكيد كلمة المرور" />
          <div className="relative">
            <TextInput
              id="newPasswordConfirmation"
              type={show3 ? "text" : "password"}
              {...register("newPasswordConfirmation")}
              color={errors.newPasswordConfirmation ? "failure" : undefined}
              aria-invalid={!!errors.newPasswordConfirmation}
              disabled={isSubmitting}
              helperText={
                errors.newPasswordConfirmation ? (
                  <span className="text-xs">
                    {errors.newPasswordConfirmation.message}
                  </span>
                ) : undefined
              }
            />
            <button
              type="button"
              onClick={() => setShow3((s) => !s)}
              className="absolute inset-y-0 left-0 flex items-center px-3 text-darklink hover:text-primary disabled:opacity-50"
              aria-label={show3 ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              disabled={isSubmitting}
            >
              <Icon
                icon={show3 ? "tabler:eye-off" : "tabler:eye"}
                height={20}
              />
            </button>
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" color="dark" isProcessing={isSubmitting}>
            تحديث كلمة المرور
          </Button>
        </div>
      </form>
    </CardBox>
  );
}
