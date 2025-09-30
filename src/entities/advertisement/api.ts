import {
  buildCreateMutation,
  buildListQuery,
  catalogKeys,
} from "@/entities/catalog/api";
// TODO: لاحقاً يمكن إضافة buildToggleMutation إذا وفر الـ backend endpoint toggle-status
import type { ListParams } from "@/entities/catalog/types";
import type { Advertisement, CreateAdvertisementPayload } from "./types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiInstance } from "@/shared/api";
import { notFound } from "next/navigation";
import { mapAdvertisementApi } from "@/entities/catalog/mapper";

export const AD_PATH = "/advertisements";

export type AdvertisementListParams = ListParams & {
  is_active?: boolean; // يمكن إضافة include_deleted لاحقاً
};

export const advertisementKeys = {
  ...catalogKeys,
  base: () => catalogKeys.byPath(AD_PATH),
  list: (params?: AdvertisementListParams) => catalogKeys.list(AD_PATH, params),
  detail: (id: number | string) => catalogKeys.detail(AD_PATH, id),
};

export const useAdvertisementsQuery = buildListQuery<Advertisement>(
  AD_PATH,
  mapAdvertisementApi
);

export const useCreateAdvertisement = buildCreateMutation<
  CreateAdvertisementPayload,
  Advertisement
>(AD_PATH);

export function useAdvertisementDetail(id: number | string | undefined) {
  return useQuery({
    queryKey: id ? advertisementKeys.detail(id) : [AD_PATH, "detail", null],
    enabled: !!id,
    staleTime: 60_000,
    queryFn: async () => {
      try {
        const { data } = await apiInstance.get(`${AD_PATH}/${id}`);
        const raw = (data.data || data) as any;
        return mapAdvertisementApi(raw);
      } catch (e: any) {
        if (e?.response?.status === 404) notFound();
        throw e;
      }
    },
  });
}

// Update advertisement (PUT). إذا وُجد ملف صورة نرسل multipart تلقائياً.
export function useUpdateAdvertisement(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Advertisement> | FormData) => {
      // مسار: إذا payload ليست FormData ولا تحتوي ملف => أرسل JSON PUT
      if (!(payload instanceof FormData)) {
        const hasFile = Object.entries(payload || {}).some(
          ([k, v]) =>
            k === "image" && v && typeof v === "object" && (v as any)?.name
        );
        if (!hasFile) {
          const { data } = await apiInstance.put(`${AD_PATH}/${id}`, payload);
          return data;
        }
      }
      // تحويل إلى FormData
      let fd: FormData;
      if (payload instanceof FormData) fd = payload;
      else {
        fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (k === "image") {
            // دعم FileList أو File
            const maybeAny: any = v as any;
            if (maybeAny && typeof maybeAny === "object") {
              // FileList كشف بدائي
              if (typeof maybeAny.length === "number" && maybeAny.item) {
                if (maybeAny.length > 0) fd.append("image", maybeAny[0]);
                return;
              }
              if (maybeAny.name && maybeAny.size !== undefined) {
                fd.append("image", maybeAny);
                return;
              }
            }
            return; // تجاهل أي قيمة غير صالحة للصورة
          }
          if (k === "is_active") {
            fd.append("is_active", (v as any) ? "true" : "false");
            return;
          }
          fd.append(k, String(v));
        });
      }
      // نرسل PUT مباشر (مثل المنتج)
      const { data } = await apiInstance.put(`${AD_PATH}/${id}`, fd);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: advertisementKeys.detail(id) });
      qc.invalidateQueries({ queryKey: advertisementKeys.base() });
    },
  });
}

export function useDeleteAdvertisement(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiInstance.delete(`${AD_PATH}/${id}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: advertisementKeys.base() });
    },
  });
}

export function useRestoreAdvertisement(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiInstance.post(`${AD_PATH}/${id}/restore`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: advertisementKeys.detail(id) });
      qc.invalidateQueries({ queryKey: advertisementKeys.base() });
    },
  });
}

export function useToggleAdvertisement(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiInstance.patch(
        `${AD_PATH}/${id}/toggle-status`
      );
      return data;
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: advertisementKeys.detail(id) });
      const previous = qc.getQueryData(advertisementKeys.detail(id));
      qc.setQueryData(advertisementKeys.detail(id), (old: any) =>
        old ? { ...old, is_active: !old.is_active } : old
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous)
        qc.setQueryData(advertisementKeys.detail(id), ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: advertisementKeys.detail(id) });
      qc.invalidateQueries({ queryKey: advertisementKeys.base() });
    },
  });
}
