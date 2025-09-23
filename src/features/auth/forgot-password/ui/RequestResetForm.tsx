"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, Button, Label, TextInput, Alert, Spinner } from "flowbite-react";
import {
  requestResetSchema,
  type RequestResetFormValues,
} from "../model/requestSchema";
import { useForgotPasswordStore } from "../model/store";
import { useMutation } from "@tanstack/react-query";
import { requestPasswordReset } from "../api/mutations";
import { toast } from "sonner";

interface Props {
  onSuccess?: () => void;
}

const RequestResetForm = ({ onSuccess }: Props) => {
  const router = useRouter();
  const { setEmail, setExpiresAt } = useForgotPasswordStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestResetFormValues>({
    resolver: zodResolver(requestResetSchema),
  });

  const mutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: (_res, variables) => {
      setEmail(variables.email);
      // Local 30s cooldown regardless of server expiry
      setExpiresAt(new Date(Date.now() + 30 * 1000).toISOString());
      toast.success("تم إرسال رمز التحقق إلى بريدك");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/login/forgot-password/confirm");
      }
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "تعذر إرسال الرمز. حاول مرة أخرى";
      setServerError(message);
    },
  });

  const onSubmit = (values: RequestResetFormValues) => {
    setServerError(null);
    mutation.mutate({ email: values.email });
  };

  return (
    <div className="w-full flex justify-center items-center min-h-screen px-4">
      <Card className="w-full max-w-md shadow-md">
        <div className="mb-2 text-center">
          <h2 className="text-2xl font-semibold text-dark dark:text-white">
            استعادة كلمة المرور
          </h2>
          <p className="text-sm text-darklink">
            أدخل بريدك الإلكتروني لاستلام رمز التحقق
          </p>
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
            <Label
              htmlFor="email"
              value="البريد الإلكتروني"
              className="mb-2 block"
            />
            <TextInput
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register("email")}
              disabled={mutation.isPending}
              color={errors.email ? "failure" : undefined}
              aria-invalid={!!errors.email}
              helperText={
                errors.email ? (
                  <span className="text-xs">{errors.email.message}</span>
                ) : undefined
              }
            />
          </div>

          <Button
            type="submit"
            color="primary"
            disabled={mutation.isPending}
            className="w-full transition-all duration-300"
          >
            {mutation.isPending ? (
              <span className="inline-flex items-center gap-2">
                <Spinner size="sm" /> جاري الإرسال...
              </span>
            ) : (
              "إرسال الرمز"
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

export default RequestResetForm;
