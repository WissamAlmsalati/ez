"use client";
import { useParams, useRouter } from "next/navigation";
import BreadcrumbComp from "@widgets/breadcrumb/BreadcrumbComp";
import React from "react";
import {
  useTypeDetail,
  useDeleteType,
  useRestoreType,
  useUpdateType,
} from "@/entities/product-type/api";
import { useProductsQueryV2, useToggleProduct } from "@/entities/product/api";
import { Button, TextInput, Textarea } from "flowbite-react";
import { toast } from "sonner";
import { StatusSwitch } from "@/shared/ui/detail/StatusSwitch";
import ConfirmDeleteModal from "@/shared/ui/detail/ConfirmDeleteModal";
import { ChildrenGrid } from "@/shared/ui/detail/ChildrenGrid";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { mapServerFieldErrors } from "@/shared/lib/mapServerFieldErrors";
import RetryError from "@/shared/ui/feedback/RetryError";
import { TypeDetailSkeleton } from "@/shared/ui/skeleton/TypeDetailSkeleton";
import CatalogSkeleton from "@/shared/ui/catalog/CatalogSkeleton";
import EmptyState from "@/shared/ui/catalog/EmptyState";
import CatalogGrid from "@/shared/ui/catalog/CatalogGrid";
import CatalogCard from "@/shared/ui/catalog/CatalogCard";
import Pagination from "@/shared/ui/catalog/Pagination";
import CreateProductModal from "@/features/products/create/CreateProductModal";
import { getImageUrl } from "@/shared/lib/getImageUrl";
import Image from "next/image";

export default function TypeDetailPage() {
  const params = useParams();
  const id = (params as any)?.id as string;
  const router = useRouter();
  const detail = useTypeDetail(id);
  const update = useUpdateType(id);
  const del = useDeleteType(id);
  const restore = useRestoreType(id);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [localImage, setLocalImage] = React.useState<string | null>(null);
  const [createProductOpen, setCreateProductOpen] = React.useState(false);
  const products = useProductsQueryV2({ type_id: Number(id), per_page: 50 });
  const toggleProduct = useToggleProduct();
  const BCrumb = [{ title: "الأنواع", to: "/types" }, { title: "تفاصيل نوع" }];

  const loading = detail.isLoading;
  const loadError = detail.isError || !detail.data;
  const t = detail.data as any | undefined;
  // دعم is_active أو isActive من الـ API
  const normalizedIsActive = !!(t?.is_active ?? t?.isActive);

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
      name: t?.name || "",
      description: t?.description || "",
      is_active: !!t?.is_active,
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
    if (t?.id)
      reset({
        name: t.name,
        description: t.description || "",
        is_active: !!t.is_active,
      });
  }, [t?.id, reset]);

  async function submitForm(data: FormVals) {
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
    // fd.append("_method", "PUT");
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
        title={t?.name || (loading ? "تحميل..." : loadError ? "خطأ" : "-")}
        items={BCrumb}
      />
      {loadError && !loading && (
        <RetryError
          message="تعذر تحميل بيانات النوع"
          onRetry={() => detail.refetch()}
          retrying={detail.isFetching}
        />
      )}
      {loading && !t && <TypeDetailSkeleton />}
      {!loading && (
        <div className="grid gap-6">
          <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 shadow-sm border">
            <form className="space-y-8" onSubmit={handleSubmit(submitForm)}>
              <div className="flex flex-col md:grid md:grid-cols-2 md:gap-12 gap-4">
                <div className="text-right md:pl-6 md:order-2">
                  <h3 className="font-semibold text-lg">بيانات النوع</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    لتعديل بيانات النوع قم بتحديثها واحفظ من هنا
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12">
                <div className="order-2 md:order-2 space-y-4 w-full md:max-w-sm">
                  {loading ? null : (
                    <>
                      <div className="space-y-1">
                        <label className="block text-sm">اسم النوع</label>
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
                        <label className="block text-sm">وصف النوع</label>
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
                        alt={t?.name || "الصورة"}
                        className="object-cover w-full h-full"
                      />
                    ) : getImageUrl(t) ? (
                      <Image
                        src={getImageUrl(t) as string}
                        alt={t?.name || "الصورة"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">لا صورة</span>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <input
                      id="type_image_input"
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
                        document.getElementById("type_image_input")?.click()
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
                {t?.is_deleted && (
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
              <h3 className="font-semibold text-base">المنتجات التابعة</h3>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  color="primary"
                  onClick={() => setCreateProductOpen(true)}
                >
                  إضافة منتج
                </Button>
              </div>
            </div>
            {products.isLoading ? (
              <CatalogSkeleton />
            ) : !products || products.data?.data.length === 0 ? (
              <EmptyState />
            ) : (
              <CatalogGrid>
                {products.data?.data.map((item) => (
                  <CatalogCard
                    key={item.id}
                    title={item.name}
                    image={getImageUrl(item)}
                    active={!!item.is_active}
                    onToggle={async () => {
                      await toggleProduct.mutateAsync(item.id);
                    }}
                    link={`/products/${item.id}`}
                  />
                ))}
              </CatalogGrid>
            )}
            {products.data?.meta && <Pagination meta={products.data.meta} />}
          </div>
        </div>
      )}
      <ConfirmDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        isLoading={del.isPending}
        title="حذف النوع"
        description="سيتم حذف النوع. هل أنت متأكد؟"
        onConfirm={async () => {
          await del.mutateAsync();
          toast.success("تم الحذف");
          router.push("/types");
        }}
      />
      <CreateProductModal
        open={createProductOpen}
        typeId={Number(id)}
        onClose={() => {
          setCreateProductOpen(false);
          products.refetch();
        }}
      />
    </div>
  );
}
