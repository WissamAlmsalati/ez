import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiInstance } from "@/shared/api";
import type { OrderWindow, OrderWindowsResponse } from "./types";

export const ORDER_WINDOWS_PATH = "/order-windows";

export const orderWindowKeys = {
  base: () => [ORDER_WINDOWS_PATH],
  list: () => [ORDER_WINDOWS_PATH, "list"],
  detail: (id: number | string) => [ORDER_WINDOWS_PATH, "detail", id],
};

function mapOrderWindow(raw: any): OrderWindow {
  return {
    id: raw.id,
    dayOfWeek: raw.dayOfWeek ?? raw.day_of_week,
    dayName: raw.dayName ?? raw.day_name,
    startTime: raw.startTime ?? raw.start_time,
    endTime: raw.endTime ?? raw.end_time,
    isActive: raw.isActive ?? raw.is_active,
    statusText: raw.statusText ?? raw.status_text,
    timeText: raw.timeText ?? raw.time_text,
    isCurrentlyOpen: raw.isCurrentlyOpen ?? raw.is_currently_open,
    createdAt: raw.createdAt ?? raw.created_at,
    updatedAt: raw.updatedAt ?? raw.updated_at,
  };
}

export function useOrderWindowsQuery() {
  return useQuery({
    queryKey: orderWindowKeys.list(),
    queryFn: async () => {
      const { data } = await apiInstance.get(ORDER_WINDOWS_PATH);
      const payload = (data?.data ?? data) as
        | any[]
        | OrderWindowsResponse;
      const list = Array.isArray(payload)
        ? payload
        : ((payload as OrderWindowsResponse).data as any[]);
      return (list || []).map(mapOrderWindow);
    },
    staleTime: 60_000,
  });
}

export function useUpdateOrderWindow(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Partial<Pick<OrderWindow, "startTime" | "endTime" | "dayOfWeek">>
    ) => {
      const { data } = await apiInstance.post(
        `${ORDER_WINDOWS_PATH}/${id}`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderWindowKeys.base() });
    },
  });
}

export function useToggleOrderWindow(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiInstance.post(
        `${ORDER_WINDOWS_PATH}/${id}/toggle-status`
      );
      return data;
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: orderWindowKeys.list() });
      const previous = qc.getQueryData(orderWindowKeys.list());
      qc.setQueryData(orderWindowKeys.list(), (old: any) => {
        const list: OrderWindow[] = (old as any) ?? [];
        return list.map((w) => (w.id === id ? { ...w, isActive: !w.isActive } : w));
      });
      return { previous };
    },
    onError: (_err, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(orderWindowKeys.list(), ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: orderWindowKeys.list() });
    },
  });
}
