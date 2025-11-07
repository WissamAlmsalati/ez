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
      <div className="overflow-x-auto">
        <Table className="table-fixed centered-table white-header">
          <Table.Head className="border-b border-gray-200 text-xs">
            <Table.HeadCell>رقم الطلبية</Table.HeadCell>
            <Table.HeadCell>الزبون</Table.HeadCell>
            <Table.HeadCell>الهاتف</Table.HeadCell>
            {/* <Table.HeadCell>تاريخ الاستلام</Table.HeadCell> */}
            <Table.HeadCell>المبلغ الكلي</Table.HeadCell>
            {/* <Table.HeadCell>ملاحظات</Table.HeadCell> */}
            <Table.HeadCell>الحالة</Table.HeadCell>
            <Table.HeadCell>تاريخ الطلب</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {items.map((o) => {
              const pickupDate = o.delivery_date || o.delivery_time ? o.delivery_date ?? o.delivery_time : null;
              const placedAt = parseDateTime(o.created_at);
              return (
                <Table.Row
                  key={o.id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:cursor-pointer text-xs"
                  onClick={ () => router.push(`/orders/${o.id}`)}
                  >
                  {/* <Link
                      href={`/orders/${o.id}`}
                      aria-label={`عرض الطلب رقم ${o.order_number}`}
                      className="block w-full h-full no-underline text-gray-900 dark:text-white"
                    > */}
                  <Table.Cell 
                  // className="whitespace-nowrap font-medium text-gray-900 dark:text-white"
                  >
                      {o.order_number}                  
                  </Table.Cell>
                  <Table.Cell>
                      {o.customer_name}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap ">
                      {o.customer_phone}
                  </Table.Cell>
                  {/* <Table.Cell>
                      {pickupDate ? new Date(pickupDate).toLocaleDateString("ar-EG") : "-"}
                  </Table.Cell> */}
                  <Table.Cell>
                      {o.formatted_total ?? o.total_amount}
                  </Table.Cell>
                  {/* <Table.Cell className="max-w-[200px] truncate">
                    <Link
                      href={`/orders/${o.id}`}
                      title={o.notes || ""}
                      className="block w-full h-full no-underline text-current"
                    >
                      {o.notes
                        ? o.notes.length > 40
                          ? o.notes.slice(0, 40) + "…"
                          : o.notes
                        : "-"}
                    </Link>
                  </Table.Cell> */}
                  <Table.Cell>
                      {o.status_text || o.status}
                  </Table.Cell>
                  <Table.Cell>

                      {placedAt ? placedAt.toLocaleDateString("ar-LY") : "-"}
                  </Table.Cell>
                  {/* </Link> */}
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>
      {meta && <Pagination meta={meta} />}
    </CardBox>
  );
}
