"use client";
import { useParams, useRouter } from "next/navigation";
import BreadcrumbComp from "@/widgets/breadcrumb/BreadcrumbComp";
import React from "react";
import { useSessionStore } from "@/entities/session/model/sessionStore";
import {
  useProductDetail,
  useDeleteProduct,
  useRestoreProduct,
  useUpdateProduct,
  useToggleFeaturedProduct,
  useToggleProduct,
} from "@/entities/product/api";
import type { ProductDetails } from "@/entities/product/types";
import {
  Button,
  Spinner,
  Table,
  TextInput,
  Textarea,
  Modal,
  Select,
} from "flowbite-react";
import { toast } from "sonner";
import { StatusSwitch } from "@/shared/ui/detail/StatusSwitch";
import ConfirmDeleteModal from "@/shared/ui/detail/ConfirmDeleteModal";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { mapServerFieldErrors } from "@/shared/lib/mapServerFieldErrors";
import RetryError from "@/shared/ui/feedback/RetryError";
import { ProductDetailSkeleton } from "@/shared/ui/skeleton/ProductDetailSkeleton";
import { getImageUrl } from "@/shared/lib/getImageUrl";
import Image from "next/image";
import { CardBox } from "@/shared/ui/cards";
import { useProductUnits } from "@/entities/product/api/units";
import { useUnitsQuery } from "@/entities/unit/api";
import { useAddProductUnit } from "@/entities/product/api/units";

export default function ProductDetailPage() {
  const params = useParams();
  const id = (params as any)?.id as string;
  const router = useRouter();
  const isManager = useSessionStore((s) => s.isManager);
  const canEdit = isManager; // الموظف يشاهد فقط
  const detail = useProductDetail(id);
  const update = useUpdateProduct(id);
  const del = useDeleteProduct(id);
  const restore = useRestoreProduct(id);
  const toggleFeatured = useToggleFeaturedProduct(id);
  const toggleProduct = useToggleProduct();
  const units = useProductUnits(id);
  const allUnits = useUnitsQuery();
  const addUnit = useAddProductUnit(id);
  const [addOpen, setAddOpen] = React.useState(false);
  const addSchema = z.object({
    unit_id: z.coerce.number().min(1, "اختر الوحدة"),
    price: z.coerce.number().positive("السعر مطلوب"),
    min_qty: z.coerce.number().positive("أقل كمية مطلوبة"),
    step_qty: z.coerce.number().positive("زيادة الكمية مطلوبة"),
    is_default: z.boolean().optional(),
  });
  // Use Zod input type for RHF to avoid resolver type mismatch
  type AddFormVals = z.input<typeof addSchema>;
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    formState: { errors: addErrors },
    reset: resetAdd,
  } = useForm<AddFormVals>({
    resolver: zodResolver(addSchema),
    defaultValues: { is_default: false },
  });
  async function onSubmitAdd(data: AddFormVals) {
    try {
      const parsed = addSchema.parse(data);
      await addUnit.mutateAsync(parsed);
      toast.success("تمت إضافة السعر");
      setAddOpen(false);
      resetAdd();
      await units.refetch();
    } catch (e: any) {
      toast.error(e?.body?.message || "فشل إضافة السعر");
    }
  }
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [localImage, setLocalImage] = React.useState<string | null>(null);
  const BCrumb = [
    { title: "الأصناف", to: "/products" },
    { title: detail.data?.name || "تفاصيل الصنف" },
  ];
  const loading = detail.isLoading;
  const loadError = detail.isError || !detail.data;
  const p = detail.data as ProductDetails | undefined;
  // دعم is_active أو isActive من الـ API
  const normalizedIsActive = !!(p?.is_active ?? (p as any)?.isActive);
  // دعم is_featured أو isFeatured
  const normalizedIsFeatured = !!(p?.is_featured ?? (p as any)?.isFeatured);
  const normalizedIsDeleted = !!(p as any)?.is_deleted;

  const updateSchema = z.object({
    name: z.string().min(1, "الاسم مطلوب").optional(),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
    is_featured: z.boolean().optional(),
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
      name: p?.name || "",
      description: p?.description || "",
      is_active: !!p?.is_active,
      is_featured: !!p?.is_featured,
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
    if (p?.id) {
      reset({
        name: p.name,
        description: p.description || "",
        is_active: !!p.is_active,
        is_featured: !!p.is_featured,
      });
    }
  }, [p?.id, reset]);

  async function submitForm(data: FormVals) {
    if (!canEdit) {
      toast.error("ليست لديك صلاحية التعديل");
      return;
    }
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
      if (key === "is_active" || key === "is_featured") {
        if (val !== undefined) {
          fd.append(key, val ? "true" : "false");
          appended.push(key);
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
      const fe = mapServerFieldErrors(e?.body || e?.response?.data);
      if (Array.isArray(fe) && fe.length) {
        (fe as Array<{ field: string; message: string }>).forEach((f) => {
          // @ts-ignore dynamic key
          setError(f.field as any, { message: f.message });
        });
      } else if (fe && typeof fe === "object") {
        Object.entries(fe).forEach(([f, msg]) => {
          // @ts-ignore dynamic key
          setError(f as any, { message: String(msg) });
        });
      }
      toast.error(e?.body?.message || "فشل الحفظ");
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <BreadcrumbComp
        title={p?.name || (loading ? "تحميل..." : loadError ? "خطأ" : "-")}
        items={BCrumb}
      />
      {loadError && !loading && (
        <RetryError
          message="تعذر تحميل بيانات الصنف"
          onRetry={() => detail.refetch()}
          retrying={detail.isFetching}
        />
      )}
      {loading && !p && <ProductDetailSkeleton />}
      {!loading && (
        <div className="grid gap-6">
          <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 shadow-sm border">
            <form className="space-y-8" onSubmit={handleSubmit(submitForm)}>
              <div className="flex flex-col md:grid md:grid-cols-2 md:gap-12 gap-4">
                <div className="text-right md:pl-6 md:order-2">
                  <h3 className="font-semibold text-lg">بيانات الصنف</h3>
                  {canEdit && (
                    <p className="mt-1 text-xs text-gray-500">
                      لتعديل بيانات الصنف قم بتحديثها واحفظ من هنا
                    </p>
                  )}
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
                          readOnly={!canEdit}
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
                          readOnly={!canEdit}
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
                        <div className="flex gap-6">
                          {/* سويتش الحالة */}
                          <div className="flex items-center gap-3">
                            <StatusSwitch
                              checked={normalizedIsActive}
                              label={normalizedIsActive ? "نشط" : "غير نشط"}
                              onChange={async (next) => {
                                if (!canEdit) return;
                                if (toggleProduct.isPending) return;
                                try {
                                  await toggleProduct.mutateAsync(id);
                                  await detail.refetch();
                                  toast.success("تم تحديث الحالة");
                                } catch (e: any) {
                                  toast.error(
                                    e?.body?.message || "فشل تحديث الحالة"
                                  );
                                }
                              }}
                            />
                          </div>
                          {/* سويتش التمييز */}
                          <div className="flex items-center gap-3">
                            <StatusSwitch
                              checked={normalizedIsFeatured}
                              label={normalizedIsFeatured ? "مميز" : "غير مميز"}
                              onChange={async (next) => {
                                if (!canEdit) return;
                                if (loading || toggleFeatured.isPending) return;
                                if (next === normalizedIsFeatured) return;
                                try {
                                  await toggleFeatured.mutateAsync();
                                  toast.success("تم تحديث التمييز");
                                } catch (e: any) {
                                  toast.error(
                                    e?.body?.message || "فشل تحديث التمييز"
                                  );
                                }
                              }}
                            />
                          </div>
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
                        alt={p?.name || "الصورة"}
                        className="object-cover w-full h-full"
                      />
                    ) : getImageUrl(p) ? (
                      <Image
                        src={getImageUrl(p) as string}
                        alt={p?.name || "الصورة"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">لا صورة</span>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <input
                      id="product_image_input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={loading || !canEdit}
                      {...register("image")}
                    />
                    {canEdit && (
                      <>
                        <Button
                          type="button"
                          size="xs"
                          onClick={() =>
                            document
                              .getElementById("product_image_input")
                              ?.click()
                          }
                          color={"primary"}
                          disabled={loading || !canEdit}
                        >
                          اختر صورة
                        </Button>
                        <p className="text-[10px] text-gray-500">
                          يسمح بالصور jpg / png حتى 200kb
                        </p>
                      </>
                    )}
                    {errors.image && (
                      <p className="text-[10px] text-red-600">
                        {errors.image.message as any}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row flex-wrap gap-3 pt-4 sm:justify-end">
                {canEdit && (
                  <>
                    <Button
                      type="button"
                      color="failure"
                      outline
                      onClick={() => setDeleteOpen(true)}
                      disabled={loading}
                    >
                      حذف
                    </Button>
                    {normalizedIsDeleted && (
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
                  </>
                )}
              </div>
            </form>
          </div>
          <CardBox className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">الأسعار</h3>
              <Button size="xs" color="light" onClick={() => setAddOpen(true)}>
                إضافة سعر
              </Button>
            </div>
            {/* Responsive scroll wrapper matching main orders table */}
            <div
              className="overflow-x-auto -mx-1 sm:mx-0"
              role="region"
              aria-label="آخر طلبات المستخدم (اسحب أفقيًا على الشاشات الصغيرة)"
              tabIndex={0}
            >
              <Table className="table-no-radius rounded-none centered-table white-header min-w-[900px] w-max text-xs sm:text-sm">
                <Table.Head className="border-b border-gray-200 text-xs whitespace-nowrap sticky top-0 bg-white z-10">
                  <Table.HeadCell className="whitespace-nowrap">
                    #
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    الوحدة
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    السعر
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    أقل كمية
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    زيادة الكمية
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap"></Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {units.isLoading && (
                    <Table.Row>
                      <Table.Cell colSpan={5} className="text-center">
                        <div className="flex items-center justify-center gap-2 py-4">
                          <Spinner size="sm" />
                          <span className="text-xs text-gray-500">
                            جاري التحميل...
                          </span>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  )}
                  {!units.isLoading && units.isError && (
                    <Table.Row>
                      <Table.Cell
                        colSpan={5}
                        className="text-center py-4 text-red-600 text-xs"
                      >
                        فشل تحميل الأسعار
                      </Table.Cell>
                    </Table.Row>
                  )}
                  {!units.isLoading &&
                    !units.isError &&
                    (!units.data || units.data.length === 0) && (
                      <Table.Row>
                        <Table.Cell
                          colSpan={5}
                          className="text-center py-4 text-gray-500 text-xs"
                        >
                          لا توجد أسعار لهذا الصنف
                        </Table.Cell>
                      </Table.Row>
                    )}
                  {!units.isLoading &&
                    !units.isError &&
                    units.data?.map((row, idx) => {
                      const unitName =
                        (row as any).unit?.name ?? `#${(row as any).unit_id}`;
                      const price =
                        (row as any).formattedPrice ?? (row as any).price;
                      const minQty =
                        (row as any).minQty ?? (row as any).unit_size ?? "-";
                      const stepQty = (row as any).stepQty ?? "-";
                      return (
                        <Table.Row key={(row as any).id} className="bg-white">
                          <Table.Cell className="whitespace-nowrap">
                            {idx + 1}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap">
                            {unitName}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap">
                            {price}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap">
                            {minQty}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap">
                            {stepQty}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap"></Table.Cell>
                        </Table.Row>
                      );
                    })}
                </Table.Body>
              </Table>
              {/* Scroll hint for mobile */}
              <div
                className="sm:hidden text-[11px] text-gray-400 mt-2 pr-1"
                aria-hidden="true"
              >
                اسحب أفقيًا لعرض بقية الأعمدة ←→
              </div>
            </div>
          </CardBox>
          <Modal show={addOpen} dismissible onClose={() => setAddOpen(false)}>
            <Modal.Header>إضافة سعر للوحدة</Modal.Header>
            <Modal.Body>
              <form
                className="space-y-4"
                onSubmit={handleSubmitAdd(onSubmitAdd)}
              >
                <div className="space-y-1">
                  <label className="block text-sm">الوحدة</label>
                  <Select
                    disabled={allUnits.isLoading}
                    {...registerAdd("unit_id")}
                    color={addErrors.unit_id ? "failure" : undefined}
                  >
                    <option value="">اختر الوحدة</option>
                    {(allUnits.data?.data || []).map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </Select>
                  {addErrors.unit_id && (
                    <p className="text-xs text-red-600">
                      {addErrors.unit_id.message as any}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-sm">السعر</label>
                    <TextInput
                      type="number"
                      step="0.001"
                      {...registerAdd("price")}
                      color={addErrors.price ? "failure" : undefined}
                    />
                    {addErrors.price && (
                      <p className="text-xs text-red-600">
                        {addErrors.price.message as any}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm">أقل كمية</label>
                    <TextInput
                      type="number"
                      step="0.001"
                      {...registerAdd("min_qty")}
                      color={addErrors.min_qty ? "failure" : undefined}
                    />
                    {addErrors.min_qty && (
                      <p className="text-xs text-red-600">
                        {addErrors.min_qty.message as any}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm">زيادة الكمية</label>
                    <TextInput
                      type="number"
                      step="0.001"
                      {...registerAdd("step_qty")}
                      color={addErrors.step_qty ? "failure" : undefined}
                    />
                    {addErrors.step_qty && (
                      <p className="text-xs text-red-600">
                        {addErrors.step_qty.message as any}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    color="gray"
                    onClick={() => setAddOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    isProcessing={addUnit.isPending}
                  >
                    حفظ
                  </Button>
                </div>
              </form>
            </Modal.Body>
          </Modal>
        </div>
      )}
      {canEdit && (
        <ConfirmDeleteModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          isLoading={del.isPending}
          title="حذف الصنف"
          description="سيتم حذف الصنف. هل أنت متأكد؟"
          onConfirm={async () => {
            try {
              await del.mutateAsync();
              toast.success("تم الحذف");
              router.push("/products");
            } catch (e: any) {
              toast.error(e?.body?.message || "فشل الحذف");
            }
          }}
        />
      )}
    </div>
  );
}
