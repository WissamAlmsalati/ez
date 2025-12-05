"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productUnitSchema, type ProductUnitFormValues } from "./schema";
import { Button, Modal, Table, Spinner } from "flowbite-react";
import {
  useAddProductUnit,
  useDeleteProductUnit,
  useUpdateProductUnit,
} from "@/entities/product/api/units";
import type { ProductDetails, ProductUnit } from "@/entities/product/types";
import { toast } from "sonner";
import { useUnitsQuery } from "@/entities/unit/api";

interface Props {
  product: ProductDetails;
}

const ProductUnitsEditor: React.FC<Props> = ({ product }) => {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ProductUnit | null>(null);

  const addMut = useAddProductUnit(product.id);
  const updateMut = useUpdateProductUnit(product.id, editing?.id || 0);

  const unitsList = useUnitsQuery({ page: 1, per_page: 100 });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ProductUnitFormValues>({
    resolver: zodResolver(productUnitSchema),
    defaultValues: {
      unit_id: undefined as any,
      unit_size: 1,
      price: 0,
      is_active: true,
    },
  });

  function startAdd() {
    setEditing(null);
    reset({
      unit_id: undefined as any,
      unit_size: 1,
      price: 0,
      is_active: true,
    });
    setOpen(true);
  }
  function startEdit(u: ProductUnit) {
    setEditing(u);
    reset({
      unit_id: u.unit_id,
      unit_size: u.unit_size,
      price: u.price,
      is_active: u.is_active,
    });
    setOpen(true);
  }

  async function onSubmit(values: ProductUnitFormValues) {
    try {
      if (editing) {
        await updateMut.mutateAsync(values);
        toast.success("تم تعديل الوحدة");
      } else {
        // Map legacy form fields to API payload shape
        const payload = {
          unit_id: values.unit_id,
          price: values.price,
          // Use unit_size as the minimum quantity for ordering
          min_qty: values.unit_size,
          // Default step quantity to 1 unless UI adds a field later
          step_qty: 1,
        };
        await addMut.mutateAsync(payload);
        toast.success("تمت إضافة الوحدة");
      }
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.body?.message || "فشل الحفظ");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold">الوحدات والأسعار</h4>
        <Button size="xs" onClick={startAdd}>
          إضافة وحدة
        </Button>
      </div>
      <Table>
        <Table.Head>
          <Table.HeadCell>الوحدة</Table.HeadCell>
          <Table.HeadCell>الحجم</Table.HeadCell>
          <Table.HeadCell>السعر</Table.HeadCell>
          <Table.HeadCell>الحالة</Table.HeadCell>
          <Table.HeadCell></Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {product.units?.length ? (
            product.units.map((u) => (
              <Table.Row key={u.id} className="bg-white">
                <Table.Cell>{u.unit?.name}</Table.Cell>
                <Table.Cell>{u.unit_size}</Table.Cell>
                <Table.Cell>{u.price}</Table.Cell>
                <Table.Cell>{u.is_active ? "نشطة" : "معطلة"}</Table.Cell>
                <Table.Cell className="space-x-2 rtl:space-x-reverse">
                  <Button size="xs" color="light" onClick={() => startEdit(u)}>
                    تعديل
                  </Button>
                  <DeleteUnitBtn productId={product.id} unitRowId={u.id} />
                </Table.Cell>
              </Table.Row>
            ))
          ) : (
            <Table.Row>
              <Table.Cell colSpan={5} className="text-center text-sm py-6">
                لا توجد وحدات
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>

      <Modal show={open} onClose={() => setOpen(false)} dismissible>
        <Modal.Header>{editing ? "تعديل وحدة" : "إضافة وحدة"}</Modal.Header>
        <Modal.Body>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm mb-1">الوحدة</label>
              {unitsList.isLoading ? (
                <Spinner size="sm" />
              ) : (
                <select
                  {...register("unit_id", { valueAsNumber: true })}
                  className="input w-full"
                >
                  <option value="">اختر</option>
                  {unitsList.data?.data?.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.unit_id && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.unit_id.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">الحجم</label>
              <input
                type="number"
                step="0.01"
                {...register("unit_size", { valueAsNumber: true })}
                className="input w-full"
              />
              {errors.unit_size && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.unit_size.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">السعر</label>
              <input
                type="number"
                step="0.01"
                {...register("price", { valueAsNumber: true })}
                className="input w-full"
              />
              {errors.price && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" {...register("is_active")} />
              <span className="text-sm">نشطة</span>
            </div>
            <div className="pt-2 flex gap-2">
              <Button
                type="submit"
                isProcessing={
                  isSubmitting || addMut.isPending || updateMut.isPending
                }
              >
                {editing ? "حفظ" : "إضافة"}
              </Button>
              <Button type="button" color="gray" onClick={() => setOpen(false)}>
                إلغاء
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

const DeleteUnitBtn: React.FC<{
  productId: number | string;
  unitRowId: number | string;
}> = ({ productId, unitRowId }) => {
  const del = useDeleteProductUnit(productId, unitRowId);
  async function remove() {
    if (!confirm("تأكيد حذف الوحدة؟")) return;
    try {
      await del.mutateAsync();
    } catch (e: any) {
      /* toast in parent? */
    }
  }
  return (
    <Button
      size="xs"
      color="failure"
      onClick={remove}
      isProcessing={del.isPending}
    >
      حذف
    </Button>
  );
};

export default ProductUnitsEditor;
