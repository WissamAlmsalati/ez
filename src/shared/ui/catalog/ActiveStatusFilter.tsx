"use client";
import { Select } from "flowbite-react";
import { useCatalogFilters } from "./useCatalogFilters";

interface Props {
  className?: string;
}

export function ActiveStatusFilter({ className }: Props) {
  const { filters, update } = useCatalogFilters();

  return (
    <Select
      className={className + " max-w-32"}
      value={filters.is_active ?? ""}
      onChange={(e) => update({ is_active: e.target.value })}
    >
      <option value="">الحالة</option>
      <option value="1">نشط</option>
      <option value="0">غير نشط</option>
    </Select>
  );
}
