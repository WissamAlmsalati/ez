"use client";
import { useParams, useRouter } from "next/navigation";
import BreadcrumbComp from "@widgets/breadcrumb/BreadcrumbComp";
import {
  useCategoryDetail,
  useDeleteCategory,
  useRestoreCategory,
  useUpdateCategory,
} from "@/entities/category/api";
import { useTypesQuery, useToggleType } from "@/entities/product-type/api";
import { Button, Spinner, TextInput, Textarea } from "flowbite-react";
import { toast } from "sonner";
import React from "react";
import { StatusSwitch } from "@/shared/ui/detail/StatusSwitch";
import RetryError from "@/shared/ui/feedback/RetryError";
import ConfirmDeleteModal from "@/shared/ui/detail/ConfirmDeleteModal";
import { ChildrenGrid } from "@/shared/ui/detail/ChildrenGrid";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CreateTypeModal from "@/features/types/create/CreateTypeModal";
import { mapServerFieldErrors } from "@/shared/lib/mapServerFieldErrors";
import CategoryDetailSkeleton from "@/shared/ui/skeleton/CategoryDetailSkeleton";
import CatalogSkeleton from "@/shared/ui/catalog/CatalogSkeleton";
import EmptyState from "@/shared/ui/catalog/EmptyState";
import CatalogGrid from "@/shared/ui/catalog/CatalogGrid";
import CatalogCard from "@/shared/ui/catalog/CatalogCard";
import Pagination from "@/shared/ui/catalog/Pagination";
import { getImageUrl } from "@/shared/lib/getImageUrl";
import Image from "next/image";

export default function CategoryDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const detail = useCategoryDetail(id);
  const update = useUpdateCategory(id);
  const del = useDeleteCategory(id);
  const restore = useRestoreCategory(id);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [createTypeOpen, setCreateTypeOpen] = React.useState(false);
  const [localImage, setLocalImage] = React.useState<string | null>(null);

  // children (types)
  const typesList = useTypesQuery({ category_id: Number(id), per_page: 50 });
  const toggleType = useToggleType();

  const BCrumb = [
    { title: "الأصناف", to: "/categories" },
    { title: "تفاصيل صنف" },
  ];

  const loading = detail.isLoading;
  const loadError = detail.isError || !detail.data;
  const c = detail.data as any | undefined;
  // تطبيع الحالة لدعم is_active أو isActive من الخادم
  const normalizedIsActive: boolean = !!(c?.is_active ?? c?.isActive);

  // نشتق سكيمة تحديث مرنة (كل شيء اختياري) + فحص حجم الصورة
  const updateSchema = z.object({
    name: z.string().min(1, "الاسم مطلوب").optional(),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
    image: z.any().optional(),
  });

  type FormVals = z.infer<typeof updateSchema>;
  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
    setError,
    watch,
  } = useForm<FormVals>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      name: c?.name || "",
      description: c?.description || "",
      is_active: !!c?.is_active,
    },
  });
  const watchedImage = watch("image");
  React.useEffect(() => {
    if (
      watchedImage &&
      watchedImage instanceof FileList &&
      watchedImage.length > 0
    ) {
      const file = watchedImage[0];
      const url = URL.createObjectURL(file);
      setLocalImage(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [watchedImage]);
  React.useEffect(() => {
    if (c?.id)
      reset({
        name: c.name,
        description: c.description || "",
        is_active: !!c.is_active,
      });
  }, [c?.id]);

  async function submitRHF(data: FormVals) {
    const fd = new FormData();
    const df = dirtyFields as Record<string, boolean>;
    const appended: string[] = [];
    Object.keys(df).forEach((key) => {
      if (!df[key]) return;
      const val: any = (data as any)[key];
      if (key === "image") {
        if (val && val instanceof FileList && val.length > 0) {
          fd.append("image", val[0]);
          appended.push("image");
        }
        return;
      }
      if (key === "is_active") {
        if (val !== undefined) {
          // أرسل true/false كنص (backend يعتبره Boolean في multipart)
          fd.append("is_active", val ? "true" : "false");
          appended.push("is_active");
        }
        return;
      }
      if (val !== undefined && val !== null) {
        fd.append(key, typeof val === "string" ? val : String(val));
        appended.push(key);
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
      const fieldErrors = mapServerFieldErrors(e?.body || e?.response?.data);
      Object.entries(fieldErrors).forEach(([f, msg]) => {
        // @ts-ignore dynamic key
        setError(f as any, { message: String(msg) });
      });
      toast.error(e?.body?.message || "فشل الحفظ");
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <BreadcrumbComp
        title={c?.name || (loading ? "تحميل..." : loadError ? "خطأ" : "-")}
        items={BCrumb}
      />
      {loadError && !loading && (
        <RetryError
          message="تعذر تحميل بيانات الصنف"
          onRetry={() => detail.refetch()}
          retrying={detail.isFetching}
        />
      )}
      {loading && !c && <CategoryDetailSkeleton />}
      {!loading && (
        <div className="grid gap-6">
          <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 shadow-sm border">
            <form className="space-y-8" onSubmit={handleSubmit(submitRHF)}>
              <div className="flex flex-col md:grid md:grid-cols-2 md:gap-12 gap-4">
                {/* الحقول في اليسار (مع RTL) تعني ترتيبها بعد الصورة بصرياً لذا نضع الصورة order-1 في DOM ونجبر flex-row-reverse على الشاشات الكبيرة إذا لزم */}
                <div className="text-right md:pl-6 md:order-2">
                  <h3 className="font-semibold text-lg">بيانات الصنف</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    لتعديل بيانات الصنف قم بتحديثها واحفظ من هنا
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12">
                <div className="order-2 md:order-2 space-y-4 w-full md:max-w-sm">
                  {loading ? null : (
                    <>
                      <div className="space-y-1">
                        <label className="block text-sm">اسم الصنف</label>
                        <TextInput
                          disabled={loading}
                          {...register("name")}
                          color={errors.name ? "failure" : undefined}
                        />
                        {errors.name && (
                          <p className="text-xs text-red-600">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm">وصف الصنف</label>
                        <Textarea
                          rows={3}
                          disabled={loading}
                          {...register("description")}
                          className="resize-none"
                        />
                        {errors.description && (
                          <p className="text-xs text-red-600">
                            {errors.description.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm mb-1">خصائص</label>
                        <div className="flex items-center gap-3">
                          <StatusSwitch
                            checked={normalizedIsActive}
                            label={normalizedIsActive ? "نشط" : "غير نشط"}
                            onChange={async (next) => {
                              try {
                                await update.mutateAsync({ is_active: next });
                                toast.success("تم تحديث الحالة");
                              } catch (e: any) {
                                toast.error(
                                  e?.body?.message || "فشل تحديث الحالة"
                                );
                              }
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="order-1 md:order-1 mt-4 md:mt-0 flex flex-col items-center gap-4">
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden ring-1 ring-gray-200 bg-gray-50 flex items-center justify-center">
                    {localImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={localImage}
                        alt={c?.name || "الصورة"}
                        className="object-cover w-full h-full"
                      />
                    ) : getImageUrl(c) ? (
                      <Image
                        src={getImageUrl(c) as string}
                        alt={c?.name || "الصورة"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">لا صورة</span>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <input
                      id="cat_image_input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={loading}
                      {...register("image")}
                    />
                    <Button
                      type="button"
                      size="xs"
                      onClick={() =>
                        document.getElementById("cat_image_input")?.click()
                      }
                      color={"primary"}
                      disabled={loading}
                    >
                      اختر صورة
                    </Button>
                    <p className="text-[10px] text-gray-500">
                      يسمح بالصور jpg / png حتى 200kb
                    </p>
                    {errors.image && (
                      <p className="text-[10px] text-red-600">
                        {errors.image.message as any}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row flex-wrap gap-3 pt-4 sm:justify-end">
                <Button
                  type="button"
                  color="failure"
                  outline
                  onClick={() => setDeleteOpen(true)}
                  disabled={loading}
                >
                  حذف
                </Button>
                {c?.is_deleted && (
                  <Button
                    type="button"
                    color="success"
                    onClick={async () => {
                      try {
                        await restore.mutateAsync();
                        toast.success("تم الاستعادة");
                      } catch (e: any) {
                        toast.error(e?.body?.message || "فشل الاستعادة");
                      }
                    }}
                    disabled={loading}
                  >
                    استعادة
                  </Button>
                )}
                <Button
                  type="button"
                  color="outlineprimary"
                  onClick={() => reset()}
                  disabled={loading}
                >
                  إلغاء التغييرات
                </Button>
                <Button
                  type="submit"
                  isProcessing={update.isPending}
                  disabled={loading}
                  color={"primary"}
                  className="transition-colors duration-300"
                >
                  حفظ التغييرات
                </Button>
              </div>
            </form>
          </div>
          <div className="space-y-4 bg-white rounded-lg p-4 sm:p-6 md:p-8 shadow-sm border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">الأنواع</h3>
              <Button
                size="sm"
                color="primary"
                onClick={() => setCreateTypeOpen(true)}
              >
                إضافة نوع
              </Button>
            </div>
            {/* <ChildrenGrid
              loading={typesList.isLoading}
              items={(typesList.data?.data || []).map((t) => ({
                id: t.id,
                title: t.name,
                image: (t as any).image ?? (t as any).imageUrl,
                active: !!t.is_active,
                footer: t.category?.name,
              }))}
              onToggle={async (childId) => {
                await toggleType.mutateAsync(childId);
              }}
              empty={<span>لا توجد أنواع</span>}
            /> */}
            {typesList.isLoading ? (
              <CatalogSkeleton />
            ) : !typesList || typesList.data?.data.length === 0 ? (
              <EmptyState />
            ) : (
              <CatalogGrid>
                {typesList.data?.data.map((item) => (
                  <CatalogCard
                    key={item.id}
                    title={item.name}
                    image={getImageUrl(item)}
                    active={!!item.is_active}
                    onToggle={async () => {
                      await toggleType.mutateAsync(item.id);
                    }}
                    link={`/types/${item.id}`}
                  />
                ))}
              </CatalogGrid>
            )}
            {typesList.data?.meta && <Pagination meta={typesList.data.meta} />}
          </div>
        </div>
      )}
      <ConfirmDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        isLoading={del.isPending}
        title="حذف الصنف"
        description="سيتم حذف الصنف . هل أنت متأكد؟"
        onConfirm={async () => {
          await del.mutateAsync();
          toast.success("تم الحذف");
          router.push("/categories");
        }}
      />
      <CreateTypeModal
        open={createTypeOpen}
        categoryId={Number(id)}
        onClose={() => {
          setCreateTypeOpen(false);
          typesList.refetch();
        }}
      />
    </div>
  );
}
