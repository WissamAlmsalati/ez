"use client";
import { Order } from "@/entities/order/types";
import { CardBox } from "@/shared/ui/cards";
import { Table, Badge } from "flowbite-react";

export function DepartmentsTable({ order }: { order: Order }) {
  const departments = order.departments || [];
  return (
    <CardBox className="space-y-4">
      <h3 className="font-medium text-gray-800 dark:text-gray-100">الأقسام</h3>
      <div className="overflow-x-auto">
        <Table className="min-w-[900px]">
          <Table.Head>
            <Table.HeadCell>#</Table.HeadCell>
            <Table.HeadCell>القسم</Table.HeadCell>
            <Table.HeadCell>الموظف</Table.HeadCell>
            <Table.HeadCell>الحالة</Table.HeadCell>
            <Table.HeadCell>تاريخ التعيين</Table.HeadCell>
            <Table.HeadCell>تاريخ الإكمال</Table.HeadCell>
            <Table.HeadCell>ملاحظات</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {departments.map((d, idx) => (
              <Table.Row key={d.id} className="bg-white dark:bg-gray-800">
                <Table.Cell>{idx + 1}</Table.Cell>
                <Table.Cell>{d.department?.name || "-"}</Table.Cell>
                <Table.Cell>{d.assigned_employee?.name || "-"}</Table.Cell>
                <Table.Cell>
                  {d.status}
                </Table.Cell>
                <Table.Cell>
                  {d.assigned_at
                    ? new Date(d.assigned_at).toLocaleDateString("ar-LY")
                    : "-"}
                </Table.Cell>
                <Table.Cell>
                  {d.completed_at
                    ? new Date(d.completed_at).toLocaleDateString("ar-LY")
                    : "-"}
                </Table.Cell>
                <Table.Cell>{d.notes || "-"}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </CardBox>
  );
}

export default DepartmentsTable;
