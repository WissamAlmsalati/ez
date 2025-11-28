"use client";
import React from "react";
import {
  Button,
  Modal,
  Select,
  Spinner,
  Table,
  TextInput,
  Checkbox,
} from "flowbite-react";
import {
  useProductUnits,
  useAddProductUnit,
  useUpdateProductUnit,
  useDeleteProductUnit,
} from "@/entities/product/api/units";
import { useUnitsQuery } from "@/entities/unit/api";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import ConfirmDeleteModal from "@/shared/ui/detail/ConfirmDeleteModal";
import { useSessionStore } from "@/entities/session/model/sessionStore";

type ProductPricesProps = {
  productId: string;
};

export default function ProductPrices({ productId }: ProductPricesProps) {
  const isManager = useSessionStore((s) => s.isManager);
  const units = useProductUnits(productId);
  const allUnits = useUnitsQuery();
  const addUnit = useAddProductUnit(productId);
  const [addOpen, setAddOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editRow, setEditRow] = React.useState<any | null>(null);
  const delUnit = useDeleteProductUnit(productId, deleteId ?? 0);
  const updUnit = useUpdateProductUnit(productId, editRow?.id ?? 0);

  const addSchema = z.object({
    unit_id: z.coerce.number().min(1, "اختر الوحدة"),
    price: z.coerce.number().positive("السعر مطلوب"),
    min_qty: z.coerce.number().positive("أقل كمية مطلوبة"),
    step_qty: z.coerce.number().positive("زيادة الكمية مطلوبة"),
  });
  type AddFormVals = z.input<typeof addSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddFormVals>({
    resolver: zodResolver(addSchema),
  });

  async function onSubmit(data: AddFormVals) {
    try {
      const parsed = addSchema.parse(data);
      await addUnit.mutateAsync(parsed);
      toast.success("تمت إضافة السعر");
      setAddOpen(false);
      reset();
      await units.refetch();
    } catch (e: any) {
      toast.error(e?.body?.message || "فشل إضافة السعر");
    }
  }

  const editSchema = z.object({
    price: z.coerce.number().positive("السعر مطلوب"),
    min_qty: z.coerce.number().positive("أقل كمية مطلوبة"),
    step_qty: z.coerce.number().positive("زيادة الكمية مطلوبة"),
    is_default: z.boolean().optional(),
  });
  type EditFormVals = z.input<typeof editSchema>;
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors },
    reset: resetEdit,
    watch: watchEdit,
  } = useForm<EditFormVals>({
    resolver: zodResolver(editSchema),
  });

  React.useEffect(() => {
    if (editRow) {
      const isDefaultFlag =
        (editRow as any).is_default ?? (editRow as any).isDefault ?? false;
      resetEdit({
        price: (editRow as any).price,
        min_qty: (editRow as any).minQty ?? (editRow as any).unit_size,
        step_qty: (editRow as any).stepQty ?? 1,
        is_default: !!isDefaultFlag,
      });
    }
  }, [editRow, resetEdit]);

  async function onEditSubmit(data: EditFormVals) {
    if (!editRow) return;
    try {
      const parsed = editSchema.parse(data);
      await updUnit.mutateAsync(parsed);
      toast.success("تم تحديث السعر");
      setEditOpen(false);
      setEditRow(null);
      await units.refetch();
    } catch (e: any) {
      toast.error(e?.body?.message || "فشل تحديث السعر");
    }
  }

  // Normalize units data to an array to avoid runtime `.map` on non-arrays
  const rows = React.useMemo<any[]>(() => {
    const d: any = units.data as any;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.data)) return d.data;
    if (Array.isArray(d?.items)) return d.items;
    return [];
  }, [units.data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">الأسعار</h3>
        {isManager && (
          <Button size="xs" color="light" onClick={() => setAddOpen(true)}>
            إضافة سعر
          </Button>
        )}
      </div>
      <div
        className="overflow-x-auto -mx-1 sm:mx-0"
        role="region"
        aria-label="آخر طلبات المستخدم (اسحب أفقيًا على الشاشات الصغيرة)"
        tabIndex={0}
      >
        {/** عدد الأعمدة يعتمد على ظهور عمود الإجراءات للمدير */}
        {(() => {
          const colCount = isManager ? 6 : 5;
          return (
            <Table className="table-no-radius rounded-none centered-table white-header min-w-[900px] w-max text-xs sm:text-sm">
              <Table.Head className="border-b border-gray-200 text-xs whitespace-nowrap sticky top-0 bg-white z-10">
                <Table.HeadCell className="whitespace-nowrap">#</Table.HeadCell>
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
                {isManager && (
                  <Table.HeadCell className="whitespace-nowrap"></Table.HeadCell>
                )}
              </Table.Head>
              <Table.Body className="divide-y">
                {units.isLoading && (
                  <Table.Row>
                    <Table.Cell colSpan={colCount} className="text-center">
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
                      colSpan={colCount}
                      className="text-center py-4 text-red-600 text-xs"
                    >
                      فشل تحميل الأسعار
                    </Table.Cell>
                  </Table.Row>
                )}
                {!units.isLoading && !units.isError && rows.length === 0 && (
                  <Table.Row>
                    <Table.Cell
                      colSpan={colCount}
                      className="text-center py-4 text-gray-500 text-xs"
                    >
                      لا توجد أسعار لهذا الصنف
                    </Table.Cell>
                  </Table.Row>
                )}
                {!units.isLoading &&
                  !units.isError &&
                  rows.map((row, idx) => {
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
                        {isManager && (
                          <Table.Cell className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Button
                                size="xs"
                                color="light"
                                onClick={() => {
                                  setEditRow(row);
                                  setEditOpen(true);
                                }}
                              >
                                <span className="inline-flex items-center gap-1">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    className="w-4 h-4"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652l-8.95 8.95a4.5 4.5 0 01-1.897 1.13L7.5 16.5l.319-2.854a4.5 4.5 0 011.13-1.897l7.913-7.262z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M19.5 7.125L16.862 4.487"
                                    />
                                  </svg>
                                </span>
                              </Button>
                              <Button
                                size="xs"
                                color="failure"
                                onClick={() => {
                                  setDeleteId((row as any).id);
                                  setDeleteOpen(true);
                                }}
                              >
                                <span className="inline-flex items-center gap-1">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    className="w-4 h-4"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                    />
                                  </svg>
                                </span>
                              </Button>
                            </div>
                          </Table.Cell>
                        )}
                      </Table.Row>
                    );
                  })}
              </Table.Body>
            </Table>
          );
        })()}
        <div
          className="sm:hidden text-[11px] text-gray-400 mt-2 pr-1"
          aria-hidden="true"
        >
          اسحب أفقيًا لعرض بقية الأعمدة ←→
        </div>
      </div>

      {isManager && (
        <Modal show={addOpen} dismissible onClose={() => setAddOpen(false)}>
          <Modal.Header>إضافة سعر للوحدة</Modal.Header>
          <Modal.Body>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-1">
                <label className="block text-sm">الوحدة</label>
                <Select
                  disabled={allUnits.isLoading}
                  {...register("unit_id")}
                  color={errors.unit_id ? "failure" : undefined}
                >
                  <option value="">اختر الوحدة</option>
                  {(allUnits.data?.data || []).map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </Select>
                {errors.unit_id && (
                  <p className="text-xs text-red-600">
                    {errors.unit_id.message as any}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text_sm">السعر</label>
                  <TextInput
                    type="number"
                    step="0.001"
                    {...register("price")}
                    color={errors.price ? "failure" : undefined}
                  />
                  {errors.price && (
                    <p className="text-xs text-red-600">
                      {errors.price.message as any}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="block text_sm">أقل كمية</label>
                  <TextInput
                    type="number"
                    step="0.001"
                    {...register("min_qty")}
                    color={errors.min_qty ? "failure" : undefined}
                  />
                  {errors.min_qty && (
                    <p className="text-xs text-red-600">
                      {errors.min_qty.message as any}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="block text_sm">زيادة الكمية</label>
                  <TextInput
                    type="number"
                    step="0.001"
                    {...register("step_qty")}
                    color={errors.step_qty ? "failure" : undefined}
                  />
                  {errors.step_qty && (
                    <p className="text-xs text-red-600">
                      {errors.step_qty.message as any}
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
      )}

      {isManager && (
        <Modal show={editOpen} dismissible onClose={() => setEditOpen(false)}>
          <Modal.Header>تعديل سعر الوحدة</Modal.Header>
          <Modal.Body>
            <form
              className="space-y-4"
              onSubmit={handleSubmitEdit(onEditSubmit)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text_sm">السعر</label>
                  <TextInput
                    type="number"
                    step="0.001"
                    {...registerEdit("price")}
                    color={editErrors.price ? "failure" : undefined}
                  />
                  {editErrors.price && (
                    <p className="text-xs text-red-600">
                      {editErrors.price.message as any}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="block text_sm">أقل كمية</label>
                  <TextInput
                    type="number"
                    step="0.001"
                    {...registerEdit("min_qty")}
                    color={editErrors.min_qty ? "failure" : undefined}
                  />
                  {editErrors.min_qty && (
                    <p className="text-xs text-red-600">
                      {editErrors.min_qty.message as any}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="block text_sm">زيادة الكمية</label>
                  <TextInput
                    type="number"
                    step="0.001"
                    {...registerEdit("step_qty")}
                    color={editErrors.step_qty ? "failure" : undefined}
                  />
                  {editErrors.step_qty && (
                    <p className="text-xs text-red-600">
                      {editErrors.step_qty.message as any}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="is_default_unit"
                  {...registerEdit("is_default")}
                />
                <label htmlFor="is_default_unit" className="text-sm">
                  سعر افتراضي
                </label>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  color="gray"
                  onClick={() => setEditOpen(false)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  isProcessing={updUnit.isPending}
                >
                  حفظ
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal>
      )}

      {isManager && (
        <ConfirmDeleteModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          isLoading={delUnit.isPending}
          title="حذف السعر"
          description="سيتم حذف هذا السعر. هل أنت متأكد؟"
          onConfirm={async () => {
            await delUnit.mutateAsync();
            toast.success("تم حذف السعر");
            setDeleteOpen(false);
            setDeleteId(null);
            await units.refetch();
          }}
        />
      )}
    </div>
  );
}
