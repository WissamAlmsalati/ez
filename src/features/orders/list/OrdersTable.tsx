"use client";
import { Table } from "flowbite-react";
import type { Order } from "@/entities/order/types";
import Link from "next/link";
import Pagination from "@/shared/ui/catalog/Pagination";
import { useOrdersQuery } from "@/entities/order/api";
import { useOrdersFilters } from "./useOrdersFilters";
import { useMemo } from "react";
import { CardBox } from "@/shared/ui/cards";
import { OrdersTableSkeleton } from "./OrdersTableSkeleton";

export function OrdersTable() {
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

  const items = query.data?.data as Order[] | undefined;
  if (!items || items.length === 0)
    return (
      <p className="text-center text-sm text-neutral-500">لا توجد طلبات</p>
    );
  const meta = query.data?.meta;

  return (
    <CardBox className="space-y-4">
      <div className="overflow-x-auto">
        <Table className="table-fixed centered-table white-header">
          <Table.Head className="border-b border-gray-200">
            <Table.HeadCell>#</Table.HeadCell>
            <Table.HeadCell>الزبون</Table.HeadCell>
            <Table.HeadCell>الهاتف</Table.HeadCell>
            <Table.HeadCell>تاريخ الاستلام</Table.HeadCell>
            <Table.HeadCell>المبلغ الكلي</Table.HeadCell>
            <Table.HeadCell>ملاحظات</Table.HeadCell>
            <Table.HeadCell>الحالة</Table.HeadCell>
            <Table.HeadCell>تاريخ الطلب</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {items.map((o) => {
              const pickupDate =
                o.delivery_date || o.delivery_time
                  ? o.delivery_date ?? o.delivery_time
                  : null;
              return (
                <Table.Row
                  key={o.id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    <Link
                      href={`/orders/${o.id}`}
                      aria-label={`عرض الطلب رقم ${o.order_number}`}
                      className="block w-full h-full no-underline text-gray-900 dark:text-white"
                    >
                      {o.order_number}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      href={`/orders/${o.id}`}
                      className="block w-full h-full no-underline text-current"
                    >
                      {o.customer_name}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      href={`/orders/${o.id}`}
                      className="block w-full h-full no-underline text-current"
                    >
                      {o.customer_phone}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      href={`/orders/${o.id}`}
                      className="block w-full h-full no-underline text-current"
                    >
                      {pickupDate
                        ? new Date(pickupDate).toLocaleDateString("ar-EG")
                        : "-"}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      href={`/orders/${o.id}`}
                      className="block w-full h-full no-underline text-current"
                    >
                      {o.formatted_total ?? o.total_amount}
                    </Link>
                  </Table.Cell>
                  <Table.Cell className="max-w-[200px] truncate">
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
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      href={`/orders/${o.id}`}
                      className="block w-full h-full no-underline text-current"
                    >
                      {o.status_text || o.status}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      href={`/orders/${o.id}`}
                      className="block w-full h-full no-underline text-current"
                    >
                      {o.created_at
                        ? new Date(o.created_at).toLocaleDateString("ar-LY")
                        : "-"}
                    </Link>
                  </Table.Cell>
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
