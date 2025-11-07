"use client";
import { Modal, Button, Select, Spinner, Alert } from "flowbite-react";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { useCategoriesQuery } from "@/entities/category/api";
import { useTypesQuery } from "@/entities/product-type/api";
import { useProductsQueryV2, useUpdateProduct } from "@/entities/product/api";
import { useAddFeaturedProductModal } from "./addFeaturedProductModalStore";
import { HiCheckCircle } from "react-icons/hi";
import { useQueryClient } from "@tanstack/react-query";
import { productKeysV2 } from "@/entities/product/api";

interface Props {
  open: boolean;
  onClose: () => void;
}

// ملاحظات:
// 1. يتم تفعيل كل Select بعد اختيار السابق.
// 2. نصفي الأصناف is_featured=false حتى لا نكرر.
// 3. عند النجاح: إغلاق المودال وتفريغ الاختيارات و invalidation لقائمة الأصناف المميزة.

export default function AddFeaturedProductModal({ open, onClose }: Props) {
  const { closeModal } = useAddFeaturedProductModal();
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [typeId, setTypeId] = useState<number | "">("");
  const [productId, setProductId] = useState<number | "">("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // جلب التصنيفات
  const categoriesQuery = useCategoriesQuery({
    per_page: 100,
    is_active: true,
  });
  // الأنواع حسب التصنيف
  const typesQuery = useTypesQuery(
    categoryId ? { per_page: 100, category_id: categoryId } : undefined
  );
  // الأصناف حسب النوع وغير مميزة
  const productsQuery = useProductsQueryV2(
    typeId
      ? {
          per_page: 100,
          type_id: typeId,
          is_featured: false,
        }
      : undefined
  );

  const qc = useQueryClient();
  const updateMutation = useUpdateProduct(productId || 0);

  // تجهيز قيم القوائم بأمان
  const categories = categoriesQuery.data?.data || [];
  const types = typesQuery.data?.data || [];
  const products = (productsQuery.data?.data || []).filter(
    (p: any) => !p.is_featured
  );

  function resetState() {
    setCategoryId("");
    setTypeId("");
    setProductId("");
    setErrorMsg(null);
  }

  function handleClose() {
    resetState();
    onClose();
  }

  async function handleSubmit() {
    setErrorMsg(null);
    if (!productId) {
      setErrorMsg("اختر الصنف أولاً");
      return;
    }
    try {
      await updateMutation.mutateAsync({ is_featured: true });
      // نعمل invalidate لقوائم الأصناف + قائمة الأصناف المميزة (تعتمد على is_featured=true)
      qc.invalidateQueries({ queryKey: productKeysV2.base() });
      toast.success("تمت إضافة الصنف إلى الأبرز بنجاح");
      handleClose();
    } catch (e: any) {
      setErrorMsg(e?.message || "حدث خطأ");
      toast.error(e?.message || "فشل في الإضافة للأبرز");
    }
  }

  // إعادة ضبط التبعيات عند التغيير
  useEffect(() => {
    setTypeId("");
    setProductId("");
  }, [categoryId]);
  useEffect(() => {
    setProductId("");
  }, [typeId]);

  return (
    <Modal show={open} size="md" onClose={handleClose} popup>
      <Modal.Header />
      <Modal.Body>
        <div className="flex flex-col gap-5">
          <h3 className="text-lg font-semibold">إضافة منتج إلى الأبرز</h3>
          {errorMsg && (
            <Alert color="failure" className="text-sm">
              {errorMsg}
            </Alert>
          )}
          {/* Select التصنيفات */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">التصنيف</label>
            <Select
              value={categoryId}
              disabled={categoriesQuery.isLoading}
              onChange={(e) => setCategoryId(Number(e.target.value) || "")}
            >
              <option value="">اختر التصنيف</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            {categoriesQuery.isLoading && (
              <p className="text-xs text-neutral-500 flex items-center gap-1">
                <Spinner size="xs" /> تحميل التصنيفات...
              </p>
            )}
          </div>
          {/* Select الأنواع */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">النوع</label>
            <Select
              value={typeId}
              disabled={!categoryId || typesQuery.isLoading}
              onChange={(e) => setTypeId(Number(e.target.value) || "")}
            >
              <option value="">
                {!categoryId ? "اختر التصنيف أولاً" : "اختر النوع"}
              </option>
              {types.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
            {typesQuery.isLoading && categoryId && (
              <p className="text-xs text-neutral-500 flex items-center gap-1">
                <Spinner size="xs" /> تحميل الأنواع...
              </p>
            )}
          </div>
          {/* Select الأصناف */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">المنتج</label>
            <Select
              value={productId}
              disabled={!typeId || productsQuery.isLoading}
              onChange={(e) => setProductId(Number(e.target.value) || "")}
            >
              <option value="">
                {!typeId ? "اختر النوع أولاً" : "اختر المنتج"}
              </option>
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
            {productsQuery.isLoading && typeId && (
              <p className="text-xs text-neutral-500 flex items-center gap-1">
                <Spinner size="xs" /> تحميل الاصناف...
              </p>
            )}
            {typeId && !productsQuery.isLoading && products.length === 0 && (
              <p className="text-xs text-primary">
                لا توجد منتجات متاحة (غير مميزة) لهذا النوع.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              color="gray"
              onClick={handleClose}
              disabled={updateMutation.isPending}
            >
              إلغاء
            </Button>
            <Button
              color="primary"
              disabled={!productId || updateMutation.isPending}
              onClick={handleSubmit}
            >
              {updateMutation.isPending ? (
                <span className="flex items-center gap-1">
                  <Spinner size="xs" /> جاري الحفظ
                </span>
              ) : (
                <span className="flex items-center gap-1">تأكيد</span>
              )}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
