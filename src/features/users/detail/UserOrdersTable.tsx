"use client";
import { CardBox } from "@/shared/ui/cards";
import { useOrdersQuery } from "@/entities/order/api";
import type { OrdersListParams } from "@/entities/order/types";
import { Table, Button } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserOrdersTable({ userId }: { userId: number }) {
  const router = useRouter();
  const params: Partial<OrdersListParams> = {
    user_id: userId,
    per_page: 5,
    page: 1,
  };
  const query = useOrdersQuery(params as any);

  // Align date parsing/formatting with the main OrdersTable component
  const parseDateTime = (value?: string) => {
    if (!value) return null;
    const isoCandidate = value.replace(" ", "T");
    const d = new Date(isoCandidate);
    return isNaN(d.getTime()) ? null : d;
  };

  return (
    <CardBox className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">آخر الطلبات</h3>
        <Button
          as={Link}
          href={`/orders?user_id=${userId}`}
          size="xs"
          color="light"
        >
          عرض الكل
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table className="table-no-radius rounded-none table-fixed centered-table white-header">
          <Table.Head className="border-b border-gray-200 text-xs">
            <Table.HeadCell>رقم الطلبية</Table.HeadCell>
            <Table.HeadCell>الهاتف</Table.HeadCell>
            <Table.HeadCell>المبلغ الكلي</Table.HeadCell>
            <Table.HeadCell>الحالة</Table.HeadCell>
            <Table.HeadCell>تاريخ الطلب</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {(query.data?.data ?? []).map((o) => {
              const placedAt = parseDateTime(o.created_at);
              return (
                <Table.Row
                  key={o.id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:cursor-pointer text-xs"
                  onClick={() => router.push(`/orders/${o.id}`)}
                >
                  <Table.Cell>{o.order_number}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {o.customer_phone}
                  </Table.Cell>
                  <Table.Cell>{o.formatted_total ?? o.total_amount}</Table.Cell>
                  <Table.Cell>{o.status_text || o.status}</Table.Cell>
                  <Table.Cell>
                    {placedAt ? placedAt.toLocaleDateString("ar-LY") : "-"}
                  </Table.Cell>
                </Table.Row>
              );
            })}
            {query.isLoading && (
              <Table.Row>
                <Table.Cell
                  colSpan={6}
                  className="text-center text-sm text-gray-500"
                >
                  جاري التحميل...
                </Table.Cell>
              </Table.Row>
            )}
            {!query.isLoading && (query.data?.data?.length ?? 0) === 0 && (
              <Table.Row>
                <Table.Cell
                  colSpan={6}
                  className="text-center text-sm text-gray-500"
                >
                  لا توجد طلبات
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>
    </CardBox>
  );
}
