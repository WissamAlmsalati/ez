"use client";
import { CardBox } from "@/shared/ui/cards";
import { useOrdersQuery } from "@/entities/order/api";
import type { OrdersListParams } from "@/entities/order/types";
import { Table, Button } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserOrdersTable({ userId }: { userId: number }) {
  const router = useRouter();
  const params: Partial<OrdersListParams> = {
    user_id: userId,
    per_page: 5,
    page: 1,
  };
  const query = useOrdersQuery(params as any);

  // Align date parsing/formatting with the main OrdersTable component
  const parseDateTime = (value?: string) => {
    if (!value) return null;
    const isoCandidate = value.replace(" ", "T");
    const d = new Date(isoCandidate);
    return isNaN(d.getTime()) ? null : d;
  };

  return (
    <CardBox className="space-y-4">
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
      {/* Responsive scroll wrapper matching main orders table */}
      <div
        className="overflow-x-auto -mx-1 sm:mx-0"
        role="region"
        aria-label="آخر طلبات المستخدم (اسحب أفقيًا على الشاشات الصغيرة)"
        tabIndex={0}
      >
        <Table className="table-no-radius rounded-none centered-table white-header min-w-[900px] w-max text-xs sm:text-sm">
          <Table.Head className="border-b border-gray-200 text-xs whitespace-nowrap sticky top-0 bg-white z-10">
            <Table.HeadCell className="whitespace-nowrap">
              رقم الطلبية
            </Table.HeadCell>
            <Table.HeadCell className="whitespace-nowrap">
              الهاتف
            </Table.HeadCell>
            <Table.HeadCell className="whitespace-nowrap">
              المبلغ الكلي
            </Table.HeadCell>
            <Table.HeadCell className="whitespace-nowrap">
              الحالة
            </Table.HeadCell>
            <Table.HeadCell className="whitespace-nowrap">
              تاريخ الطلب
            </Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {(query.data?.data ?? []).map((o) => {
              const placedAt = parseDateTime(o.created_at);
              return (
                <Table.Row
                  key={o.id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400"
                  onClick={() => router.push(`/orders/${o.id}`)}
                  tabIndex={0}
                  role="button"
                  aria-label={`عرض الطلب رقم ${o.order_number}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/orders/${o.id}`);
                    }
                  }}
                >
                  <Table.Cell className="whitespace-nowrap">
                    {o.order_number}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {o.customer_phone}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {o.formatted_total ?? o.total_amount}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {o.status_text || o.status}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {placedAt ? placedAt.toLocaleDateString("ar-LY") : "-"}
                  </Table.Cell>
                </Table.Row>
              );
            })}
            {query.isLoading && (
              <Table.Row>
                <Table.Cell
                  colSpan={6}
                  className="text-center text-sm text-gray-500"
                >
                  جاري التحميل...
                </Table.Cell>
              </Table.Row>
            )}
            {!query.isLoading && (query.data?.data?.length ?? 0) === 0 && (
              <Table.Row>
                <Table.Cell
                  colSpan={6}
                  className="text-center text-sm text-gray-500"
                >
                  لا توجد طلبات
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
        {/* Scroll hint for mobile */}
        <div
          className="sm:hidden text-[11px] text-gray-400 mt-2 pr-1"
          aria-hidden="true"
        >
          اسحب أفقيًا لعرض بقية الأعمدة ←→
        </div>
      </div>
    </CardBox>
  );
}
