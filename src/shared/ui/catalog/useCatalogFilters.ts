"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useCallback } from "react";

export type Filters = {
  search?: string;
  is_active?: string; // '1' | '0' | ''
  category_id?: string; // selected category id
  type_id?: string; // selected type id
  // Users specific
  role?: string; // manager | employee | customer
  department_id?: string; // selected department id
  include_deleted?: string; // '1' to include
};

export function useCatalogFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const current = useMemo(() => {
    if (!params) return {} as Filters;
    return Object.fromEntries(params.entries()) as Filters;
  }, [params]);

  const update = useCallback(
    (patch: Partial<Filters>) => {
      const next = new URLSearchParams(params?.toString() ?? "");
      Object.entries(patch).forEach(([k, v]) => {
        if (v == null || v === "") next.delete(k);
        else next.set(k, String(v));
      });
      router.push(`?${next.toString()}`);
    },
    [params, router]
  );

  return { filters: current, update };
}
