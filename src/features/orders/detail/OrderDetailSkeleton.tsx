"use client";
import { CardBox } from "@/shared/ui/cards";
import { Table } from "flowbite-react";

function Bar({ w = "w-32" }: { w?: string }) {
  return (
    <div
      className={`h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse ${w}`}
    />
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb skeleton */}
      <CardBox className="space-y-3">
        <div className="flex items-center justify-between">
          <Bar w="w-24" />
          <div className="flex items-center gap-2">
            <Bar w="w-16" />
            <Bar w="w-12" />
          </div>
        </div>
        <div className="flex items-center gap-2 ms-auto">
          <Bar w="w-20" />
          <Bar w="w-4" />
          <Bar w="w-24" />
        </div>
      </CardBox>

      <div className="grid gap-6">
        {/* OrderInfoSection skeleton */}
        <CardBox className="space-y-6">
          <Bar w="w-28" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Bar w="w-20" />
                <Bar w="w-40" />
              </div>
            ))}
          </div>
        </CardBox>

        {/* CustomerSection skeleton */}
        <CardBox className="space-y-6">
          <Bar w="w-28" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Bar w="w-20" />
                <Bar w="w-40" />
              </div>
            ))}
          </div>
        </CardBox>

        {/* Category items table skeleton - mirrors CategoryItemsTable styling */}
        <CardBox className="space-y-4">
          {/* Category title */}
          <div className="flex items-center justify-between">
            <Bar w="w-24" />
          </div>
          <div className="overflow-x-auto">
            <Table className="table-fixed centered-table white-header min-w-[900px]">
              <Table.Head className="border-b border-gray-200 text-xs">
                <Table.HeadCell>#</Table.HeadCell>
                <Table.HeadCell>اسم الصنف</Table.HeadCell>
                <Table.HeadCell>الوحدة</Table.HeadCell>
                <Table.HeadCell>الكمية</Table.HeadCell>
                <Table.HeadCell>السعر للوحدة</Table.HeadCell>
                <Table.HeadCell>المجموع</Table.HeadCell>
                <Table.HeadCell>ملاحظات</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Table.Row
                    key={i}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800 text-xs"
                  >
                    <Table.Cell>
                      <div className="h-4 w-6 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    </Table.Cell>
                    <Table.Cell>
                      <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    </Table.Cell>
                    <Table.Cell>
                      <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    </Table.Cell>
                    <Table.Cell>
                      <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    </Table.Cell>
                    <Table.Cell>
                      <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    </Table.Cell>
                    <Table.Cell>
                      <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    </Table.Cell>
                    <Table.Cell>
                      <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
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

export default OrderDetailSkeleton;
