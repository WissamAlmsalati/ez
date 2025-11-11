"use client";
import { CardBox } from "@/shared/ui/cards";
import { Table } from "flowbite-react";

// Skeleton block (pulse) helper
const pulse = "animate-pulse bg-gray-200 dark:bg-gray-700 rounded";

export default function HomeStatsSkeleton() {
  return (
    <div className="grid gap-5 xl:grid-cols-12">
      {/* Top row cards */}
      <div className="xl:col-span-4">
        <CardBox className="p-5 space-y-4">
          <div className={`${pulse} h-5 w-32`} />
          <div className={`${pulse} h-8 w-24`} />
          <div className={`${pulse} h-4 w-40`} />
        </CardBox>
      </div>
      <div className="xl:col-span-4">
        <CardBox className="p-5 space-y-4">
          <div className={`${pulse} h-5 w-40`} />
          <div className="flex gap-3">
            <div className={`${pulse} h-16 w-16`} />
            <div className={`${pulse} h-16 w-16`} />
            <div className={`${pulse} h-16 w-16`} />
          </div>
        </CardBox>
      </div>
      <div className="xl:col-span-4">
        <CardBox className="p-5 space-y-4">
          <div className={`${pulse} h-5 w-36`} />
          <div className="flex gap-3">
            <div className={`${pulse} h-16 w-20`} />
            <div className={`${pulse} h-16 w-20`} />
          </div>
        </CardBox>
      </div>

      {/* Latest orders table skeleton */}
      <div className="xl:col-span-12">
        <CardBox className="space-y-4">
          <div className="mb-1 font-semibold">أحدث الطلبات</div>
          <div className="overflow-x-auto">
            <Table className="table-fixed centered-table white-header">
              <Table.Head className="border-b border-gray-200 text-xs">
                <Table.HeadCell>رقم الطلبية</Table.HeadCell>
                <Table.HeadCell>الزبون</Table.HeadCell>
                <Table.HeadCell>الهاتف</Table.HeadCell>
                <Table.HeadCell>المبلغ</Table.HeadCell>
                <Table.HeadCell>الحالة</Table.HeadCell>
                <Table.HeadCell>تاريخ الطلب</Table.HeadCell>
                <Table.HeadCell>ملاحظات</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Table.Row
                    key={i}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Table.Cell>
                      <div className={`${pulse} h-4 w-12`} />
                    </Table.Cell>
                    <Table.Cell>
                      <div className={`${pulse} h-4 w-24`} />
                    </Table.Cell>
                    <Table.Cell>
                      <div className={`${pulse} h-4 w-20`} />
                    </Table.Cell>
                    <Table.Cell>
                      <div className={`${pulse} h-4 w-16`} />
                    </Table.Cell>
                    <Table.Cell>
                      <div className={`${pulse} h-4 w-14`} />
                    </Table.Cell>
                    <Table.Cell>
                      <div className={`${pulse} h-4 w-20`} />
                    </Table.Cell>
                    <Table.Cell>
                      <div className={`${pulse} h-4 w-32`} />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </CardBox>
      </div>
    </div>
  );
}
