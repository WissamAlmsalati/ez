"use client";
import { Select } from "flowbite-react";
import { useCatalogFilters } from "./useCatalogFilters";
import { useDepartmentsQuery } from "@/entities/department/api";

interface Props {
  className?: string;
  perPage?: number;
}

export function DepartmentFilter({ className, perPage = 100 }: Props) {
  const { filters, update } = useCatalogFilters();
  const { data, isLoading, isError } = useDepartmentsQuery({
    per_page: perPage,
  });
  const departments = data?.data ?? [];

  return (
    <Select
      className={(className || "") + " min-w-40"}
      value={filters.department_id ?? ""}
      disabled={isLoading || isError}
      onChange={(e) => update({ department_id: e.target.value })}
    >
      <option value="">كل الأقسام</option>
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
        departments.map((dep) => (
          <option key={dep.id} value={String(dep.id)}>
            {dep.name}
          </option>
        ))}
    </Select>
  );
}

export default DepartmentFilter;
