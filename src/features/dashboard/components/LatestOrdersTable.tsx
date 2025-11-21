"use client";

import { Table } from "flowbite-react";
import { useRouter } from "next/navigation";
import { CardBox } from "@/shared/ui/cards";
import type { LatestOrder } from "@/entities/home/types";

type Props = {
  orders: LatestOrder[];
};

const statusMap: Record<string, { label: string; className: string }> = {
  new: { label: "جديد", className: "bg-sky-100 text-sky-700" },
  pending: { label: "قيد الانتظار", className: "bg-amber-100 text-amber-700" },
  in_progress: { label: "قيد التنفيذ", className: "bg-blue-100 text-blue-700" },
  completed: { label: "مكتملة", className: "bg-green-100 text-green-700" },
  cancelled: { label: "ملغاة", className: "bg-red-100 text-red-700" },
};

export default function LatestOrdersTable({ orders }: Props) {
  const router = useRouter();
  // Align date parsing/formatting with OrdersTable for cross-browser safety
  const parseDateTime = (value?: string) => {
    if (!value) return null;
    const isoCandidate = value.replace(" ", "T");
    const d = new Date(isoCandidate);
    return isNaN(d.getTime()) ? null : d;
  };

  return (
    <CardBox className="space-y-4">
      <div className="mb-1 font-semibold">أحدث الطلبات</div>
      <div className="overflow-x-auto">
        <Table className="table-no-radius rounded-none centered-table white-header">
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
            {orders?.length ? (
              orders.map((o) => {
                const meta = statusMap[o.status] ?? {
                  label: o.status,
                  className: "bg-gray-100 text-gray-700",
                };
                const placedAt = parseDateTime(o.createdAt);
                return (
                  <Table.Row
                    key={o.id}
                    onClick={() => router.push(`/orders/${o.id}`)}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400"
                    tabIndex={0}
                    role="button"
                    aria-label={`عرض الطلب رقم ${o.orderNumber ?? o.id}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/orders/${o.id}`);
                      }
                    }}
                  >
                    <Table.Cell>{o.orderNumber ?? "—"}</Table.Cell>
                    <Table.Cell>{o.customerName}</Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      {o.customerPhone}
                    </Table.Cell>
                    <Table.Cell>{o.totalAmount}</Table.Cell>
                    <Table.Cell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${meta.className}`}
                      >
                        {meta.label}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {placedAt ? placedAt.toLocaleDateString("ar-LY") : "-"}
                    </Table.Cell>
                    <Table.Cell
                      className="max-w-[240px] truncate"
                      title={o.notes ?? undefined}
                    >
                      {o.notes ?? ""}
                    </Table.Cell>
                  </Table.Row>
                );
              })
            ) : (
              <Table.Row>
                <Table.Cell
                  colSpan={7}
                  className="py-6 text-center text-gray-400"
                >
                  لا توجد طلبات حديثة
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>
    </CardBox>
  );
}
