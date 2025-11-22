"use client";

import React, { useMemo, useState } from "react";
import {
  useOrderWindowsQuery,
  useToggleOrderWindow,
  useUpdateOrderWindow,
} from "@/entities/order-window/api";
import type { OrderWindow } from "@/entities/order-window/types";
import { CardBox } from "@/shared/ui/cards";
import { Button, Label, Table, TextInput } from "flowbite-react";

type EditState = {
  [id: number]: { start_time: string; end_time: string } | undefined;
};

const daysMap: Record<number, string> = {
  0: "الأحد",
  1: "الاثنين",
  2: "الثلاثاء",
  3: "الأربعاء",
  4: "الخميس",
  5: "الجمعة",
  6: "السبت",
};

export default function OrderWindowsSection() {
  const { data: windows = [], isLoading } = useOrderWindowsQuery();
  const [edit, setEdit] = useState<EditState>({});

  const grouped = useMemo(() => {
    const map = new Map<number, OrderWindow[]>();
    (windows || []).forEach((w) => {
      const arr = map.get(w.dayOfWeek) || [];
      arr.push(w);
      map.set(w.dayOfWeek, arr);
    });
    return map;
  }, [windows]);

  return (
    <div className="space-y-4">
        {/* <div className="mb-2">
          <h2 className="text-lg font-semibold">أوقات السماح للطلبات</h2>
          <p className="text-sm text-gray-500">
            تحكم في الفترات الزمنية المسموح بها لكل يوم.
          </p>
        </div> */}
        {isLoading ? (
          <div className="text-sm text-gray-500">جاري التحميل...</div>
        ) : (
          <div className="space-y-6">
            {Array.from(grouped.entries())
              .sort((a, b) => a[0] - b[0])
              .map(([dow, list]) => (
                <DayBlock
                  key={`day-${dow}`}
                  dow={dow}
                  items={list}
                  edit={edit}
                  setEdit={setEdit}
                />
              ))}
          </div>
        )}
    </div>
  );
}

function DayBlock({
  dow,
  items,
  edit,
  setEdit,
}: {
  dow: number;
  items: OrderWindow[];
  edit: EditState;
  setEdit: React.Dispatch<React.SetStateAction<EditState>>;
}) {
  return (
    <CardBox className="p-4 ">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-medium">
          {daysMap[dow] ?? items[0]?.dayName}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <Table className="table-fixed centered-table white-header">
          <Table.Head className="border-b border-gray-200">
            <Table.HeadCell>الفترة</Table.HeadCell>
            <Table.HeadCell>الحالة</Table.HeadCell>
            <Table.HeadCell>إجراءات</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {items
              .filter(Boolean)
              .slice()
              .sort((a, b) => {
                const as = (a?.startTime as string) || "";
                const bs = (b?.startTime as string) || "";
                return as.localeCompare(bs);
              })
              .map((w) => (
                <OrderWindowRow
                  key={`win-${
                    w.id ?? `${w.dayOfWeek}-${w.startTime}-${w.endTime}`
                  }`}
                  w={w}
                  edit={edit}
                  setEdit={setEdit}
                />
              ))}
          </Table.Body>
        </Table>
      </div>
    </CardBox>
  );
}

function OrderWindowRow({
  w,
  edit,
  setEdit,
}: {
  w: OrderWindow;
  edit: EditState;
  setEdit: React.Dispatch<React.SetStateAction<EditState>>;
}) {
  const isEditing = !!edit[w.id];
  const toggle = useToggleOrderWindow(w.id);
  const update = useUpdateOrderWindow(w.id);

  const current = edit[w.id] ?? {
    start_time: w.startTime,
    end_time: w.endTime,
  };

  return (
    <Table.Row className="bg-white">
      <Table.Cell>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">من</Label>
              <TextInput
                type="time"
                value={(current.start_time ?? "").slice(0, 5)}
                onChange={(e) =>
                  setEdit((s) => ({
                    ...s,
                    [w.id]: {
                      ...current,
                      start_time: e.target.value ? e.target.value + ":00" : "",
                    },
                  }))
                }
                className="w-[140px]"
              />
            </div>
            <span>–</span>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">إلى</Label>
              <TextInput
                type="time"
                value={(current.end_time ?? "").slice(0, 5)}
                onChange={(e) =>
                  setEdit((s) => ({
                    ...s,
                    [w.id]: {
                      ...current,
                      end_time: e.target.value ? e.target.value + ":00" : "",
                    },
                  }))
                }
                className="w-[140px]"
              />
            </div>
          </div>
        ) : (
          <span className="font-medium">
            {(w.startTime ?? "").slice(0, 5) || "--:--"} -{" "}
            {(w.endTime ?? "").slice(0, 5) || "--:--"}
          </span>
        )}
      </Table.Cell>
      <Table.Cell>
        <span
          className={`rounded-full px-2 py-1 text-xs ${
            w.isActive
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {w.isActive ? "مفعل" : "معطل"}
        </span>
      </Table.Cell>
      <Table.Cell>
        <div className="flex items-center justify-center gap-2">
          <Button
            size="xs"
            color="light"
            onClick={() => toggle.mutate()}
            disabled={toggle.isPending}
          >
            {w.isActive ? "تعطيل" : "تفعيل"}
          </Button>
          {isEditing ? (
            <>
              <Button
                size="xs"
                color="dark"
                onClick={() =>
                  update.mutate(
                    {
                      startTime: current.start_time,
                      endTime: current.end_time,
                    },
                    {
                      onSuccess: () =>
                        setEdit((s) => ({ ...s, [w.id]: undefined })),
                    }
                  )
                }
                isProcessing={update.isPending}
              >
                حفظ
              </Button>
              <Button
                size="xs"
                color="light"
                onClick={() => setEdit((s) => ({ ...s, [w.id]: undefined }))}
              >
                إلغاء
              </Button>
            </>
          ) : (
            <Button
              size="xs"
              color="light"
              onClick={() =>
                setEdit((s) => ({
                  ...s,
                  [w.id]: { start_time: w.startTime, end_time: w.endTime },
                }))
              }
            >
              تعديل
            </Button>
          )}
        </div>
      </Table.Cell>
    </Table.Row>
  );
}
