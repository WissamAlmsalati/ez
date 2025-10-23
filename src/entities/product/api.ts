import {
  buildCreateMutation,
  buildListQuery,
  buildToggleMutation,
  catalogKeys,
} from "@/entities/catalog/api";
import type { Product, ProductDetails } from "./types";
import type { ListParams } from "@/entities/catalog/types";
import { mapProductApi } from "@/entities/catalog/mapper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { apiInstance } from "@/shared/api";

export const PRODUCT_PATH = "/products";

export type ProductListParams = ListParams & {
  category_id?: number;
  type_id?: number;
  is_featured?: boolean;
};

export const productKeysV2 = {
  ...catalogKeys,
  base: () => catalogKeys.byPath(PRODUCT_PATH),
  list: (params?: ProductListParams) => catalogKeys.list(PRODUCT_PATH, params),
  detail: (id: number | string) => catalogKeys.detail(PRODUCT_PATH, id),
};

export const useProductsQueryV2 = buildListQuery<Product>(
  PRODUCT_PATH,
  mapProductApi
);
export const useCreateProduct = buildCreateMutation<any, Product>(PRODUCT_PATH);
export const useToggleProduct = buildToggleMutation<Product>(PRODUCT_PATH);

export function useProductDetail(id: number | string | undefined) {
  return useQuery({
    queryKey: id ? productKeysV2.detail(id) : [PRODUCT_PATH, "detail", null],
    enabled: !!id,
    staleTime: 60_000,
    queryFn: async () => {
      try {
        const { data } = await apiInstance.get(`${PRODUCT_PATH}/${id}`);
        return (data.data || data) as ProductDetails;
      } catch (e: any) {
        if (e?.response?.status === 404) notFound();
        throw e;
      }
    },
  });
}

export function useUpdateProduct(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Product> | FormData) => {
      // إذا لم يوجد ملف (صورة) أرسل JSON مباشر للحفاظ على boolean
      if (!(payload instanceof FormData)) {
        const hasFile = Object.entries(payload).some(
          ([k, v]) =>
            k === "image" && v && typeof v === "object" && (v as any)?.name
        );
        if (!hasFile) {
          const { data } = await apiInstance.post(
            `${PRODUCT_PATH}/${id}`,
            payload
          );
          return data;
        }
      }
      let fd: FormData;
      if (payload instanceof FormData) fd = payload;
      else {
        fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (k === "image" && typeof v === "object" && (v as any)?.name)
            fd.append("image", v as any);
          else fd.append(k, String(v)); // مع وجود صورة سنستخدم FormData
        });
      }
      const { data } = await apiInstance.post(`${PRODUCT_PATH}/${id}`, fd);
      return data;
    },
    onMutate: async (variables) => {
      if (variables instanceof FormData) return {};
      const keys = Object.keys(variables || {});
      // Optimistic only when toggling one flag (is_active) via switch
      if (keys.length === 1 && keys[0] === "is_active") {
        await qc.cancelQueries({ queryKey: productKeysV2.detail(id) });
        const previous = qc.getQueryData(productKeysV2.detail(id));
        qc.setQueryData(productKeysV2.detail(id), (old: any) =>
          old ? { ...old, is_active: variables.is_active } : old
        );
        return { previous, optimistic: true };
      }
      return {};
    },
    onError: (_err, _vars, ctx) => {
      if (ctx && (ctx as any).optimistic) {
        qc.setQueryData(productKeysV2.detail(id), (ctx as any).previous);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeysV2.detail(id) });
      qc.invalidateQueries({ queryKey: productKeysV2.base() });
    },
  });
}

export function useDeleteProduct(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiInstance.delete(`${PRODUCT_PATH}/${id}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeysV2.base() });
    },
  });
}

export function useRestoreProduct(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiInstance.post(`${PRODUCT_PATH}/${id}/restore`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeysV2.detail(id) });
      qc.invalidateQueries({ queryKey: productKeysV2.base() });
    },
  });
}

export function useToggleFeaturedProduct(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiInstance.patch(
        `${PRODUCT_PATH}/${id}/toggle-featured`
      );
      return data;
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: productKeysV2.detail(id) });
      const previous = qc.getQueryData(productKeysV2.detail(id));
      qc.setQueryData(productKeysV2.detail(id), (old: any) =>
        old ? { ...old, is_featured: !old.is_featured } : old
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous)
        qc.setQueryData(productKeysV2.detail(id), ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: productKeysV2.detail(id) });
      qc.invalidateQueries({ queryKey: productKeysV2.base() });
    },
  });
}
