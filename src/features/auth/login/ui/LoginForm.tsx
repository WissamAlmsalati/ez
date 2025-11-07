"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, Button, Label, TextInput, Alert, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import { LoginFormValues, loginSchema } from "./model/loginSchema";
import { toast } from "sonner";

const LoginForm = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setServerError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false, // مهم جدًا: لمنع إعادة التوجيه التلقائية والتحكم في الاستجابة يدويًا
        identifier: data.identifier,
        password: data.password,
      });

      if (result?.error) {
        setServerError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      } else if (result?.ok) {
        toast.success("تم تسجيل الدخول بنجاح");
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setServerError("حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.");
    }
  };

  return (
    <div className="w-full flex justify-center items-center min-h-screen px-4 bg-gray-50">
      <Card className="w-full max-w-md shadow-md">
        <div className="mb-2 text-center">
          <h2 className="text-2xl font-semibold text-dark dark:text-white">
            تسجيل الدخول
          </h2>
          <p className="text-sm text-darklink">
            أهلاً بك، الرجاء إدخال بياناتك
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
              {...register("identifier")}
              disabled={isSubmitting}
              color={errors.identifier ? "failure" : undefined}
              aria-invalid={!!errors.identifier}
              helperText={
                errors.identifier ? (
                  <span className="text-xs">{errors.identifier.message}</span>
                ) : undefined
              }
            />
          </div>

          <div>
            <Label
              htmlFor="password"
              value="كلمة المرور"
              className="mb-2 block"
            />
            <div className="relative">
              <TextInput
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                disabled={isSubmitting}
                color={errors.password ? "failure" : undefined}
                aria-invalid={!!errors.password}
                helperText={
                  errors.password ? (
                    <span className="text-xs">{errors.password.message}</span>
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
                disabled={isSubmitting}
              >
                <Icon
                  icon={showPassword ? "tabler:eye-off" : "tabler:eye"}
                  height={20}
                />
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link
              href="/login/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>

          <Button
            type="submit"
            color="primary"
            disabled={isSubmitting}
            className="w-full transition-all duration-300"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Spinner size="sm" /> جاري التحقق...
              </span>
            ) : (
              "تسجيل الدخول"
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-darklink mt-2">
          بدخولك أنت توافق على الشروط والأحكام
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;
