"use client";
import { Table } from "flowbite-react";
import type { Order } from "@/entities/order/types";
import Pagination from "@/shared/ui/catalog/Pagination";
import { useOrdersQuery } from "@/entities/order/api";
import { useOrdersFilters } from "./useOrdersFilters";
import { useMemo } from "react";
import { CardBox } from "@/shared/ui/cards";
import { OrdersTableSkeleton } from "./OrdersTableSkeleton";
import { useRouter } from "next/navigation";

export function OrdersTable() {
  const router = useRouter();
  const { filters } = useOrdersFilters();
  const page = filters.page ? Number(filters.page) : 1;
  const perPage = filters.per_page ? Number(filters.per_page) : 15;

  const queryParams = useMemo(
    () => ({
      page,
      per_page: perPage,
      search: filters.search,
      status: filters.status as any,
      department_id: filters.department_id,
      pickup_date: filters.pickup_date,
      date_from: filters.date_from,
      date_to: filters.date_to,
      user_id: filters.user_id ? Number(filters.user_id) : undefined,
    }),
    [filters, page, perPage]
  );

  const query = useOrdersQuery(queryParams as any);

  if (query.isLoading) return <OrdersTableSkeleton rows={8} />;
  if (query.isError)
    return (
      <p className="text-center text-sm text-red-500">فشل في تحميل الطلبات</p>
    );

  // After updating the mapper, query now returns normalized Order objects
  const items = query.data?.data as Order[] | undefined;
  if (!items || items.length === 0)
    return (
      <p className="text-center text-sm text-neutral-500">لا توجد طلبات</p>
    );
  const meta = query.data?.meta;

  // Helper to parse non-ISO date strings like "2025-11-06 18:09:45"
  const parseDateTime = (value?: string) => {
    if (!value) return null;
    // Replace space with 'T' to improve cross-browser compatibility.
    const isoCandidate = value.replace(" ", "T");
    const d = new Date(isoCandidate);
    return isNaN(d.getTime()) ? null : d;
  };
  return (
    <CardBox className="space-y-4">
      <div
        className="overflow-x-auto -mx-1 sm:mx-0"
        role="region"
        aria-label="جدول الطلبات قابل للتمرير أفقيًا في الشاشات الصغيرة"
        tabIndex={0}
      >
        <Table className="table-no-radius rounded-none centered-table white-header min-w-[900px] w-max text-xs sm:text-sm">
          <Table.Head className="border-b border-gray-200 text-xs whitespace-nowrap sticky top-0 bg-white z-10">
            <Table.HeadCell className="whitespace-nowrap">رقم الطلبية</Table.HeadCell>
            <Table.HeadCell className="whitespace-nowrap">الزبون</Table.HeadCell>
            <Table.HeadCell className="whitespace-nowrap">الهاتف</Table.HeadCell>
            <Table.HeadCell className="whitespace-nowrap">المبلغ الكلي</Table.HeadCell>
            <Table.HeadCell className="whitespace-nowrap">الحالة</Table.HeadCell>
            <Table.HeadCell className="whitespace-nowrap">تاريخ الطلب</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {items.map((o) => {
              const pickupDate =
                o.delivery_date || o.delivery_time
                  ? o.delivery_date ?? o.delivery_time
                  : null;
              const placedAt = parseDateTime(o.created_at);
              return (
                <Table.Row
                  key={o.id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400"
                  onClick={() => router.push(`/orders/${o.id}`)}
                  tabIndex={0}
                  role="button"
                  aria-label={`عرض الطلب رقم ${o.order_number}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/orders/${o.id}`);
                    }
                  }}
                >
                  {/* <Link
                      href={`/orders/${o.id}`}
                      aria-label={`عرض الطلب رقم ${o.order_number}`}
                      className="block w-full h-full no-underline text-gray-900 dark:text-white"
                    > */}
                  <Table.Cell className="whitespace-nowrap">{o.order_number}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap">{o.customer_name}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap">{o.customer_phone}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap">{o.formatted_total ?? o.total_amount}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap">{o.status_text || o.status}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {placedAt ? placedAt.toLocaleDateString("ar-LY") : "-"}
                  </Table.Cell>
                  {/* </Link> */}
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
        {/* Scroll hint */}
        <div className="sm:hidden text-[11px] text-gray-400 mt-2 pr-1" aria-hidden="true">
          اسحب أفقيًا لعرض بقية الأعمدة ←→
        </div>
      </div>
      {meta && <Pagination meta={meta} />}
    </CardBox>
  );
}
