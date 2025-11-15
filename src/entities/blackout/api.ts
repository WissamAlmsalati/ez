import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiInstance } from "@/shared/api";
import type { BlackoutPeriod, OrderBlockStatus } from "./types";

export const BLACKOUT_PATH = "/blackout-periods";

export const blackoutKeys = {
  base: () => [BLACKOUT_PATH],
  list: () => [BLACKOUT_PATH, "list"],
  detail: (id: number | string) => [BLACKOUT_PATH, "detail", id],
  status: () => [BLACKOUT_PATH, "order-status"],
};

function mapBlackout(raw: any): BlackoutPeriod {
  return {
    id: raw.id,
    reason: raw.reason,
    startsAt: raw.startsAt ?? raw.starts_at,
    endsAt: raw.endsAt ?? raw.ends_at,
    isActive: raw.isActive ?? raw.is_active,
    statusText: raw.statusText ?? raw.status_text,
    isCurrent: raw.isCurrent ?? raw.is_current,
    isExpired: raw.isExpired ?? raw.is_expired,
    isUpcoming: raw.isUpcoming ?? raw.is_upcoming,
    periodText: raw.periodText ?? raw.period_text,
    daysRemaining: raw.daysRemaining ?? raw.days_remaining,
    affectsOrders: raw.affectsOrders ?? raw.affects_orders,
    createdAt: raw.createdAt ?? raw.created_at,
    updatedAt: raw.updatedAt ?? raw.updated_at,
  };
}

function mapStatus(raw: any): OrderBlockStatus {
  return {
    ordersBlocked: raw.ordersBlocked ?? raw.orders_blocked,
    message: raw.message,
    activePeriods: (raw.activePeriods ?? raw.active_periods ?? []).map(
      mapBlackout
    ),
  };
}

export function useBlackoutPeriodsQuery() {
  return useQuery({
    queryKey: blackoutKeys.list(),
    queryFn: async () => {
      const { data } = await apiInstance.get(BLACKOUT_PATH);
      const list = ((data?.data ?? data) as any[]) ?? [];
      return list.map(mapBlackout);
    },
    staleTime: 60_000,
  });
}

export function useOrderStatusQuery() {
  return useQuery({
    queryKey: blackoutKeys.status(),
    queryFn: async () => {
      const { data } = await apiInstance.get(`${BLACKOUT_PATH}/order-status`);
      return mapStatus(data?.data ?? data);
    },
    staleTime: 30_000,
  });
}

export function useCreateBlackoutPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<BlackoutPeriod>) => {
      const { data } = await apiInstance.post(BLACKOUT_PATH, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: blackoutKeys.base() });
      qc.invalidateQueries({ queryKey: blackoutKeys.status() });
    },
  });
}

export function useUpdateBlackoutPeriod(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<BlackoutPeriod>) => {
      const { data } = await apiInstance.post(`${BLACKOUT_PATH}/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: blackoutKeys.base() });
      qc.invalidateQueries({ queryKey: blackoutKeys.status() });
    },
  });
}

export function useDeleteBlackoutPeriod(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiInstance.delete(`${BLACKOUT_PATH}/${id}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: blackoutKeys.base() });
      qc.invalidateQueries({ queryKey: blackoutKeys.status() });
    },
  });
}
