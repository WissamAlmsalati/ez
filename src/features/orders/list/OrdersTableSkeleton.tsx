"use client";
import { Table } from "flowbite-react";
import { CardBox } from "@/shared/ui/cards";

interface SkeletonProps {
  rows?: number;
}

const cellBase = "h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse";

export function OrdersTableSkeleton({ rows = 8 }: SkeletonProps) {
  const arr = Array.from({ length: rows });
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
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {arr.map((_, i) => (
              <Table.Row
                key={i}
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                <Table.Cell>
                  <div className={`${cellBase} w-10`} />
                </Table.Cell>
                <Table.Cell>
                  <div className={`${cellBase} w-28`} />
                </Table.Cell>
                <Table.Cell>
                  <div className={`${cellBase} w-24`} />
                </Table.Cell>
                <Table.Cell>
                  <div className={`${cellBase} w-24`} />
                </Table.Cell>
                <Table.Cell>
                  <div className={`${cellBase} w-20`} />
                </Table.Cell>
                <Table.Cell>
                  <div className={`${cellBase} w-40`} />
                </Table.Cell>
                <Table.Cell>
                  <div className={`${cellBase} w-16`} />
                </Table.Cell>
                <Table.Cell>
                  <div className={`${cellBase} w-24`} />
                </Table.Cell>
                <Table.Cell>
                  <div className={`${cellBase} w-12`} />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </CardBox>
  );
}

export default OrdersTableSkeleton;
