"use client";
import { Select } from "flowbite-react";
import { useCatalogFilters } from "./useCatalogFilters";
import { useTypesQuery } from "@/entities/product-type/api";

interface Props {
  className?: string;
  perPage?: number;
  categoryIdDep?: boolean; // لو أردنا لاحقاً تصفية المجموعات حسب الصنف المحدد
}

export function TypeFilter({ className, perPage = 100, categoryIdDep }: Props) {
  const { filters, update } = useCatalogFilters();

  // لو أردنا ربطها بالصنف، نضيف category_id لبارامز
  const { data, isLoading, isError } = useTypesQuery({
    per_page: perPage,
    category_id:
      categoryIdDep && filters.category_id
        ? Number(filters.category_id)
        : undefined,
  } as any);

  const types = data?.data ?? [];

  return (
    <Select
      className={(className || "") + " max-w-32"}
      value={filters.type_id ?? ""}
      disabled={isLoading || isError}
      onChange={(e) => update({ type_id: e.target.value })}
    >
      <option value="">المجموعات</option>
      {isLoading && (
        <option value="" disabled>
          جاري التحميل...
        </option>
      )}
      {isError && (
        <option value="" disabled>
          فشل التحميل
        </option>
      )}
      {!isLoading &&
        !isError &&
        types.map((t: any) => (
          <option key={t.id} value={String(t.id)}>
            {t.name}
          </option>
        ))}
    </Select>
  );
}

export default TypeFilter;
