"use client";
import { Select } from "flowbite-react";
import { useCatalogFilters } from "./useCatalogFilters";
import { useCategoriesQuery } from "@/entities/category/api";

interface Props {
  className?: string;
  perPage?: number; // allow override if needed
}

export function CategoryFilter({ className, perPage = 100 }: Props) {
  const { filters, update } = useCatalogFilters();
  const { data, isLoading, isError } = useCategoriesQuery({
    per_page: perPage,
  });

  const categories = data?.data ?? [];

  return (
    <Select
      className={(className || "") + " max-w-32"}
      value={filters.category_id ?? ""}
      disabled={isLoading || isError}
      onChange={(e) => update({ category_id: e.target.value })}
    >
      <option value="">كل الأصناف</option>
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
        categories.map((cat) => (
          <option key={cat.id} value={String(cat.id)}>
            {cat.name}
          </option>
        ))}
    </Select>
  );
}

export default CategoryFilter;
