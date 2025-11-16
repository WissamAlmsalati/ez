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
        <CardBox className="p-5 space-y-4 h-80">
          <div className="flex w-full justify-around place-items-end">
            <div className={`${pulse} h-32 w-12`} />
            <div className={`${pulse} h-24 w-12`} />
            <div className={`${pulse} h-40 w-12`} />
          </div>
        </CardBox>
      </div>
      <div className="xl:col-span-4">
        <CardBox className="p-5 space-y-4 h-80">
          <div className="flex w-full justify-around place-items-end">
            <div className={`${pulse} h-32 w-12`} />
            <div className={`${pulse} h-36 w-12`} />
            <div className={`${pulse} h-28 w-12`} />
          </div>
        </CardBox>
      </div>
       <div className="xl:col-span-4">
        <CardBox className="p-5 space-y-4 h-80">
          <div className="flex w-full justify-around place-items-end">
            <div className={`${pulse} h-16 w-12`} />
            <div className={`${pulse} h-24 w-12`} />
            <div className={`${pulse} h-40 w-12`} />
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
