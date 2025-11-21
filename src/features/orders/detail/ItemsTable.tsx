"use client";
import { Order } from "@/entities/order/types";
import { CardBox } from "@/shared/ui/cards";
import { Table } from "flowbite-react";

export function ItemsTable({ order }: { order: Order }) {
  const items = order.items || [];
  return (
    <CardBox className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-800 dark:text-gray-100">
          كل الأصناف
        </h3>
      </div>
      <div className="overflow-x-auto">
        <Table className="min-w-[900px]">
          <Table.Head>
            <Table.HeadCell>#</Table.HeadCell>
            <Table.HeadCell>اسم الصنف</Table.HeadCell>
            <Table.HeadCell>الوحدة</Table.HeadCell>
            <Table.HeadCell>الكمية / الحجم</Table.HeadCell>
            <Table.HeadCell>السعر للوحدة</Table.HeadCell>
            <Table.HeadCell>المجموع</Table.HeadCell>
            <Table.HeadCell>ملاحظات</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {items.map((it, idx) => {
              const unit = it.product_unit?.unit;
              return (
                <Table.Row key={it.id} className="bg-white dark:bg-gray-800">
                  <Table.Cell>{idx + 1}</Table.Cell>
                  <Table.Cell>
                    {String(it.product_unit?.product || "-")}
                  </Table.Cell>
                  <Table.Cell>{unit?.name || "-"}</Table.Cell>
                  <Table.Cell>{`${it.quantity} / ${
                    it.product_unit?.unit_size ?? ""
                  }`}</Table.Cell>
                  <Table.Cell>{it.unit_price}</Table.Cell>
                  <Table.Cell>{it.total_price}</Table.Cell>
                  <Table.Cell>{it.notes || "-"}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>
    </CardBox>
  );
}

export default ItemsTable;
