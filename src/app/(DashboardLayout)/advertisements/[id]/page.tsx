"use client";
import { useParams, useRouter } from "next/navigation";
import BreadcrumbComp from "@/widgets/breadcrumb/BreadcrumbComp";
import {
  useAdvertisementDetail,
  useUpdateAdvertisement,
  useDeleteAdvertisement,
  useRestoreAdvertisement,
  useToggleAdvertisement,
} from "@/entities/advertisement/api";
import { Button, TextInput, Textarea, Spinner } from "flowbite-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { StatusSwitch } from "@/shared/ui/detail/StatusSwitch";
import ConfirmDeleteModal from "@/shared/ui/detail/ConfirmDeleteModal";
import AdvertisementDetailSkeleton from "@/entities/advertisement/ui/AdvertisementDetailSkeleton";

const schema = z
  .object({
    title: z.string().min(1, "العنوان مطلوب").optional(),
    description: z.string().optional(),
    starts_at: z.string().optional(),
    ends_at: z.string().optional(),
    is_active: z.boolean().optional(),
    image: z.any().optional(),
  })
  .superRefine((vals, ctx) => {
    const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
    if (vals.starts_at && vals.starts_at < todayStr) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "لا يمكن أن يكون تاريخ البدء قبل التاريخ الحالي",
        path: ["starts_at"],
      });
    }
    if (vals.starts_at && vals.ends_at && vals.ends_at < vals.starts_at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "لا يمكن أن يكون تاريخ الانتهاء قبل تاريخ البدء",
        path: ["ends_at"],
      });
    }
  });
type FormVals = z.infer<typeof schema>;

export default function AdvertisementDetailPage() {
  const params = useParams();
  const id = (params as any)?.id as string;
  const router = useRouter();
  const detail = useAdvertisementDetail(id);
  const update = useUpdateAdvertisement(id);
  const del = useDeleteAdvertisement(id);
  const restore = useRestoreAdvertisement(id);
  const toggle = useToggleAdvertisement(id);
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const adv: any = detail.data;
  const loading = detail.isLoading;
  const deleted = (adv as any)?.is_deleted; // إذا backend يدعم هذا العلم
  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
    watch,
  } = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: adv?.name || adv?.title || "",
      description: adv?.description || "",
      starts_at: adv?.starts_at ? String(adv.starts_at).split(" ")[0] : "",
      ends_at: adv?.ends_at ? String(adv.ends_at).split(" ")[0] : "",
      is_active: !!adv?.is_active,
    },
  });
  const watchedImage = watch("image");
  const watchedStart = watch("starts_at");
  const todayStr = useMemo(() => new Date().toLocaleDateString("en-CA"), []);
  useEffect(() => {
    if (
      watchedImage &&
      watchedImage instanceof FileList &&
      watchedImage.length
    ) {
      const f = watchedImage[0];
      const url = URL.createObjectURL(f);
      setLocalImage(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [watchedImage]);
  useEffect(() => {
    if (adv?.id) {
      reset({
        title: adv?.name || adv?.title || "",
        description: adv?.description || "",
        starts_at: adv?.starts_at ? String(adv.starts_at).split(" ")[0] : "",
        ends_at: adv?.ends_at ? String(adv.ends_at).split(" ")[0] : "",
        is_active: !!adv?.is_active,
      });
    }
  }, [adv?.id, reset]);

  async function onSubmit(data: FormVals) {
    const df = dirtyFields as Record<string, boolean>;
    const fd = new FormData();
    const appended: string[] = [];
    Object.keys(df).forEach((k) => {
      if (!df[k]) return;
      const val: any = (data as any)[k];
      if (k === "image") {
        if (val && val instanceof FileList && val.length > 0) {
          fd.append("image", val[0]);
          appended.push("image");
        }
        return;
      }
      if (k === "is_active") {
        fd.append("is_active", val ? "true" : "false");
        appended.push("is_active");
        return;
      }
      if (val !== undefined && val !== null) {
        fd.append(k, String(val));
        appended.push(k);
      }
    });
    if (appended.length === 0) {
      toast.info("لا توجد تغييرات");
      return;
    }
    try {
      await update.mutateAsync(fd);
      toast.success("تم الحفظ");
    } catch (e: any) {
      toast.error(e?.body?.message || "فشل الحفظ");
    }
  }

  async function handleDelete() {
    try {
      await del.mutateAsync();
      toast.success("تم الحذف");
      router.push("/advertisements");
    } catch (e: any) {
      toast.error(e?.body?.message || "فشل الحذف");
      throw e; // ليظهر الخطأ داخل المودال أيضاً
    }
  }
  async function handleRestore() {
    try {
      await restore.mutateAsync();
      toast.success("تم الاسترجاع");
    } catch (e: any) {
      toast.error(e?.body?.message || "فشل الاسترجاع");
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <BreadcrumbComp
        title={adv?.name || adv?.title || (loading ? "تحميل..." : "-")}
        items={[
          { title: "الإعلانات", to: "/advertisements" },
          { title: adv?.name || adv?.title || "تفاصيل إعلان" },
        ]}
      />
      {loading && !adv && <AdvertisementDetailSkeleton />}
      {adv && (
        <div className="grid gap-6">
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
            <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
              {/* Header side description */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                <div className="md:order-2 md:text-right md:pl-6 max-w-sm">
                  <h3 className="font-semibold text-lg mb-1">بيانات الإعلان</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    لتعديل بيانات الإعلان قم بتحديثها وحفظها من هنا
                  </p>
                </div>
              </div>
              {/* Fields then image below */}
              <div className="space-y-8">
                <div className="space-y-5">
                  <div className="space-y-1">
                    <label className="block text-sm">عنوان الإعلان</label>
                    <TextInput
                      {...register("title")}
                      disabled={update.isPending}
                      color={errors.title ? "failure" : undefined}
                    />
                    {errors.title && (
                      <p className="text-xs text-red-600">
                        {errors.title.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm">الوصف</label>
                    <Textarea
                      rows={3}
                      {...register("description")}
                      disabled={update.isPending}
                      className="resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm">تاريخ البدء</label>
                      <TextInput
                        type="date"
                        min={todayStr}
                        disabled={update.isPending}
                        {...register("starts_at")}
                        color={errors.starts_at ? "failure" : undefined}
                      />
                      {errors.starts_at && (
                        <p className="text-xs text-red-600">
                          {errors.starts_at.message as any}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm">تاريخ الإنتهاء</label>
                      <TextInput
                        type="date"
                        min={watchedStart || todayStr}
                        disabled={update.isPending}
                        {...register("ends_at")}
                        color={errors.ends_at ? "failure" : undefined}
                      />
                      {errors.ends_at && (
                        <p className="text-xs text-red-600">
                          {errors.ends_at.message as any}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <label className="block text-sm mb-1">الحالة</label>
                    <StatusSwitch
                      checked={!!adv.is_active}
                      label={adv.is_active ? "نشط" : "غير نشط"}
                      onChange={async () => {
                        try {
                          await toggle.mutateAsync();
                          toast.success("تم تحديث الحالة");
                        } catch (e: any) {
                          toast.error(e?.body?.message || "فشل التحديث");
                        }
                      }}
                    />
                  </div>
                </div>
                {/* Image section below fields */}
                <div className="flex flex-col gap-4">
                  <div className="rounded-xl overflow-hidden ring-1 ring-dashed ring-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center aspect-[16/6] relative">
                    {localImage || adv?.image ? (
                      <Image
                        src={localImage || adv.image}
                        alt={adv?.title || adv?.name || "إعلان"}
                        width={1200}
                        height={400}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center px-4 select-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="w-10 h-10 mb-2 text-gray-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12.75M3.75 3h16.5M3.75 3L6 5.25M20.25 3v11.25c0 .414-.336.75-.75.75H6m0 0l3.26-3.26a.75.75 0 011.06 0L15 15m-9 1.5a1.5 1.5 0 103 0m9 0a1.5 1.5 0 11-3 0"
                          />
                        </svg>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          لا توجد صورة حالية
                        </p>
                        <p className="text-[10px] text-gray-400">
                          يمكنك إضافة صورة عبر زر اختيار الصورة بالأسفل
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Button
                      type="button"
                      size="xs"
                      color="light"
                      onClick={() =>
                        document.getElementById("adv-image-input")?.click()
                      }
                      className="mt-2"
                    >
                      اختيار الصورة
                    </Button>
                    <input
                      id="adv-image-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      {...register("image")}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-3 pt-2 md:justify-end">
                {!deleted && (
                  <Button
                    color="failure"
                    type="button"
                    onClick={() => setDeleteOpen(true)}
                    disabled={del.isPending}
                    className="min-w-[110px]"
                  >
                    {del.isPending ? <Spinner size="sm" /> : "حذف الإعلان"}
                  </Button>
                )}
                {deleted && (
                  <Button
                    color="warning"
                    type="button"
                    onClick={handleRestore}
                    disabled={restore.isPending}
                    className="min-w-[110px]"
                  >
                    {restore.isPending ? <Spinner size="sm" /> : "استرجاع"}
                  </Button>
                )}
                <Button
                  type="submit"
                  color="primary"
                  disabled={update.isPending}
                  className="min-w-[130px]"
                >
                  {update.isPending ? (
                    <span className="flex items-center gap-1">
                      <Spinner size="xs" /> حفظ التغييرات
                    </span>
                  ) : (
                    "حفظ التغييرات"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        isLoading={del.isPending}
        title="تأكيد حذف الإعلان"
        description="هل أنت متأكد أنك تريد حذف هذا الإعلان؟"
        onConfirm={handleDelete}
      />
    </div>
  );
}
