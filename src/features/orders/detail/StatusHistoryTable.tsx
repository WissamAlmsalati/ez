"use client";
import { Order } from "@/entities/order/types";
import { CardBox } from "@/shared/ui/cards";
import { Table, Badge } from "flowbite-react";

export function StatusHistoryTable({ order }: { order: Order }) {
  const history = order.status_history || [];
  return (
    <CardBox className="space-y-4">
      <h3 className="font-medium text-gray-800 dark:text-gray-100">
        سجل الحالات
      </h3>
      <div className="overflow-x-auto">
        <Table className="min-w-[900px]">
          <Table.Head>
            <Table.HeadCell>#</Table.HeadCell>
            <Table.HeadCell>الحالة السابقة</Table.HeadCell>
            <Table.HeadCell>الحالة الجديدة</Table.HeadCell>
            <Table.HeadCell>المستخدم</Table.HeadCell>
            <Table.HeadCell>ملاحظات</Table.HeadCell>
            <Table.HeadCell>تاريخ التغيير</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {history.map((h, idx) => (
              <Table.Row key={h.id} className="bg-white dark:bg-gray-800">
                <Table.Cell>{idx + 1}</Table.Cell>
                <Table.Cell>
                    {h.previous_status}
                </Table.Cell>
                <Table.Cell>
                  {h.new_status}
                </Table.Cell>
                <Table.Cell>{h.changed_by_user?.name || "-"}</Table.Cell>
                <Table.Cell>{h.notes || "-"}</Table.Cell>
                <Table.Cell>
                  {h.changed_at
                    ? new Date(h.changed_at).toLocaleDateString("ar-LY")
                    : "-"}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </CardBox>
  );
}

export default StatusHistoryTable;
