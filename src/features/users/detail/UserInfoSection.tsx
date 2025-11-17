"use client";
import { Button, Select, TextInput, Modal } from "flowbite-react";
import { CardBox } from "@/shared/ui/cards";
import {
  useUpdateUser,
  useDeleteUser,
  useRestoreUser,
} from "@/entities/user/api";
import type { User } from "@/entities/user/types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { mapServerFieldErrors } from "@/shared/lib/mapServerFieldErrors";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCategoriesQuery } from "@/entities/category/api";
import { useSessionStore } from "@/entities/session/model/sessionStore";

const schema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  email: z
    .string()
    .email("بريد غير صالح")
    .or(z.literal(""))
    .nullable()
    .optional(),
  phone: z
    .string()
    .min(6, "رقم غير صالح")
    .or(z.literal(""))
    .nullable()
    .optional(),
  category_id: z.union([z.string(), z.number()]).nullable().optional(),
  is_active: z.boolean().optional(),
});
type FormVals = z.infer<typeof schema>;

export default function UserInfoSection({ user }: { user: User }) {
  const isManager = useSessionStore((s) => s.isManager);
  const update = useUpdateUser(user.id);
  const delUser = useDeleteUser(user.id);
  const restoreUser = useRestoreUser(user.id);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();
  const {
    data: catsData,
    isLoading: catsLoading,
    isError: catsError,
  } = useCategoriesQuery({ per_page: 100 });
  const categories = catsData?.data ?? [];

  const defaultValues: FormVals = useMemo(
    () => ({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      category_id: user.department?.id ? String(user.department.id) : "",
      is_active: !!user.is_active,
    }),
    [user]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
    setError,
    setValue,
    getValues,
  } = useForm<FormVals>({
    resolver: zodResolver(schema) as any,
    defaultValues,
  });

  // Sync when user changes
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  // After departments load, ensure the select shows the user's department on refresh
  useEffect(() => {
    if (user.role !== "employee") return;
    if (catsLoading || catsError) return;
    const target = user.department?.id ? String(user.department.id) : "";
    const current = getValues("category_id") as any;
    if (!current && target) {
      setValue("category_id", target, {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }, [
    catsLoading,
    catsError,
    user.role,
    user.department?.id,
    getValues,
    setValue,
  ]);

  // no-op: can watch is_active if needed

  const onSubmit = async (values: FormVals) => {
    // build JSON patch from dirtyFields
    const payload: Partial<User> = {};
    Object.entries(dirtyFields).forEach(([k, dirty]) => {
      if (!dirty) return;
      const v = (values as any)[k];
      if (k === "category_id") {
        // value from select is string or ""; convert to number|null for API
        (payload as any).category_id = v === "" || v == null ? null : Number(v);
      } else if (k === "email" || k === "phone") {
        (payload as any)[k] = v || null;
      } else {
        (payload as any)[k] = v;
      }
    });
    if (Object.keys(payload).length === 0) {
      toast.info("لا توجد تغييرات");
      return;
    }
    try {
      await update.mutateAsync(payload);
      toast.success("تم الحفظ");
    } catch (e: any) {
      const fe = mapServerFieldErrors(e?.body || e?.response?.data);
      Object.entries(fe).forEach(([f, msg]) =>
        setError(f as any, { message: String(msg) })
      );
      toast.error(e?.body?.message || "فشل الحفظ");
    }
  };

  return (
    <CardBox className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">تفاصيل المستخدم</h3>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="space-y-2">
          <label className="block text-sm">اسم المستخدم</label>
          <TextInput
            disabled={!isManager}
            {...register("name")}
            color={errors.name ? "failure" : undefined}
          />
          {errors.name && (
            <p className="text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm">البريد الإلكتروني</label>
          <TextInput
            disabled={!isManager}
            {...register("email")}
            color={errors.email ? "failure" : undefined}
          />
          {errors.email && (
            <p className="text-xs text-red-600">
              {errors.email.message as any}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm">رقم الهاتف</label>
          <TextInput
            disabled={!isManager}
            {...register("phone")}
            color={errors.phone ? "failure" : undefined}
          />
          {errors.phone && (
            <p className="text-xs text-red-600">
              {errors.phone.message as any}
            </p>
          )}
        </div>

        {isManager && (
          <>
            <div className="space-y-2">
              <label className="block text-sm">حالة الحساب</label>
              <Select
                disabled={!isManager}
                {...register("is_active", {
                  setValueAs: (v) => v === "true" || v === "1",
                })}
              >
                <option value="true">نشط</option>
                <option value="false">غير نشط</option>
              </Select>
            </div>

            {user.role === "employee" && (
              <div className="space-y-2">
                <label className="block text-sm">القسم</label>
                <Select
                  disabled={!isManager || catsLoading || catsError}
                  {...register("category_id")}
                >
                  <option value="">
                    {catsLoading
                      ? "جاري التحميل..."
                      : catsError
                      ? "فشل التحميل"
                      : "اختر قسماً"}
                  </option>
                  {!catsLoading &&
                    !catsError &&
                    categories.map((d) => (
                      <option key={d.id} value={String(d.id)}>
                        {d.name}
                      </option>
                    ))}
                </Select>
                {errors.category_id && (
                  <p className="text-xs text-red-600">
                    {errors.category_id.message as any}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        <div className="md:col-span-2 pt-2 flex gap-3 justify-end">
          {isManager && (
            <Button
              color="failure"
              onClick={() => setShowDeleteConfirm(true)}
              size="sm"
            >
              حذف
            </Button>
          )}
          <Button
            type="button"
            color="outlineprimary"
            onClick={() => reset(defaultValues)}
            disabled={!isManager}
          >
            إلغاء التغييرات
          </Button>
          <Button
            type="submit"
            color="dark"
            disabled={!isManager}
            isProcessing={update.isPending}
          >
            حفظ التغييرات
          </Button>
        </div>
        <Modal
          show={showDeleteConfirm}
          size="md"
          popup
          onClose={() =>
            delUser.isPending ? null : setShowDeleteConfirm(false)
          }
        >
          <Modal.Header />
          <Modal.Body>
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                هل أنت متأكد أنك تريد حذف هذا المستخدم؟ لا يمكن التراجع عن هذا
                الإجراء.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  color="gray"
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={delUser.isPending}
                >
                  إلغاء
                </Button>
                <Button
                  color="failure"
                  type="button"
                  isProcessing={delUser.isPending}
                  onClick={() =>
                    delUser
                      .mutateAsync()
                      .then(() => {
                        toast.success("تم حذف المستخدم");
                        setShowDeleteConfirm(false);
                        router.push("/users");
                      })
                      .catch((e: any) =>
                        toast.error(e?.body?.message || "فشل حذف المستخدم")
                      )
                  }
                  disabled={!isManager}
                >
                  تأكيد الحذف
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </form>
    </CardBox>
  );
}
