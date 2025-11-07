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
  console.log("Mapping order raw data:", raw);
  // NEW API WRAPS FIELDS INSIDE order_details & customer_details
  const od = raw?.orderDetails ?? raw;
  const cd = raw?.customerDetails ?? raw;
  const products = raw?.products;

  const parseNumber = (v: any) => {
    if (v == null) return 0;
    if (typeof v === "number") return v;
    if (typeof v === "string") return Number(v.replace(/,/g, "")) || 0;
    return 0;
  };

  return {
    // Support both old flat shape and new nested shape
    id: od.order_id ?? od.orderId ?? od.id,
    order_number: od.order_number ?? od.orderNumber,
    user_id: od.user_id ?? od.userId ?? 0,
    customer_name: cd.name ?? cd.customer_name ?? cd.customerName ?? "غير محدد",
    customer_phone:
      cd.phone ?? cd.customer_phone ?? cd.customerPhone ?? "غير محدد",
    delivery_date:
      od.delivery_date ??
      od.deliveryDate ??
      od.pickup_date ??
      od.pickupDate ??
      null,
    delivery_time:
      od.delivery_time ??
      od.deliveryTime ??
      od.pickup_time ??
      od.pickupTime ??
      null,
    delivery_address: od.delivery_address ?? od.deliveryAddress ?? null,
    notes: od.notes ?? null,
    total_amount: parseNumber(od.total_amount ?? od.totalAmount),
    formatted_total: od.formatted_total ?? od.formattedTotal,
    status: od.status,
    status_text: od.status_text ?? od.statusText,
    created_at: od.created_at ?? od.createdAt ?? od.placed_at,
    updated_at: od.updated_at ?? od.updatedAt,
    // Preserve old optional arrays, fallback to nested products mapping for summary
    items: od.items ?? raw.items ?? [],
    departments: od.departments ?? raw.departments ?? [],
    status_history:
      od.status_history ??
      raw.status_history ??
      od.statusHistory ??
      raw.statusHistory ??
      [],
    items_count: od.items_count ?? od.itemsCount,
    departments_count: od.departments_count ?? od.departmentsCount,
    items_summary:
      od.items_summary ??
      od.itemsSummary ??
      (products
        ? products.map((p: any) => ({
            product_name: p.product_name ?? p.name,
            quantity: p.quantity,
            unit_name: p.unit_name,
            total_price: p.line_total ?? null,
          }))
        : []),
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
