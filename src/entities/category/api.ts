import {
  buildCreateMutation,
  buildListQuery,
  buildToggleMutation,
  catalogKeys,
} from "@/entities/catalog/api";
import type { Category, CategoryDetails } from "./types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { apiInstance } from "@/shared/api";
import type { ListParams } from "@/entities/catalog/types";
import { mapCategoryApi } from "@/entities/catalog/mapper";

export const CATEGORY_PATH = "/categories";

export const categoryKeys = {
  ...catalogKeys,
  base: () => catalogKeys.byPath(CATEGORY_PATH),
  list: (params?: ListParams) => catalogKeys.list(CATEGORY_PATH, params),
  detail: (id: number | string) => catalogKeys.detail(CATEGORY_PATH, id),
};

export const useCategoriesQuery = buildListQuery<Category>(
  CATEGORY_PATH,
  mapCategoryApi
);
export const useCreateCategory = buildCreateMutation<any, Category>(
  CATEGORY_PATH
);
// Toggle status via POST /categories/{id}/toggle-status (no PATCH)
export function useToggleCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const { data } = await apiInstance.post(
        `${CATEGORY_PATH}/${id}/toggle-status`
      );
      return data;
    },
    onMutate: async (id: number | string) => {
      const qkRoot = categoryKeys.base();
      await qc.cancelQueries({ queryKey: qkRoot });
      const snapshot = qc.getQueriesData<any>({ queryKey: qkRoot });
      snapshot.forEach(([key, value]) => {
        if (!value) return;
        qc.setQueryData(key, {
          ...value,
          data: (value.data || []).map((it: any) =>
            it.id === id ? { ...it, is_active: !it.is_active } : it
          ),
        });
      });
      return { snapshot } as any;
    },
    onError: (_err, _vars, ctx: any) => {
      const qkRoot = categoryKeys.base();
      ctx?.snapshot?.forEach?.(([key, value]: any) => {
        qc.setQueryData(key, value);
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.base() });
    },
  });
}

// Detail query
export function useCategoryDetail(id: number | string | undefined) {
  return useQuery({
    queryKey: id ? categoryKeys.detail(id) : [CATEGORY_PATH, "detail", null],
    enabled: !!id,
    staleTime: 60_000,
    queryFn: async () => {
      try {
        const { data } = await apiInstance.get(`${CATEGORY_PATH}/${id}`);
        return (data.data || data) as CategoryDetails; // backend wraps in {data}
      } catch (e: any) {
        if (e?.response?.status === 404) notFound();
        throw e;
      }
    },
  });
}

export function useUpdateCategory(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<CategoryDetails> | FormData) => {
      const fd: FormData =
        payload instanceof FormData
          ? payload
          : (() => {
              const form = new FormData();
              Object.entries(payload || {}).forEach(([k, v]) => {
                if (v === undefined || v === null) return;
                if (
                  k === "image" &&
                  typeof v === "object" &&
                  (v as any)?.name
                ) {
                  form.append("image", v as any);
                  return;
                }
                if (k === "is_active") {
                  form.append("is_active", (v as any) ? "true" : "false");
                  return;
                }
                form.append(k, String(v));
              });
              return form;
            })();

      const { data } = await apiInstance.post(`${CATEGORY_PATH}/${id}`, fd, {
        headers: { Accept: "application/json" },
      });
      return data;
    },
    onMutate: async (variables) => {
      // Support optimistic toggle only if caller passed plain object with is_active only
      if (variables instanceof FormData) return {};
      const keys = Object.keys(variables || {});
      if (keys.length === 1 && keys[0] === "is_active") {
        await qc.cancelQueries({ queryKey: categoryKeys.detail(id) });
        const previous = qc.getQueryData(categoryKeys.detail(id));
        qc.setQueryData(categoryKeys.detail(id), (old: any) => {
          if (!old) return old;
          const nextVal = !!(variables as any).is_active;
          return { ...old, is_active: nextVal, isActive: nextVal };
        });
        return { previous, optimistic: true };
      }
      return {};
    },
    onError: (_err, _vars, ctx) => {
      if (ctx && (ctx as any).optimistic) {
        qc.setQueryData(categoryKeys.detail(id), (ctx as any).previous);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.detail(id) });
      qc.invalidateQueries({ queryKey: categoryKeys.base() });
    },
  });
}

export function useDeleteCategory(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiInstance.delete(`${CATEGORY_PATH}/${id}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.base() });
    },
  });
}

export function useRestoreCategory(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiInstance.post(`${CATEGORY_PATH}/${id}/restore`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.detail(id) });
      qc.invalidateQueries({ queryKey: categoryKeys.base() });
    },
  });
}
