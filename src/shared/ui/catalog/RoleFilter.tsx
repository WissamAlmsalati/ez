"use client";
import { Select } from "flowbite-react";
import { useCatalogFilters } from "./useCatalogFilters";

export function RoleFilter({ className }: { className?: string }) {
  const { filters, update } = useCatalogFilters();
  return (
    <Select
      className={(className || "") + " min-w-40"}
      value={filters.role ?? ""}
      onChange={(e) => update({ role: e.target.value })}
    >
      <option value="">كل الأدوار</option>
      <option value="manager">مدير</option>
      <option value="employee">موظف</option>
      <option value="customer">زبون</option>
    </Select>
  );
}

export default RoleFilter;
