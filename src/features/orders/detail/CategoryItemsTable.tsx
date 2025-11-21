"use client";
import { CardBox } from "@/shared/ui/cards";
import { Table } from "flowbite-react";
import { Order } from "@/entities/order/types";

interface Props {
  order: Order;
}

export default function CategoryItemsTable({ order }: Props) {
  const groups = order.grouped_products || [];
  if (!groups.length) return null;
  return (
    <div className="space-y-6">
      {groups.map((g, gi) => (
        <CardBox key={`${g.category_name}-${gi}`} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-800 dark:text-gray-100">
              {g.category_name || "بدون تصنيف"}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <Table className="table-fixed centered-table white-header min-w-[900px] ">
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
                {(g.products || []).map((p, idx) => (
                  <Table.Row
                    key={p.id}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs"
                  >
                    <Table.Cell>{idx + 1}</Table.Cell>
                    <Table.Cell>{p.product_name}</Table.Cell>
                    <Table.Cell>{p.unit_name}</Table.Cell>
                    <Table.Cell>{p.quantity}</Table.Cell>
                    <Table.Cell>{p.unit_price ?? "-"} د.ل</Table.Cell>
                    <Table.Cell>{p.line_total ?? "-"} د.ل</Table.Cell>
                    <Table.Cell>{p.notes ?? "-"}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </CardBox>
      ))}
    </div>
  );
}
