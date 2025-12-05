"use client";
import {
  Modal,
  Button,
  Label,
  TextInput,
  Checkbox,
  FileInput,
  Spinner,
  Textarea,
} from "flowbite-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema, type CreateProductValues } from "./schema";
import { useCreateProduct } from "@/entities/product/api";
import { toast } from "sonner";
import React, { useState } from "react";
import RemoteSelect from "@/shared/ui/remote/RemoteSelect";
import { useRemoteSelectField } from "@/shared/ui/remote/useRemoteSelectField";

export default function CreateProductModal({
  open,
  onClose,
  typeId,
}: {
  open: boolean;
  onClose: () => void;
  typeId?: number;
}) {
  const createMutation = useCreateProduct();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    watch,
  } = useForm<CreateProductValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      is_active: true,
      is_featured: false,
      // إذا كان النوع ثابتاً نضعه هنا لضمان نجاح التحقق مباشرةً
      ...(typeId ? { type_id: typeId } : {}),
      prices: [
        {
          unit_id: undefined as any, // يلزم اختيار وحدة صراحةً
          price: 0,
          is_default: true,
          min_qty: 1,
          step_qty: 1,
        },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "prices" });
  const remoteTypeHook = !typeId
    ? useRemoteSelectField<any>("type_id", setValue)
    : null;
  const selectedType = remoteTypeHook?.option;
  const onTypeChange: (val: any) => void = remoteTypeHook
    ? remoteTypeHook.onChange
    : () => {};
  const resetType = remoteTypeHook?.reset;

  // في حال تغيّر typeId (نظرياً) نضبط القيمة في الفورم
  React.useEffect(() => {
    if (typeId) {
      setValue("type_id", typeId, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [typeId, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("name", values.name);
      if (values.description) fd.append("description", values.description);
      fd.append("type_id", String(typeId ?? values.type_id));
      fd.append("is_active", values.is_active ? "1" : "0");
      fd.append("is_featured", values.is_featured ? "1" : "0");
      const imgFile = (values as any).image?.[0];
      if (imgFile) fd.append("image", imgFile);
      const pricesPayload = values.prices.map((p) => ({
        unit_id: p.unit_id,
        price: p.price,
        is_default: p.is_default ?? false,
        min_qty: p.min_qty,
        step_qty: p.step_qty,
      }));
      const pricesJson = JSON.stringify(pricesPayload);
      fd.append("prices", pricesJson);
      await createMutation.mutateAsync(fd);
      toast.success("تم إضافة الصنف بنجاح");
      reset();
      if (resetType) resetType();
      onClose();
    } catch (e: any) {
      toast.error(e?.body?.message || "حدث خطأ أثناء الإضافة");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Modal show={open} size="lg" onClose={onClose} popup>
      <Modal.Header className="p-4">
        <span className="text-lg font-semibold rtl:text-right">إضافة صنف</span>
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <form onSubmit={onSubmit} className="space-y-5">
            <div
              className={`grid gap-4 ${
                !typeId ? "grid-cols-2" : "grid-cols-1"
              }`}
            >
              <div
                className={`flex flex-col gap-1 ${!typeId ? "" : "col-span-1"}`}
              >
                <Label value="اسم الصنف" />
                <TextInput {...register("name")} />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message as any}
                  </p>
                )}
              </div>
              {!typeId && (
                <div className="flex flex-col gap-1">
                  <Label value="المجموعة" />
                  <RemoteSelect
                    path="/types"
                    pageSize={100}
                    value={selectedType}
                    onChange={onTypeChange}
                    getOptionValue={(t: any) => t.id}
                    getOptionLabel={(t: any) => t.name}
                    placeholder="اختر المجموعة"
                  />
                  {errors.type_id && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.type_id.message as any}
                    </p>
                  )}
                </div>
              )}
            </div>
            {/* Description */}
            <div className="flex flex-col gap-1">
              <Label value="وصف الصنف" />
              <Textarea rows={3} {...register("description")} />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description.message as any}
                </p>
              )}
            </div>
            {/* Image */}
            <div className="flex flex-col gap-1">
              <Label value="صورة الصنف" />
              <FileInput accept="image/*" {...register("image")} />
            </div>
            {/* Toggles */}
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_active_prod"
                  {...register("is_active")}
                  defaultChecked
                />
                <Label htmlFor="is_active_prod">نشط</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="is_featured_prod" {...register("is_featured")} />
                <Label htmlFor="is_featured_prod">مميز</Label>
              </div>
            </div>
            {/* Prices Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">الأسعار</span>
                <Button
                  size="xs"
                  color="gray"
                  type="button"
                  onClick={() =>
                    append({
                      unit_id: undefined as any, // يترك للمستخدم اختيار الوحدة صراحة
                      price: 0,
                      is_default: fields.length === 0,
                      min_qty: 1,
                      step_qty: 1,
                    })
                  }
                >
                  إضافة سعر
                </Button>
              </div>
              <div className="flex flex-col gap-4">
                {fields.map((f, i) => (
                  <PriceCard
                    key={f.id}
                    index={i}
                    fieldId={f.id}
                    watch={watch}
                    errors={errors}
                    remove={remove}
                    setValue={setValue}
                    fields={fields}
                    register={register}
                  />
                ))}
              </div>
              {errors.prices && !Array.isArray(errors.prices) && (
                <p className="text-red-500 text-xs mt-1">
                  {(errors.prices as any)?.message}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                color="gray"
                onClick={onClose}
                type="button"
                className="transition-colors duration-300"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                color={"primary"}
                className="transition-colors duration-300"
              >
                {submitting ? <Spinner size="sm" /> : "تأكيد"}
              </Button>
            </div>
          </form>
        </div>
      </Modal.Body>
    </Modal>
  );
}

// --------------------------------------------
// Inner component: PriceCard for a single price row
// --------------------------------------------
interface PriceCardProps {
  index: number;
  fieldId: string;
  watch: any;
  errors: any;
  remove: (index: number) => void;
  setValue: any;
  fields: any[];
  register: any;
}

function PriceCard({
  index: i,
  fieldId,
  watch,
  errors,
  remove,
  setValue,
  fields,
  register,
}: PriceCardProps) {
  const pricesWatch = watch("prices");
  const current = pricesWatch?.[i];
  const unitError = errors.prices?.[i]?.unit_id;
  const priceError = errors.prices?.[i]?.price;
  // Local hook binding for unit selection (stores object locally, id in form)
  const { option: selectedUnit, onChange: onUnitChange } =
    useRemoteSelectField<any>(`prices.${i}.unit_id`, setValue);
  return (
    <div
      className={`relative rounded-lg border p-4 shadow-sm bg-white/90 backdrop-blur transition w-full ${
        current?.is_default ? "border-primary" : "border-gray-200"
      }`}
    >
      <button
        type="button"
        onClick={() => {
          fields.forEach((_: any, idx: number) => {
            setValue(`prices.${idx}.is_default`, idx === i, {
              shouldDirty: true,
            });
          });
        }}
        className={`absolute top-1 start-1 text-[10px] px-2 py-1 rounded-full font-medium border transition shadow-sm ${
          current?.is_default
            ? "bg-primary text-white border-primary"
            : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-primary/10"
        }`}
      >
        {current?.is_default ? "افتراضي" : "افتراضي؟"}
      </button>
      <div className="absolute top-1 end-1 flex items-center gap-1">
        <button
          type="button"
          onClick={() => {
            const wasDefault = !!current?.is_default;
            remove(i);
            // After removal, ensure a default still exists
            setTimeout(() => {
              const after = watch("prices");
              if (!after || after.length === 0) return;
              const hasDefault = after.some((p: any) => p.is_default);
              if (!hasDefault) {
                // assign first as default
                setValue(`prices.0.is_default`, true, { shouldDirty: true });
              } else if (wasDefault) {
                // if removed default but another default somehow existed, leave as-is
              }
            });
          }}
          className="h-6 w-6 flex items-center justify-center rounded-md text-sm font-bold text-primary hover:bg-primary/10 focus:outline-none"
          aria-label="حذف السعر"
          title="حذف"
        >
          ×
        </button>
      </div>
      <div className="space-y-3">
        <div className="space-y-1">
          <Label value="الوحدة" />
          <RemoteSelect
            path="/units"
            pageSize={100}
            value={selectedUnit}
            onChange={onUnitChange}
            getOptionValue={(u: any) => u.id}
            getOptionLabel={(u: any) => u.displayName || u.name}
            placeholder="اختر الوحدة"
          />
          {unitError && (
            <p className="text-[10px] text-red-500">
              {unitError.message as any}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="space-y-1 ">
            <Label value="أقل كمية" />
            <TextInput
              type="number"
              min={0}
              step={0.01}
              {...register(`prices.${i}.min_qty`)}
            />
          </div>
          <div className="space-y-1">
            <Label value="زيادة الكمية" />
            <TextInput
              type="number"
              min={0}
              step={0.01}
              {...register(`prices.${i}.step_qty`)}
            />
          </div>
          <div className="space-y-1">
            <Label value="السعر" />
            <TextInput
              type="number"
              min={0}
              step={0.01}
              {...register(`prices.${i}.price`)}
            />
            {priceError && (
              <p className="text-[10px] text-red-500">{priceError.message as any}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
