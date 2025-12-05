"use client";
import { CardBox } from "@/shared/ui/cards";
import { Button, Modal, Table } from "flowbite-react";
import { Order } from "@/entities/order/types";
import { useState } from "react";
import Image from "next/image";

interface Props {
  order: Order;
}

export default function CategoryItemsTable({ order }: Props) {
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
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
            <Table className="table-no-radius rounded-none table-fixed centered-table white-header min-w-[900px]" >
              <Table.Head className="border-b border-gray-200 text-xs">
                <Table.HeadCell>#</Table.HeadCell>
                <Table.HeadCell>اسم الصنف</Table.HeadCell>
                <Table.HeadCell>الوحدة</Table.HeadCell>
                <Table.HeadCell>الكمية</Table.HeadCell>
                <Table.HeadCell>السعر للوحدة</Table.HeadCell>
                <Table.HeadCell>المجموع</Table.HeadCell>
                <Table.HeadCell>ملاحظات</Table.HeadCell>
                <Table.HeadCell>صورة</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {(g.products || []).map((p, idx) => (
                  <Table.Row
                    key={p.id}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs"
                  >
                    <Table.Cell>{idx + 1}</Table.Cell>
                    <Table.Cell>{p.product_name}</Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      {p.unit_name}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      {p.quantity}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      {p.unit_price ?? "-"}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      {p.line_total ?? "-"}
                    </Table.Cell>
                    <Table.Cell
                      className="max-w-[240px] truncate"
                      title={p.notes?.desc ?? undefined}
                    >
                      {p.notes?.desc ?? "-"}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      {p.notes?.desc_image ? (
                        <button
                          type="button"
                          // onClick={() => handleOpenImage(p.notes?.desc_image)}
                          onClick={() => {
                            setImageSrc(p.notes?.desc_image ?? null);
                            setOpen(true);}}
                          className="text-primary hover:text-primaryemphasis"
                          aria-label="عرض الصورة"
                          title="عرض الصورة"
                        >
                          {/* simple image icon */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-5 h-5"
                          >
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5a2 2 0 0 0-2-2Zm0 16H5V5h14v14ZM8.5 11.5A2.5 2.5 0 1 0 8.5 6.5a2.5 2.5 0 0 0 0 5Zm10 6.5H6l3.5-4.5 2.5 3 3.5-4.5 3 6Z" />
                          </svg>
                        </button>
                      ) : (
                        "-"
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </CardBox>
      ))}

      <Modal show={open} onClose={() => setOpen(false)} size="xl">
        <Modal.Body className="p-2">
          <Button  className="absolute top-3 left-3 rounded-full p-0 bg-white text-gray-400 hover:bg-gray-100" onClick={() => setOpen(false)} size={"sm"}>X</Button>
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt="ملاحظة الطلب"
              width={600}
              height={600}
              className="max-h-[70vh] mx-auto rounded-lg" 
            />
          ) : (
            <div className="text-center text-gray-500">لا توجد صورة</div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
