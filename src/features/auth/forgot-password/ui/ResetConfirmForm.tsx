"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, Button, Label, TextInput, Alert, Spinner } from "flowbite-react";
import {
  resetConfirmSchema,
  type ResetConfirmFormValues,
} from "../model/confirmSchema";
import { useForgotPasswordStore } from "../model/store";
import { useMutation } from "@tanstack/react-query";
import { confirmPasswordReset, requestPasswordReset } from "../api/mutations";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

interface Props {
  onBack?: () => void;
  emailGuard?: boolean;
}

const ResetConfirmForm = ({ onBack, emailGuard = false }: Props) => {
  const router = useRouter();
  const { email, expiresAt, setExpiresAt, reset } = useForgotPasswordStore();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    if (!email && emailGuard) {
      if (onBack) onBack();
      else router.replace("/login/forgot-password/request");
    }
  }, [email, router, emailGuard, onBack]);

  useEffect(() => {
    if (!expiresAt) {
      setSecondsLeft(0);
      return;
    }
    const calc = () => {
      const now = new Date().getTime();
      const exp = new Date(expiresAt).getTime();
      const diff = Math.max(0, Math.ceil((exp - now) / 1000));
      setSecondsLeft(diff);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetConfirmFormValues>({
    resolver: zodResolver(resetConfirmSchema),
  });

  const mutation = useMutation({
    mutationFn: confirmPasswordReset,
    onSuccess: () => {
      toast.success("تم تحديث كلمة المرور بنجاح");
      const backToLogin = () => router.replace("/login");
      reset();
      backToLogin();
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "تعذر التأكيد. حاول مرة أخرى";
      setServerError(message);
    },
  });

  const resendMutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => {
      // Reset 30s cooldown from now on successful resend
      setExpiresAt(new Date(Date.now() + 30 * 1000).toISOString());
      toast.success("تم إعادة إرسال الرمز إلى بريدك");
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "تعذر إعادة الإرسال";
      setServerError(message);
    },
  });

  const onSubmit = (values: ResetConfirmFormValues) => {
    if (!email) return;
    setServerError(null);
    mutation.mutate({
      email,
      otp: values.otp,
      newPassword: values.newPassword,
      newPasswordConfirmation: values.newPasswordConfirmation,
    });
  };

  return (
    <div className="w-full flex justify-center items-center min-h-screen px-4">
      <Card className="w-full max-w-md shadow-md">
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-dark dark:text-white">
              تأكيد رمز التحقق
            </h2>
            {onBack && (
              <Button color="transparent" onClick={onBack}>
                رجوع
              </Button>
            )}
          </div>
          <p className="text-sm text-darklink text-center mt-1">
            أدخل الرمز وكلمة المرور الجديدة لحساب: {email || ""}
          </p>
          <div className="mt-2 text-xs text-darklink">
            {secondsLeft > 0 ? (
              <span>
                لم يصلك الرمز؟ يمكنك إعادة الإرسال خلال{" "}
                {Math.floor(secondsLeft / 60)}:
                {(secondsLeft % 60).toString().padStart(2, "0")}
              </span>
            ) : (
              <Button
                size="sm"
                color="lightprimary"
                onClick={() => email && resendMutation.mutate({ email })}
                disabled={resendMutation.isPending || !email}
                className="mt-1"
              >
                {resendMutation.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size="sm" /> جاري الإرسال
                  </span>
                ) : (
                  "إعادة إرسال الرمز"
                )}
              </Button>
            )}
          </div>
        </div>

        {serverError ? (
          <Alert color="failure" className="rtl:text-right ltr:text-left">
            {serverError}
          </Alert>
        ) : null}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rtl:text-right"
        >
          <div>
            <Label htmlFor="otp" value="رمز التحقق" className="mb-2 block" />
            <TextInput
              id="otp"
              type="text"
              placeholder="123456"
              {...register("otp")}
              disabled={mutation.isPending}
              color={errors.otp ? "failure" : undefined}
              aria-invalid={!!errors.otp}
              helperText={
                errors.otp ? (
                  <span className="text-xs">{errors.otp.message}</span>
                ) : undefined
              }
            />
          </div>

          <div>
            <Label
              htmlFor="newPassword"
              value="كلمة المرور الجديدة"
              className="mb-2 block"
            />
            <div className="relative">
              <TextInput
                id="newPassword"
                type={showPassword ? "text" : "password"}
                {...register("newPassword")}
                disabled={mutation.isPending}
                color={errors.newPassword ? "failure" : undefined}
                aria-invalid={!!errors.newPassword}
                helperText={
                  errors.newPassword ? (
                    <span className="text-xs">
                      {errors.newPassword.message}
                    </span>
                  ) : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 left-0 flex items-center px-3 text-darklink hover:text-primary disabled:opacity-50"
                aria-label={
                  showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                }
                disabled={mutation.isPending}
              >
                <Icon
                  icon={showPassword ? "tabler:eye-off" : "tabler:eye"}
                  height={20}
                />
              </button>
            </div>
          </div>

          <div>
            <Label
              htmlFor="newPasswordConfirmation"
              value="تأكيد كلمة المرور"
              className="mb-2 block"
            />
            <div className="relative">
              <TextInput
                id="newPasswordConfirmation"
                type={showPassword2 ? "text" : "password"}
                {...register("newPasswordConfirmation")}
                disabled={mutation.isPending}
                color={errors.newPasswordConfirmation ? "failure" : undefined}
                aria-invalid={!!errors.newPasswordConfirmation}
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
                onClick={() => setShowPassword2((s) => !s)}
                className="absolute inset-y-0 left-0 flex items-center px-3 text-darklink hover:text-primary disabled:opacity-50"
                aria-label={
                  showPassword2 ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                }
                disabled={mutation.isPending}
              >
                <Icon
                  icon={showPassword2 ? "tabler:eye-off" : "tabler:eye"}
                  height={20}
                />
              </button>
            </div>
          </div>

          <Button
            type="submit"
            color="primary"
            disabled={mutation.isPending}
            className="w-full transition-all duration-300"
          >
            {mutation.isPending ? (
              <span className="inline-flex items-center gap-2">
                <Spinner size="sm" /> جاري التأكيد...
              </span>
            ) : (
              "تحديث كلمة المرور"
            )}
          </Button>
        </form>
        <div className="text-center text-xs text-darklink mt-2">
          <Link href="/login" className="text-primary hover:underline">
            العودة إلى تسجيل الدخول
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ResetConfirmForm;
