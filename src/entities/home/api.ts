import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/shared/api/axios";
import type { HomeDashboardData, LatestOrder } from "./types";

const HOME_PATH = "/v1/home"; // baseURL should already include /api/v1

// Mapper to ensure camelCase and optional fields across API shapes
function mapLatestOrder(raw: any): LatestOrder {
  return {
    id: raw.id,
    orderNumber: raw.orderNumber ?? raw.order_number ?? null,
    customerName: raw.customerName ?? raw.customer_name,
    customerPhone: raw.customerPhone ?? raw.customer_phone,
    totalAmount: Number(raw.totalAmount ?? raw.total_amount ?? 0),
    status: raw.status,
    createdAt: raw.createdAt ?? raw.created_at,
    deliveryDate: raw.deliveryDate ?? raw.delivery_date ?? null,
    notes: raw.notes ?? null,
  };
}

export function useHomeDashboardQuery() {
  return useQuery({
    queryKey: [HOME_PATH, "dashboard"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await apiInstance.get(HOME_PATH);
      const payload = (data.data ?? data) as any;
      const stats = payload.stats || {};
      const orders = payload.latestOrders ?? payload.latest_orders ?? [];

      const mapped: HomeDashboardData = {
        stats: {
          dailyProfit: {
            amount: Number(
              stats.dailyProfit?.amount ?? stats.daily_profit?.amount ?? 0
            ),
            change: String(
              stats.dailyProfit?.change ?? stats.daily_profit?.change ?? "0%"
            ),
          },
          products: {
            total: Number(stats.products?.total ?? 0),
            active: Number(stats.products?.active ?? 0),
            inactive: Number(stats.products?.inactive ?? 0),
          },
          orders: {
            total: Number(stats.orders?.total ?? 0),
            pending: Number(stats.orders?.pending ?? 0),
            inProgress: Number(
              stats.orders?.inProgress ?? stats.orders?.in_progress ?? 0
            ),
            completed: Number(stats.orders?.completed ?? 0),
          },
        },
        latestOrders: Array.isArray(orders) ? orders.map(mapLatestOrder) : [],
      };

      return mapped;
    },
  });
}
