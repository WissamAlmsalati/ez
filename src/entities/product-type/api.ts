import {
  buildCreateMutation,
  buildListQuery,
  buildToggleMutation,
  catalogKeys,
} from "@/entities/catalog/api";
import type { ProductType } from "./types";
import type { ListParams } from "@/entities/catalog/types";
import { mapProductTypeApi } from "@/entities/catalog/mapper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { apiInstance } from "@/shared/api";

export const TYPE_PATH = "/types";

export const typeKeys = {
  ...catalogKeys,
  base: () => catalogKeys.byPath(TYPE_PATH),
  list: (params?: ListParams) => catalogKeys.list(TYPE_PATH, params),
  detail: (id: number | string) => catalogKeys.detail(TYPE_PATH, id),
};

export const useTypesQuery = buildListQuery<ProductType>(
  TYPE_PATH,
  mapProductTypeApi
);
export const useCreateType = buildCreateMutation<any, ProductType>(TYPE_PATH);
// Toggle status via POST /types/{id}/toggle-status (no PATCH)
export function useToggleType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const { data } = await apiInstance.post(
        `${TYPE_PATH}/${id}/toggle-status`
      );
      return data;
    },
    onMutate: async (id: number | string) => {
      const qkRoot = typeKeys.base();
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
      ctx?.snapshot?.forEach?.(([key, value]: any) => {
        qc.setQueryData(key, value);
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: typeKeys.base() });
    },
  });
}

export function useTypeDetail(id: number | string | undefined) {
  return useQuery({
    queryKey: id ? typeKeys.detail(id) : [TYPE_PATH, "detail", null],
    enabled: !!id,
    staleTime: 60_000,
    queryFn: async () => {
      try {
        const { data } = await apiInstance.get(`${TYPE_PATH}/${id}`);
        return (data.data || data) as ProductType; // backend wraps
      } catch (e: any) {
        if (e?.response?.status === 404) {
          notFound();
        }
        throw e;
      }
    },
  });
}

export function useUpdateType(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<ProductType> | FormData) => {
      // إذا كان التحديث فقط لحقل is_active أرسل JSON PUT مباشرةً (تحسين للأداء ولتجنّب تحويل البوليان)
      if (!(payload instanceof FormData)) {
        const keys = Object.keys(payload || {});
        if (keys.length === 1 && keys[0] === "is_active") {
          const { data } = await apiInstance.put(
            `${TYPE_PATH}/${id}`,
            { is_active: (payload as any).is_active },
            { headers: { Accept: "application/json" } }
          );
          return data;
        }
      }

      let fd: FormData;
      if (payload instanceof FormData) {
        fd = payload;
      } else {
        fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (k === "image" && typeof v === "object" && (v as any)?.name) {
            fd.append("image", v as any);
            return;
          }
          if (k === "is_active") {
            fd.append("is_active", (v as any) ? "true" : "false");
            return;
          }
          fd.append(k, String(v));
        });
      }
      const { data } = await apiInstance.post(`${TYPE_PATH}/${id}`, fd, {
        headers: { Accept: "application/json" },
      });
      return data;
    },
    onMutate: async (variables) => {
      if (variables instanceof FormData) return {};
      const keys = Object.keys(variables || {});
      if (keys.length === 1 && keys[0] === "is_active") {
        await qc.cancelQueries({ queryKey: typeKeys.detail(id) });
        const previous = qc.getQueryData(typeKeys.detail(id));
        qc.setQueryData(typeKeys.detail(id), (old: any) =>
          old ? { ...old, is_active: variables.is_active } : old
        );
        return { previous, optimistic: true };
      }
      return {};
    },
    onError: (_err, _vars, ctx) => {
      if (ctx && (ctx as any).optimistic) {
        qc.setQueryData(typeKeys.detail(id), (ctx as any).previous);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: typeKeys.detail(id) });
      qc.invalidateQueries({ queryKey: typeKeys.base() });
    },
  });
}

export function useDeleteType(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiInstance.delete(`${TYPE_PATH}/${id}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: typeKeys.base() });
    },
  });
}

export function useRestoreType(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiInstance.post(`${TYPE_PATH}/${id}/restore`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: typeKeys.detail(id) });
      qc.invalidateQueries({ queryKey: typeKeys.base() });
    },
  });
}
