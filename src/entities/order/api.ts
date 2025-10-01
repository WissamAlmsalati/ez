import { buildListQuery, catalogKeys } from "@/entities/catalog/api";
import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/shared/api/axios";
import type { OrdersListParams, Order } from "./types";

export const ORDERS_PATH = "/orders";

export const orderKeys = {
  ...catalogKeys,
  base: () => catalogKeys.byPath(ORDERS_PATH),
  list: (params?: OrdersListParams) => catalogKeys.list(ORDERS_PATH, params),
  detail: (id: number | string) => catalogKeys.detail(ORDERS_PATH, id),
};

// Transport -> domain mapper: normalize order_id to id and include status_text
export function mapOrderApi(raw: any): Order {
  return {
    // humps.camelizeKeys يحول order_id -> orderId لذلك ندعم الاحتمالين
    id: raw.order_id ?? raw.orderId ?? raw.id,
    order_number: raw.order_number ?? raw.orderNumber,
    user_id: raw.user_id ?? raw.userId ?? 0,
    customer_name: raw.customer_name ?? raw.customerName ?? "غير محدد",
    customer_phone: raw.customer_phone ?? raw.customerPhone ?? "غير محدد",
    delivery_date:
      raw.delivery_date ??
      raw.deliveryDate ??
      raw.pickup_date ??
      raw.pickupDate ??
      null,
    delivery_time:
      raw.delivery_time ??
      raw.deliveryTime ??
      raw.pickup_time ??
      raw.pickupTime ??
      null,
    delivery_address: raw.delivery_address ?? raw.deliveryAddress ?? null,
    notes: raw.notes ?? null,
    total_amount: Number(raw.total_amount ?? raw.totalAmount ?? 0),
    formatted_total: raw.formatted_total ?? raw.formattedTotal,
    status: raw.status,
    status_text: raw.status_text ?? raw.statusText,
    created_at: raw.created_at ?? raw.createdAt,
    updated_at: raw.updated_at ?? raw.updatedAt,
    items: raw.items ?? [],
    departments: raw.departments ?? [],
    status_history: raw.status_history ?? raw.statusHistory ?? [],
    items_count: raw.items_count ?? raw.itemsCount,
    departments_count: raw.departments_count ?? raw.departmentsCount,
    items_summary: raw.items_summary ?? raw.itemsSummary ?? [],
  };
}

export const useOrdersQuery = buildListQuery<any, Order>(
  ORDERS_PATH,
  mapOrderApi
);

// Single order detail query
export function useOrderQuery(id: number | string | undefined) {
  return useQuery({
    queryKey: id ? orderKeys.detail(id) : [ORDERS_PATH, "detail", id],
    queryFn: async () => {
      if (!id) throw new Error("Order id is required");
      const { data } = await apiInstance.get(`${ORDERS_PATH}/${id}`);
      return mapOrderApi(data.data ?? data);
    },
    enabled: !!id,
  });
}
