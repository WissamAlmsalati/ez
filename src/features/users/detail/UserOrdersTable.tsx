"use client";
import { CardBox } from "@/shared/ui/cards";
import { useOrdersQuery } from "@/entities/order/api";
import type { OrdersListParams } from "@/entities/order/types";
import { Table, Button } from "flowbite-react";
import Link from "next/link";

export default function UserOrdersTable({ userId }: { userId: number }) {
  const params: Partial<OrdersListParams> = {
    user_id: userId,
    per_page: 5,
    page: 1,
  };
  const query = useOrdersQuery(params as any);

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
        <Table className="table-fixed centered-table white-header">
          <Table.Head className="border-b border-gray-200">
            <Table.HeadCell>#</Table.HeadCell>
            <Table.HeadCell>الزبون</Table.HeadCell>
            <Table.HeadCell>الهاتف</Table.HeadCell>
            <Table.HeadCell>تاريخ الاستلام</Table.HeadCell>
            <Table.HeadCell>المبلغ الكلي</Table.HeadCell>
            <Table.HeadCell>الحالة</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {(query.data?.data ?? []).map((o) => (
              <Table.Row key={o.id} className="bg-white">
                <Table.Cell>{o.order_number}</Table.Cell>
                <Table.Cell>{o.customer_name}</Table.Cell>
                <Table.Cell>{o.customer_phone}</Table.Cell>
                <Table.Cell>
                  {o.delivery_date
                    ? new Date(o.delivery_date).toLocaleDateString("ar-LY")
                    : "-"}
                </Table.Cell>
                <Table.Cell>{o.formatted_total ?? o.total_amount}</Table.Cell>
                <Table.Cell>{o.status_text || o.status}</Table.Cell>
                <Table.Cell>
                  <Button
                    as={Link}
                    href={`/orders/${o.id}`}
                    size="xs"
                    color="light"
                  >
                    عرض
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
            {query.isLoading && (
              <Table.Row>
                <Table.Cell
                  colSpan={7}
                  className="text-center text-sm text-gray-500"
                >
                  جاري التحميل...
                </Table.Cell>
              </Table.Row>
            )}
            {!query.isLoading && (query.data?.data?.length ?? 0) === 0 && (
              <Table.Row>
                <Table.Cell
                  colSpan={7}
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
