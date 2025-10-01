"use client";
import { TextInput, Select } from "flowbite-react";
import { useOrdersFilters } from "./useOrdersFilters";
import type { OrderStatus } from "@/entities/order/types";

const statuses: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "قيد الانتظار" },
  { value: "confirmed", label: "مؤكد" },
  { value: "in_preparation", label: "قيد التحضير" },
  { value: "ready", label: "جاهز" },
  { value: "delivered", label: "تم التوصيل" },
  { value: "cancelled", label: "ملغي" },
];

export function OrdersFilters() {
  const { filters, update } = useOrdersFilters();
  return (
    <div className="flex flex-wrap gap-3 items-center w-full">
      <div className="w-full sm:w-auto" style={{ maxWidth: 360 }}>
        <TextInput
          placeholder="ابحث…"
          defaultValue={filters.search ?? ""}
          onChange={(e) => update({ search: e.target.value })}
        />
      </div>
      <Select
        className="min-w-44"
        value={filters.status ?? ""}
        onChange={(e) => update({ status: e.target.value as any })}
      >
        <option value="">كل الحالات</option>
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
