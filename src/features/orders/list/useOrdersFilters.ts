"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useCallback } from "react";
import type { OrderStatus } from "@/entities/order/types";

export interface OrdersFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: OrderStatus | "";
  department_id?: string;
  pickup_date?: string;
  date_from?: string;
  date_to?: string;
  user_id?: string;
}

export function useOrdersFilters() {
  const params = useSearchParams();
  const router = useRouter();

  const filters = useMemo(() => {
    const entries = Object.fromEntries(params?.entries?.() ?? []);
    return entries as any as OrdersFilters;
  }, [params]);

  const update = useCallback(
    (patch: Partial<OrdersFilters>) => {
      const next = new URLSearchParams(params?.toString() ?? "");
      Object.entries(patch).forEach(([k, v]) => {
        if (v == null || v === "") next.delete(k);
        else next.set(k, String(v));
      });
      router.push(`?${next.toString()}`);
    },
    [params, router]
  );

  return { filters, update };
}
